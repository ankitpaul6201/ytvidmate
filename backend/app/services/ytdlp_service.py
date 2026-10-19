import logging
import os
import re
from collections.abc import Callable
from typing import Any
from urllib.parse import urlparse

import httpx
import yt_dlp
from yt_dlp.utils import DownloadError, ExtractorError, GeoRestrictedError

from app.core.config import settings
from app.core.security import safe_name, validate_public_url
from app.schemas.media import FormatOption, MediaInfoResponse
from app.services.ffmpeg_service import get_ffmpeg_dir, is_ffmpeg_available

logger = logging.getLogger(__name__)

STANDARD_HEIGHTS = [2160, 1440, 1080, 720, 480, 360]


def canonicalize_social_url(url: str) -> str:
    """
    Unshortens and cleans social media URLs (Facebook share links, fb.watch, pin.it, t.co, x.com).
    Ensures canonical URLs match yt-dlp's specialized extractors.
    SSRF validation is enforced on the resolved URL.
    """
    if not url or not isinstance(url, str):
        return url

    clean = url.strip()
    try:
        parsed = urlparse(clean)
    except Exception:
        return clean

    host = (parsed.hostname or "").lower()

    # 1. Clean Twitter / X URLs (strip tracking query params and trailing /video/N)
    if "x.com" in host or "twitter.com" in host:
        clean_path = re.sub(r"/video/\d+/?$", "", parsed.path).rstrip("/")
        return f"https://twitter.com{clean_path}"

    # 2. Clean direct Pinterest URLs (strip tracking query params like /sent/?invite_code=...)
    if "pinterest.com" in host:
        pin_match = re.search(r"/pin/(\d+)", parsed.path)
        if pin_match:
            return f"https://www.pinterest.com/pin/{pin_match.group(1)}/"

    # 3. Clean direct Facebook URLs (e.g. /videos/<id>/, /reel/<id>/)
    if "facebook.com" in host:
        if "/reel/" in parsed.path:
            reel_match = re.search(r"/reel/(\d+)", parsed.path)
            if reel_match:
                return f"https://www.facebook.com/reel/{reel_match.group(1)}/"
        elif "/videos/" in parsed.path:
            video_match = re.search(r"/videos/(\d+)", parsed.path)
            if video_match:
                return f"https://www.facebook.com/watch/?v={video_match.group(1)}"

    # 4. Check for redirect domains: pin.it, fb.watch, t.co, facebook.com/share/
    needs_resolve = (
        "pin.it" in host
        or "fb.watch" in host
        or "t.co" in host
        or ("facebook.com" in host and "/share/" in parsed.path)
    )

    if needs_resolve:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
        try:
            with httpx.Client(headers=headers, follow_redirects=True, timeout=8.0) as client:
                resp = client.get(clean)
                final_url = str(resp.url)

                # Look through redirect history for deep link targets (/pin/, /reel/, /watch/, /videos/)
                for h in resp.history:
                    loc = h.headers.get("location") or ""
                    if any(target in loc for target in ("/pin/", "/reel/", "/watch/", "/videos/")):
                        final_url = loc
                        break

                if final_url and final_url != clean:
                    p_final = urlparse(final_url)
                    p_host = (p_final.hostname or "").lower()

                    # Clean Facebook URLs
                    if "facebook.com" in p_host:
                        reel_match = re.search(r"/(?:reel|videos)/(\d+)", p_final.path)
                        if reel_match:
                            final_url = f"https://www.facebook.com/reel/{reel_match.group(1)}/"

                    # Strip extraneous query tracking parameters on Pinterest
                    if "pinterest.com" in p_host:
                        pin_match = re.search(r"/pin/(\d+)", p_final.path)
                        if pin_match:
                            final_url = f"https://www.pinterest.com/pin/{pin_match.group(1)}/"

                    # Validate resolved URL through SSRF filter
                    return validate_public_url(final_url)
        except Exception as e:
            logger.debug(f"Social URL unshorten skipped: {e}")

    return clean


