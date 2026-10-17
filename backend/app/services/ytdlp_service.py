import logging
from collections.abc import Callable
from typing import Any

import yt_dlp
from yt_dlp.utils import DownloadError, ExtractorError, GeoRestrictedError

from app.core.config import settings
from app.core.security import safe_name, validate_public_url
from app.schemas.media import FormatOption, MediaInfoResponse

logger = logging.getLogger(__name__)

STANDARD_HEIGHTS = [2160, 1440, 1080, 720, 480, 360]


class YtDlpServiceError(Exception):
    def __init__(self, message: str, user_message: str):
        super().__init__(message)
        self.user_message = user_message


def extract_media_info(url: str) -> MediaInfoResponse:
    """
    Extracts metadata and available formats for a validated URL without downloading.
    """
    clean_url = validate_public_url(url)

    ydl_opts = {
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "user_agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        ),
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(clean_url, download=False)
    except GeoRestrictedError as e:
        raise YtDlpServiceError(
            str(e), "This video isn't available in our server's region."
        ) from e
    except ExtractorError as e:
        msg = str(e).lower()
        if "drm" in msg or "protected" in msg:
            raise YtDlpServiceError(
                str(e), "Protected content (DRM) can't be downloaded."
            ) from e
        if "private" in msg or "unavailable" in msg:
            raise YtDlpServiceError(
                str(e), "This video is private or no longer available."
            ) from e
        raise YtDlpServiceError(str(e), "We don't support this site yet.") from e
    except DownloadError as e:
        msg = str(e).lower()
        if "private" in msg or "sign in" in msg or "removed" in msg:
            raise YtDlpServiceError(
                str(e), "This video is private or no longer available."
            ) from e
        if "drm" in msg:
            raise YtDlpServiceError(
                str(e), "Protected content (DRM) can't be downloaded."
            ) from e
        raise YtDlpServiceError(
            str(e), "That doesn't look like a video link. Paste the full URL."
        ) from e
    except Exception as e:
        logger.error(f"Unexpected extraction error: {e}", exc_info=True)
        raise YtDlpServiceError(
            str(e), "Failed to fetch video information. Please try again."
        ) from e

    if not info:
        raise YtDlpServiceError("No video information found", "Video not found.")

    # Duration check against configured max
    duration = info.get("duration")
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
                label="Standard Quality MP4",
                height=720,
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

        options.append(
            FormatOption(
                format_id=f"bv*[height<={h}]+ba/b[height<={h}]",
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

    def hook(d: dict[str, Any]):
        if progress_callback:
            status = d.get("status")
            if status == "downloading":
                total = d.get("total_bytes") or d.get("total_bytes_estimate") or 0
                downloaded = d.get("downloaded_bytes") or 0
                percent = (
                    round((downloaded / total) * 100, 1) if total > 0 else 0.0
                )
                speed = d.get("_speed_str") or ""
                eta = d.get("eta")
                progress_callback(
                    {
                        "status": "downloading",
                        "percent": percent,
                        "speed": speed,
                        "eta": eta,
                    }
                )
            elif status == "finished":
                progress_callback(
                    {
                        "status": "merging",
                        "percent": 99.0,
                        "speed": "",
                        "eta": 0,
                    }
                )

    outtmpl = f"{target_dir}/%(title).80s.%(ext)s"

    if media_type == "audio":
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": outtmpl,
            "noplaylist": True,
            "max_filesize": settings.max_filesize_bytes,
            "restrictfilenames": True,
            "progress_hooks": [hook],
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
        ydl_opts = {
            "format": f"bv*[height<={height}]+ba/b[height<={height}]/b/best",
            "merge_output_format": "mp4",
            "outtmpl": outtmpl,
            "noplaylist": True,
            "max_filesize": settings.max_filesize_bytes,
            "restrictfilenames": True,
            "progress_hooks": [hook],
            "quiet": True,
            "no_warnings": True,
        }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(clean_url, download=True)
        if not info:
            raise YtDlpServiceError(
                "Download returned no info", "Failed to download video."
            )

        title = str(info.get("title") or "video")
        ext = "mp3" if media_type == "audio" else "mp4"
        expected_filename = safe_name(title, ext)

    return expected_filename
