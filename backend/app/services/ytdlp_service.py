import logging
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


def extract_media_info(url: str) -> MediaInfoResponse:
    """
    Extracts metadata and available formats for a validated URL without downloading.
    """
    clean_url = validate_public_url(url)
    clean_url = canonicalize_social_url(clean_url)

    ydl_opts: dict[str, Any] = {
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "extractor_args": {
            "twitter": {
                "api": ["syndication", "graphql"]
            },
        },
        "http_headers": {
            "Accept-Language": "en-US,en;q=0.9",
        },
    }

    if settings.proxy_url:
        ydl_opts["proxy"] = settings.proxy_url.get_secret_value()

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(clean_url, download=False)
    except GeoRestrictedError as e:
        raise YtDlpServiceError(
            str(e), "This video isn't available in our server's region."
        ) from e
    except (ExtractorError, DownloadError) as e:
        msg = str(e).lower()
        info = None
        # Datacenter/Cloud IP fallback: if default extraction encounters bot checks or player response failures
        if "player response" in msg or "sign in" in msg or "bot" in msg:
            try:
                fallback_opts = dict(ydl_opts)
                fallback_opts["extractor_args"] = {
                    "youtube": {
                        "player_client": ["ios", "mweb", "tv"]
                    }
                }
                with yt_dlp.YoutubeDL(fallback_opts) as ydl:
                    info = ydl.extract_info(clean_url, download=False)
            except Exception:
                info = None

        if not info:
            if "drm" in msg or "protected" in msg:
                raise YtDlpServiceError(
                    str(e), "Protected content (DRM) can't be downloaded."
                ) from e
            if "private" in msg or "unavailable" in msg or "removed" in msg:
                raise YtDlpServiceError(
                    str(e), "This video is private or no longer available."
                ) from e
            if "no video could be found" in msg or "no video formats" in msg:
                raise YtDlpServiceError(
                    str(e), "No video found at this link. Please check that this post contains a video."
                ) from e
            raise YtDlpServiceError(
                str(e), "Could not retrieve video from this link. Please verify the URL."
            ) from e
    except Exception as e:
        logger.error(f"Unexpected extraction error: {e}", exc_info=True)
        raise YtDlpServiceError(
            str(e), "Failed to fetch video information. Please try again."
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

    common_extractor_args = {
        "twitter": {
            "api": ["syndication", "graphql"]
        },
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
            "quiet": True,
            "no_warnings": True,
        }
        if merge_format:
            ydl_opts["merge_output_format"] = merge_format

    if ffmpeg_dir:
        ydl_opts["ffmpeg_location"] = ffmpeg_dir

    if settings.proxy_url:
        ydl_opts["proxy"] = settings.proxy_url.get_secret_value()

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(clean_url, download=True)
            if not info:
                raise YtDlpServiceError(
                    "Download returned no info", "Failed to download media."
                )

            title = str(info.get("title") or "video")
            ext = "mp3" if media_type == "audio" else "mp4"
            expected_filename = safe_name(title, ext)

        return expected_filename
    except DownloadError as e:
        msg = str(e)
        logger.error(f"yt-dlp download error: {msg}")
        if "ffmpeg is not installed" in msg.lower():
            raise YtDlpServiceError(
                msg,
                "FFmpeg is required to merge and process this format. "
                "Please configure FFmpeg on the server.",
            ) from e
        raise YtDlpServiceError(
            msg, "Failed to download media. Please try again."
        ) from e
    except YtDlpServiceError:
        raise
    except Exception as e:
        logger.error(f"Unexpected download error: {e}", exc_info=True)
        raise YtDlpServiceError(str(e), "Failed to download media.") from e