class YtDlpServiceError(Exception):
    def __init__(self, message: str, user_message: str):
        super().__init__(message)
        self.user_message = user_message


def map_ytdlp_error_to_user_message(raw_error: str) -> str:
    """Translates raw yt-dlp error output into clear, friendly, user-facing guidance."""
    msg = (raw_error or "").lower()

    # 1. Channel membership / paywalls
    if any(k in msg for k in ["members-only", "join this channel", "members only", "membership"]):
        return (
            "Channel membership content cannot be downloaded. "
            "YTVidMate only supports publicly accessible videos."
        )

    # 2. DRM / Protected
    if "drm" in msg or "protected content" in msg:
        return "Protected content (DRM) cannot be downloaded."

    # 3. Live stream in progress
    if any(k in msg for k in ["is a live stream", "live event", "live stream recording"]):
        return "Live streams cannot be downloaded."

    # 4. HTTP 404 / Video removed or not found
    if any(k in msg for k in ["404", "not found", "does not exist", "video unavailable", "removed by the uploader"]):
        return "Video not found (404). This video may have been deleted, removed, or the link is incorrect."

    # 5. HTTP 503 / 502 / Server down / temporarily unavailable
    if any(k in msg for k in ["503", "502", "504", "service unavailable", "bad gateway", "temporarily unavailable"]):
        return "The video platform is temporarily unavailable (HTTP 503). Please try again in a few moments."

    # 6. HTTP 429 / Rate limit
    if any(k in msg for k in ["429", "too many requests", "rate limit"]):
        return "The video platform is temporarily limiting requests. Please wait a minute before trying again."

    # 6b. Bot block / Cloud Datacenter IP block
    if any(k in msg for k in [
        "failed to extract any player response",
        "all player responses are invalid",
        "your ip is likely being blocked",
        "sign in to confirm you're not a bot",
        "bot verification",
    ]):
        return (
            "YouTube is blocking anonymous downloads from this cloud server's IP address. "
            "Please configure YOUTUBE_COOKIES or a valid PROXY_URL in the server environment settings."
        )

    # 7. Private video
    if "private" in msg:
        return "This video is private and cannot be accessed. Only public videos can be downloaded."

    # 8. Age-restricted / Login required
    if any(k in msg for k in ["age-restricted", "confirm your age", "sign in to view", "requires authentication"]):
        return "Age-restricted videos cannot be downloaded because this website has no login function."

    # 9. Geo-restricted / Blocked in country
    if any(k in msg for k in ["not available in your country", "blocked in your country", "geo-restricted", "geographic"]):
        return "This video is not available in our server's region due to country restrictions."

    # 10. Unsupported website / platform
    if any(k in msg for k in ["unsupported url", "no suitable extractor"]):
        return (
            "This platform or website is not supported. "
            "Please paste a link from YouTube, Instagram, Facebook, TikTok, Twitter/X, or Pinterest."
        )

    # 11. No video found in post (e.g. text or image post)
    if any(k in msg for k in ["no video could be found", "no video formats"]):
        return "No video found at this link. Please check that this post contains a video."

    # 12. Proxy exhausted / 402 Payment Required / Proxy Tunnel failure
    if any(k in msg for k in ["402", "payment required", "proxyerror", "tunnel connection failed"]):
        return (
            "The download proxy service has exhausted its bandwidth or requires renewal (HTTP 402). "
            "Please check proxy subscription settings."
        )

    # Default fallback
    return "Could not retrieve video from this link. Please verify the URL and try again."



class YtDlpQuietLogger:
    """
    Prevents yt-dlp from dumping raw error stack traces to sys.stderr on intermediate attempts.
    """

    def debug(self, msg: str):
        pass

    def info(self, msg: str):
        pass

    def warning(self, msg: str):
        pass

    def error(self, msg: str):
        logger.debug(f"[yt-dlp internal]: {msg}")


def normalize_cookie_content(text: str) -> str:
    """
    Normalizes Netscape cookie content where tabs may have been converted to spaces.
    Ensures exactly 7 tab-delimited columns for valid Netscape cookie jar format.
    """
    normalized_lines: list[str] = []
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            normalized_lines.append(line)
            continue
        parts = re.split(r"\s+", line, maxsplit=6)
        if len(parts) == 7:
            normalized_lines.append("\t".join(parts))
        elif len(parts) == 6:
            normalized_lines.append("\t".join(parts) + "\t")
        else:
            normalized_lines.append(line)
    return "\n".join(normalized_lines) + "\n"


def get_cookie_file_path() -> str | None:
    """
    Locates or prepares a cookies file to bypass cloud/datacenter IP restrictions.
    Supports local cookies.txt, /app/cookies.txt, or YOUTUBE_COOKIES environment variable.
    """
    for loc in ["cookies.txt", "/app/cookies.txt"]:
        if os.path.isfile(loc) and os.path.getsize(loc) > 10:
            return loc

    if settings.youtube_cookies:
        cookie_file = os.path.join(settings.tmp_dir, "cookies.txt")
        try:
            os.makedirs(settings.tmp_dir, exist_ok=True)
            norm = normalize_cookie_content(settings.youtube_cookies.get_secret_value())
            with open(cookie_file, "w", encoding="utf-8") as f:
                f.write(norm)
            return cookie_file
        except Exception as e:
            logger.error(f"Failed to write cookies from env: {e}")

    temp_loc = os.path.join(settings.tmp_dir, "cookies.txt")
    if os.path.isfile(temp_loc) and os.path.getsize(temp_loc) > 10:
        return temp_loc

    return None


def is_youtube_url(url: str) -> bool:
    """
    Checks if a URL belongs to YouTube.
    """
    try:
        host = (urlparse(url).hostname or "").lower()
        return "youtube.com" in host or "youtu.be" in host
    except Exception:
        return False


def get_proxy_urls() -> list[str]:
    """
    Parses configured proxy URL or comma/newline-delimited proxy pool list.
    """
    if not settings.proxy_url:
        return []
    raw = settings.proxy_url.get_secret_value()
    return [p.strip() for p in re.split(r"[,;\n]+", raw) if p.strip()]


def get_active_proxy(exclude: set[str] | None = None) -> str | None:
    """
    Returns an active proxy URL from the configured pool, optionally excluding failed proxies.
    """
    proxies = get_proxy_urls()
    if not proxies:
        return None
    available = [p for p in proxies if p not in (exclude or set())]
    if not available:
        available = proxies
    import random
    return random.choice(available)


def extract_media_info(url: str) -> MediaInfoResponse:
    """
    Extracts metadata and available formats for a validated URL without downloading.
    """
    clean_url = validate_public_url(url)
    clean_url = canonicalize_social_url(clean_url)
    is_yt = is_youtube_url(clean_url)

    ydl_opts: dict[str, Any] = {
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "logger": YtDlpQuietLogger(),
        "remote_components": ["ejs:github"],
        "js_runtimes": {"node": {}, "deno": {}},
        "extractor_args": {
            "youtube": {
                "player_client": ["android", "visionos"] if not settings.pot_provider_url else ["android", "visionos", "web", "ios"],
                "player_skip": ["webpage", "configs"],
            },
            "twitter": {
                "api": ["syndication", "graphql"]
            },
        },
        "http_headers": {
            "Accept-Language": "en-US,en;q=0.9",
        },
    }

    if settings.pot_provider_url:
        ydl_opts["extractor_args"]["youtubepot-bgutilhttp"] = {
            "base_url": settings.pot_provider_url
        }

    cookie_file = get_cookie_file_path()
    if cookie_file:
        ydl_opts["cookiefile"] = cookie_file
        print(f"[YTVidMate yt-dlp] Authenticated cookies loaded ({cookie_file})", flush=True)

    active_proxy = get_active_proxy()
    if active_proxy:
        ydl_opts["proxy"] = active_proxy

    info = None
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(clean_url, download=False)
    except GeoRestrictedError as e:
        raise YtDlpServiceError(
            str(e), "This video isn't available in our server's region."
        ) from e
    except (ExtractorError, DownloadError) as e:
        msg = str(e).lower()
        print(f"[YTVidMate yt-dlp] Initial extraction error: {e}", flush=True)
        info = None

        # Fallback 1: If proxy pool has alternative proxies and current attempt failed
        proxies_pool = get_proxy_urls()
        if not info and active_proxy and len(proxies_pool) > 1:
            other_proxy = get_active_proxy(exclude={active_proxy})
            if other_proxy and other_proxy != active_proxy:
                print("[YTVidMate yt-dlp] Retrying extraction with alternative proxy...", flush=True)
                proxy_opts = dict(ydl_opts)
                proxy_opts["proxy"] = other_proxy
                try:
                    with yt_dlp.YoutubeDL(proxy_opts) as ydl:
                        info = ydl.extract_info(clean_url, download=False)
                except Exception as p_err:
                    print(f"[YTVidMate yt-dlp] Alternative proxy retry failed: {p_err}", flush=True)
                    info = None
                    msg = f"{msg} {str(p_err).lower()}"

        # Fallback 1b: If proxy failed (e.g. 402, tunnel error, transport error, or block), retry direct without proxy
        if not info and active_proxy:
            print("[YTVidMate yt-dlp] Proxy failed; retrying extraction directly without proxy...", flush=True)
            direct_opts = dict(ydl_opts)
            direct_opts.pop("proxy", None)
            if is_yt:
                direct_opts["extractor_args"] = dict(direct_opts.get("extractor_args", {}))
                direct_opts["extractor_args"]["youtube"] = {
                    "player_client": ["visionos", "android"]
                }
            try:
                with yt_dlp.YoutubeDL(direct_opts) as ydl:
                    info = ydl.extract_info(clean_url, download=False)
            except Exception as d_err:
                print(f"[YTVidMate yt-dlp] Direct extraction retry failed: {d_err}", flush=True)
                info = None
                msg = f"{msg} {str(d_err).lower()}"

        # Fallback 1c: If YouTube extraction failed, retry explicitly with player_skip and android/visionos
        if not info and is_yt:
            print("[YTVidMate yt-dlp] YouTube extraction failed; retrying with player_skip=webpage,configs and android/visionos...", flush=True)
            yt_clean_opts = dict(ydl_opts)
            yt_clean_opts["extractor_args"] = dict(yt_clean_opts.get("extractor_args", {}))
            yt_clean_opts["extractor_args"]["youtube"] = {
                "player_client": ["android", "visionos"],
                "player_skip": ["webpage", "configs"],
            }
            try:
                with yt_dlp.YoutubeDL(yt_clean_opts) as ydl:
                    info = ydl.extract_info(clean_url, download=False)
            except Exception as yt_err:
                print(f"[YTVidMate yt-dlp] VisionOS/Android player_skip retry failed: {yt_err}", flush=True)
                info = None
                msg = f"{msg} {str(yt_err).lower()}"

        # Fallback 2: If YouTube extraction failed and cookies exist, try with authenticated cookies
        if not info and is_yt and cookie_file:
            print("[YTVidMate yt-dlp] Retrying YouTube extraction with authenticated cookies...", flush=True)
            cookie_opts = dict(ydl_opts)
            cookie_opts["cookiefile"] = cookie_file
            try:
                with yt_dlp.YoutubeDL(cookie_opts) as ydl:
                    info = ydl.extract_info(clean_url, download=False)
            except Exception as c_err:
                print(f"[YTVidMate yt-dlp] Cookie attempt failed: {c_err}", flush=True)
                info = None

        # Fallback 3: If a non-YouTube extraction failed while using cookies, retry without cookies
        if not info and "cookiefile" in ydl_opts:
            print("[YTVidMate yt-dlp] Retrying anonymously without cookies...", flush=True)
            retry_opts = dict(ydl_opts)
            del retry_opts["cookiefile"]
            try:
                with yt_dlp.YoutubeDL(retry_opts) as ydl:
                    info = ydl.extract_info(clean_url, download=False)
            except Exception as retry_err:
                print(f"[YTVidMate yt-dlp] Retry without cookies failed: {retry_err}", flush=True)
                info = None
                msg = str(retry_err).lower()

        if not info:
            print(f"[YTVidMate yt-dlp] All extraction attempts failed. Final mapped message: {map_ytdlp_error_to_user_message(msg)}", flush=True)
            raise YtDlpServiceError(str(e), map_ytdlp_error_to_user_message(msg)) from e
    except GeoRestrictedError as e:
        raise YtDlpServiceError(
            str(e), "This video is not available in our server's region due to country restrictions."
        ) from e
    except YtDlpServiceError:
        raise
    except Exception as e:
        logger.error(f"Unexpected extraction error: {e}", exc_info=True)
        raise YtDlpServiceError(
            str(e), map_ytdlp_error_to_user_message(str(e))
        ) from e

    if not info:
        raise YtDlpServiceError("No video information found", "Video not found.")

    # Duration check against configured max
    raw_duration = info.get("duration")
    duration: int | None = None
    if raw_duration is not None:
        try:
            duration = int(round(float(raw_duration)))
        except (ValueError, TypeError):
            duration = None

    if duration and duration > settings.max_duration_seconds:
        limit_hrs = settings.max_duration_seconds // 3600
        raise YtDlpServiceError(
            f"Duration {duration}s exceeds limit",
            f"This video is over our duration limit ({limit_hrs} hrs).",
        )

    raw_formats = info.get("formats") or []
    available_heights: set[int] = set()
    height_sizes: dict[int, int] = {}

    for f in raw_formats:
        h = f.get("height")
        if not h or not isinstance(h, int) or h <= 0:
            # Fallback heuristics for non-numerical heights (Facebook, Twitter, Pinterest, TikTok)
            w = f.get("width")
            if w and isinstance(w, int) and w > 0:
                h = int(w * 9 / 16) if w > 640 else w
            elif f.get("resolution"):
                res_match = re.search(r"x(\d+)", str(f.get("resolution")))
                if res_match:
                    h = int(res_match.group(1))
            elif f.get("format_note"):
                fn = str(f.get("format_note")).lower()
                if "1080" in fn:
                    h = 1080
                elif "720" in fn or "hd" in fn:
                    h = 720
                elif "480" in fn:
                    h = 480
                elif "360" in fn or "sd" in fn:
                    h = 360
            elif f.get("format_id"):
                fid = str(f.get("format_id")).lower()
                if "1080" in fid:
                    h = 1080
                elif "720" in fid or fid == "hd":
                    h = 720
                elif "480" in fid:
                    h = 480
                elif "360" in fid or fid == "sd":
                    h = 360

        if h and isinstance(h, int) and h > 0:
            available_heights.add(h)
            size = f.get("filesize") or f.get("filesize_approx")
            if size and (h not in height_sizes or size > height_sizes[h]):
                height_sizes[h] = size

    # Build format options
    options: list[FormatOption] = []

    # Map standard heights if present, or add raw available heights
    all_target_heights = sorted(
        {h for h in STANDARD_HEIGHTS if any(ah >= h for ah in available_heights)}
        | {h for h in available_heights if h in STANDARD_HEIGHTS},
        reverse=True,
    )

    if not all_target_heights and available_heights:
        all_target_heights = sorted(available_heights, reverse=True)[:4]

    if not all_target_heights:
        options.append(
            FormatOption(
                format_id="best/b",
                label="Best Quality MP4",
                height=1080,
                ext="mp4",
                filesize_approx=None,
                audio_only=False,
            )
        )

    for h in all_target_heights:
        approx = height_sizes.get(h)
        label = f"{h}p MP4"
        if h >= 2160:
            label = "4K (2160p) MP4"
        elif h >= 1440:
            label = "2K (1440p) MP4"
        elif h >= 1080:
            label = "1080p Full HD MP4"
        elif h >= 720:
            label = "720p HD MP4"
        elif h >= 480:
            label = "480p Standard MP4"
        elif h >= 360:
            label = "360p Mobile MP4"

        options.append(
            FormatOption(
                format_id=f"bv*[height<={h}]+ba/b[height<={h}]/b/best",
                label=label,
                height=h,
                ext="mp4",
                filesize_approx=approx,
                audio_only=False,
            )
        )

    # Always provide audio-only MP3 option
    options.append(
        FormatOption(
            format_id="bestaudio/best",
            label="MP3 (192kbps Audio)",
            height=None,
            ext="mp3",
            filesize_approx=None,
            audio_only=True,
        )
    )

    return MediaInfoResponse(
        id=str(info.get("id") or "video"),
        title=str(info.get("title") or "Video"),
        thumbnail=info.get("thumbnail"),
        duration=duration,
        uploader=info.get("uploader"),
        formats=options,
    )


def download_media(
    url: str,
    target_dir: str,
    height: int = 1080,
    media_type: str = "video",
    progress_callback: Callable[[dict[str, Any]], None] | None = None,
) -> str:
    """
    Downloads media to target_dir. Returns the absolute path of the generated file.
    Does NOT use shell=True. Calls yt-dlp Python API.
    """
    clean_url = validate_public_url(url)
    clean_url = canonicalize_social_url(clean_url)

    current_max_percent = [0]

    def hook(d: dict[str, Any]):
        if not progress_callback:
            return

        status = d.get("status")
        if status == "downloading":
            raw_percent = 0.0

            # 1. Parse yt-dlp's pre-calculated percent string if available
            pct_str = d.get("_percent_str")
            if pct_str:
                import re

                clean = re.sub(
                    r"\x1b\[[0-9;]*m", "", str(pct_str)
                ).replace("%", "").strip()
                try:
                    raw_percent = float(clean)
                except ValueError:
                    raw_percent = 0.0

            # 2. Check downloaded / total bytes if percent string not parsed
            if raw_percent <= 0.0:
                total = (
                    d.get("total_bytes") or d.get("total_bytes_estimate") or 0
                )
                downloaded = d.get("downloaded_bytes") or 0
                if total > 0 and downloaded > 0:
                    raw_percent = (downloaded / total) * 100.0

            # 3. Check fragment counts for DASH/HLS streams
            if raw_percent <= 0.0:
                frag_idx = d.get("fragment_index")
                frag_cnt = d.get("fragment_count")
                if frag_idx is not None and frag_cnt and frag_cnt > 0:
                    raw_percent = (frag_idx / frag_cnt) * 100.0

            # Convert to whole number integer percentage matching terminal output
            int_percent = int(max(0, min(99, round(raw_percent))))

            # Enforce non-decreasing progression
            int_percent = max(current_max_percent[0], int_percent)
            current_max_percent[0] = int_percent

            raw_speed = d.get("_speed_str") or ""
            import re

            speed = re.sub(r"\x1b\[[0-9;]*m", "", raw_speed).strip()
            eta = d.get("eta")

            progress_callback(
                {
                    "status": "downloading",
                    "percent": int_percent,
                    "speed": speed,
                    "eta": eta,
                }
            )
        elif status == "finished":
            current_max_percent[0] = max(current_max_percent[0], 99)
            progress_callback(
                {
                    "status": "merging",
                    "percent": 99,
                    "speed": "",
                    "eta": 0,
                }
            )

    outtmpl = f"{target_dir}/%(title).80s.%(ext)s"
    ffmpeg_dir = get_ffmpeg_dir()
    ffmpeg_available = is_ffmpeg_available()

    is_yt = is_youtube_url(clean_url)
    common_extractor_args: dict[str, Any] = {
        "youtube": {
            "player_client": ["android", "visionos"] if not settings.pot_provider_url else ["android", "visionos", "web", "ios"],
            "player_skip": ["webpage", "configs"],
        },
        "twitter": {
            "api": ["syndication", "graphql"]
        },
    }
    if settings.pot_provider_url:
        common_extractor_args["youtubepot-bgutilhttp"] = {
            "base_url": settings.pot_provider_url
        }

    if media_type == "audio":
        if not ffmpeg_available:
            raise YtDlpServiceError(
                "FFmpeg is not installed",
                "FFmpeg is required to extract audio into MP3 format. "
                "Please install or configure FFmpeg.",
            )
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": outtmpl,
            "noplaylist": True,
            "max_filesize": settings.max_filesize_bytes,
            "restrictfilenames": True,
            "progress_hooks": [hook],
            "extractor_args": common_extractor_args,
            "http_headers": {
                "Accept-Language": "en-US,en;q=0.9",
            },
            "socket_timeout": 30,
            "retries": 10,
            "fragment_retries": 10,
            "concurrent_fragment_downloads": 4,
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ],
            "quiet": True,
            "no_warnings": True,
        }
    else:
        if ffmpeg_available:
            format_spec = (
                f"bv*[height<={height}]+ba/b[height<={height}]/"
                f"hd/sd/b/best"
            )
            merge_format = "mp4"
        else:
            format_spec = f"b[height<={height}]/hd/sd/b/best"
            merge_format = None

        ydl_opts = {
            "format": format_spec,
            "outtmpl": outtmpl,
            "noplaylist": True,
            "max_filesize": settings.max_filesize_bytes,
            "restrictfilenames": True,
            "progress_hooks": [hook],
            "extractor_args": common_extractor_args,
            "http_headers": {
                "Accept-Language": "en-US,en;q=0.9",
            },
            "socket_timeout": 30,
            "retries": 10,
            "fragment_retries": 10,
            "concurrent_fragment_downloads": 4,
            "quiet": True,
            "no_warnings": True,
        }
        if merge_format:
            ydl_opts["merge_output_format"] = merge_format

    ydl_opts["logger"] = YtDlpQuietLogger()
    ydl_opts["remote_components"] = ["ejs:github"]
    ydl_opts["js_runtimes"] = {"node": {}, "deno": {}}

    if ffmpeg_dir:
        ydl_opts["ffmpeg_location"] = ffmpeg_dir

    active_proxy = get_active_proxy()
    if active_proxy:
        ydl_opts["proxy"] = active_proxy

    cookie_file = get_cookie_file_path()
    if cookie_file:
        ydl_opts["cookiefile"] = cookie_file
        print(f"[YTVidMate yt-dlp] Authenticated cookies loaded for download ({cookie_file})", flush=True)

    info = None
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(clean_url, download=True)
    except DownloadError as e:
        msg = str(e)
        logger.warning(f"yt-dlp download attempt failed: {msg}")
        lower_msg = msg.lower()
        if "ffmpeg is not installed" in lower_msg:
            raise YtDlpServiceError(
                msg,
                "FFmpeg is required to merge and process this format. "
                "Please configure FFmpeg on the server.",
            ) from e

        # Fallback 1: If proxy failed (e.g. 402, proxy/tunnel error, transport error), try alternate or direct
        proxies_pool = get_proxy_urls()
        if not info and active_proxy:
            if len(proxies_pool) > 1:
                other_proxy = get_active_proxy(exclude={active_proxy})
                if other_proxy and other_proxy != active_proxy:
                    print("[YTVidMate yt-dlp] Retrying download with alternative proxy from pool...", flush=True)
                    p_opts = dict(ydl_opts)
                    p_opts["proxy"] = other_proxy
                    try:
                        with yt_dlp.YoutubeDL(p_opts) as ydl:
                            info = ydl.extract_info(clean_url, download=True)
                    except DownloadError as p_err:
                        print(f"[YTVidMate yt-dlp] Alternative proxy download failed: {p_err}", flush=True)
                        lower_msg = f"{lower_msg} {str(p_err).lower()}"

            # Fallback directly without proxy if proxy provider is out of quota (402) or unreachable
            if not info:
                print("[YTVidMate yt-dlp] Proxy failed or exhausted; retrying download directly without proxy...", flush=True)
                direct_opts = dict(ydl_opts)
                direct_opts.pop("proxy", None)
                if is_yt:
                    direct_opts["extractor_args"] = dict(direct_opts.get("extractor_args", {}))
                    direct_opts["extractor_args"]["youtube"] = {
                        "player_client": ["visionos", "android"]
                    }
                try:
                    with yt_dlp.YoutubeDL(direct_opts) as ydl:
                        info = ydl.extract_info(clean_url, download=True)
                except DownloadError as d_err:
                    msg = str(d_err)
                    print(f"[YTVidMate yt-dlp] Direct download retry failed: {msg}", flush=True)
                    lower_msg = f"{lower_msg} {msg.lower()}"

        # Fallback 1c: If YouTube download failed, retry cleanly with player_skip and android/visionos
        if not info and is_yt:
            print("[YTVidMate yt-dlp] YouTube download failed; retrying cleanly with player_skip and android/visionos...", flush=True)
            yt_clean_opts = dict(ydl_opts)
            yt_clean_opts["extractor_args"] = dict(yt_clean_opts.get("extractor_args", {}))
            yt_clean_opts["extractor_args"]["youtube"] = {
                "player_client": ["android", "visionos"],
                "player_skip": ["webpage", "configs"],
            }
            try:
                with yt_dlp.YoutubeDL(yt_clean_opts) as ydl:
                    info = ydl.extract_info(clean_url, download=True)
            except DownloadError as yt_err:
                msg = str(yt_err)
                print(f"[YTVidMate yt-dlp] VisionOS/Android download retry failed: {msg}", flush=True)
                lower_msg = f"{lower_msg} {msg.lower()}"

        # Fallback 2: If YouTube download failed and cookies exist, try with authenticated cookies
        if not info and is_yt and cookie_file:
            print("[YTVidMate yt-dlp] Retrying YouTube download with authenticated cookies...", flush=True)
            cookie_opts = dict(ydl_opts)
            cookie_opts["cookiefile"] = cookie_file
            try:
                with yt_dlp.YoutubeDL(cookie_opts) as ydl:
                    info = ydl.extract_info(clean_url, download=True)
            except DownloadError as c_err:
                msg = str(c_err)
                print(f"[YTVidMate yt-dlp] Cookie download attempt failed: {msg}", flush=True)
                lower_msg = f"{lower_msg} {msg.lower()}"

        # If download failed with cookies (stale/reload/IP restriction), retry cleanly without cookies
        if not info and "cookiefile" in ydl_opts:
            print("[YTVidMate yt-dlp] Retrying download anonymously without cookies...", flush=True)
            retry_opts = dict(ydl_opts)
            del retry_opts["cookiefile"]
            try:
                with yt_dlp.YoutubeDL(retry_opts) as ydl:
                    info = ydl.extract_info(clean_url, download=True)
            except DownloadError as retry_err:
                msg = str(retry_err)
                print(f"[YTVidMate yt-dlp] Retry without cookies failed: {msg}", flush=True)
                lower_retry = msg.lower()
                if "ffmpeg is not installed" in lower_retry:
                    raise YtDlpServiceError(
                        msg,
                        "FFmpeg is required to merge and process this format. "
                        "Please configure FFmpeg on the server.",
                    ) from retry_err
                raise YtDlpServiceError(
                    msg,
                    map_ytdlp_error_to_user_message(msg),
                ) from retry_err
        else:
            logger.error(f"yt-dlp download error: {msg}")
            raise YtDlpServiceError(
                msg, map_ytdlp_error_to_user_message(msg)
            ) from e

    except YtDlpServiceError:
        raise
    except Exception as e:
        logger.error(f"Unexpected download error: {e}", exc_info=True)
        raise YtDlpServiceError(str(e), "Failed to download media.") from e

    if not info:
        raise YtDlpServiceError(
            "Download returned no info", "Failed to download media."
        )

    title = str(info.get("title") or "video")
    ext = "mp3" if media_type == "audio" else "mp4"
    return safe_name(title, ext)
