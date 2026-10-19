from unittest.mock import MagicMock, patch

import pytest

from app.core.config import settings
from app.services.ytdlp_service import (
    YtDlpServiceError,
    extract_media_info,
)

MOCK_INFO = {
    "id": "test123",
    "title": "Sample Test Video",
    "thumbnail": "https://img.youtube.com/vi/test123/hqdefault.jpg",
    "duration": 180,
    "uploader": "Test Channel",
    "formats": [
        {"format_id": "137", "height": 1080, "ext": "mp4", "filesize": 50000000},
        {"format_id": "136", "height": 720, "ext": "mp4", "filesize": 25000000},
        {"format_id": "135", "height": 480, "ext": "mp4", "filesize": 15000000},
        {
            "format_id": "140",
            "height": None,
            "ext": "m4a",
            "vcodec": "none",
            "acodec": "aac",
        },
    ],
}


def test_extract_media_info_success():
    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_instance = MagicMock()
        mock_instance.extract_info.return_value = MOCK_INFO
        mock_ydl_cls.return_value.__enter__.return_value = mock_instance

        info = extract_media_info("https://www.youtube.com/watch?v=test123")
        assert info.id == "test123"
        assert info.title == "Sample Test Video"
        assert info.duration == 180
        assert info.uploader == "Test Channel"
        assert len(info.formats) > 0

        # Check that 1080p, 720p, 480p and MP3 options are present
        heights = [f.height for f in info.formats if f.height is not None]
        assert 1080 in heights
        assert 720 in heights
        assert 480 in heights

        # Check audio-only format exists
        audio_opt = next((f for f in info.formats if f.audio_only), None)
        assert audio_opt is not None
        assert audio_opt.ext == "mp3"


def test_extract_media_info_duration_exceeded():
    long_info = dict(MOCK_INFO, duration=settings.max_duration_seconds + 500)
    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_instance = MagicMock()
        mock_instance.extract_info.return_value = long_info
        mock_ydl_cls.return_value.__enter__.return_value = mock_instance

        with pytest.raises(YtDlpServiceError) as exc_info:
            extract_media_info("https://www.youtube.com/watch?v=test123")
        assert "exceeds limit" in str(exc_info.value)
        assert "duration limit" in exc_info.value.user_message


def test_extract_media_info_invalid_url():
    with pytest.raises(ValueError):
        extract_media_info("http://localhost/bad")


def test_download_media_audio_requires_ffmpeg(tmp_path):
    from app.services.ytdlp_service import download_media

    with patch("app.services.ytdlp_service.is_ffmpeg_available", return_value=False):
        with pytest.raises(YtDlpServiceError) as exc_info:
            download_media(
                url="https://www.youtube.com/watch?v=test123",
                target_dir=str(tmp_path),
                media_type="audio",
            )
        assert "FFmpeg is required" in exc_info.value.user_message


def test_download_media_ffmpeg_missing_error_mapped(tmp_path):
    from yt_dlp.utils import DownloadError

    from app.services.ytdlp_service import download_media

    err_msg = (
        "ERROR: You have requested merging of multiple formats but ffmpeg is "
        "not installed. Aborting due to --abort-on-error"
    )

    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_instance = MagicMock()
        mock_instance.extract_info.side_effect = DownloadError(err_msg)
        mock_ydl_cls.return_value.__enter__.return_value = mock_instance

        with pytest.raises(YtDlpServiceError) as exc_info:
            download_media(
                url="https://www.youtube.com/watch?v=test123",
                target_dir=str(tmp_path),
                media_type="video",
            )
        assert "FFmpeg is required" in exc_info.value.user_message


def test_canonicalize_social_url():
    from app.services.ytdlp_service import canonicalize_social_url

    # Twitter / X URL cleaning
    x_url = "https://x.com/username/status/1234567890?s=20&t=abcdef"
    assert canonicalize_social_url(x_url) == "https://twitter.com/username/status/1234567890"

    # Facebook Reel cleaning
    fb_reel = "https://www.facebook.com/reel/9876543210/?mibextid=rS40aB7S9Ucbxw6v"
    assert canonicalize_social_url(fb_reel) == "https://www.facebook.com/reel/9876543210/"


def test_extract_media_info_facebook_formats():
    fb_info = {
        "id": "fb123",
        "title": "Facebook Video",
        "duration": 60,
        "formats": [
            {"format_id": "sd", "ext": "mp4", "height": None},
            {"format_id": "hd", "ext": "mp4", "height": None},
        ],
    }
    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_instance = MagicMock()
        mock_instance.extract_info.return_value = fb_info
        mock_ydl_cls.return_value.__enter__.return_value = mock_instance

        info = extract_media_info("https://www.facebook.com/watch/?v=fb123")
        assert info.title == "Facebook Video"
        heights = [f.height for f in info.formats if f.height is not None]
        assert 720 in heights or 1080 in heights
        assert 360 in heights or 480 in heights


def test_extract_media_info_members_only():
    from yt_dlp.utils import DownloadError

    err_msg = "ERROR: [youtube] fzyL44FH2fI: Join this channel to get access to members-only content like this video, and other exclusive perks."
    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_instance = MagicMock()
        mock_instance.extract_info.side_effect = DownloadError(err_msg)
        mock_ydl_cls.return_value.__enter__.return_value = mock_instance

        with pytest.raises(YtDlpServiceError) as exc_info:
            extract_media_info("https://www.youtube.com/watch?v=fzyL44FH2fI")
        assert "Channel membership content cannot be downloaded" in exc_info.value.user_message


def test_download_media_members_only(tmp_path):
    from yt_dlp.utils import DownloadError

    from app.services.ytdlp_service import download_media

    err_msg = "ERROR: [youtube] fzyL44FH2fI: Join this channel to get access to members-only content like this video, and other exclusive perks."
    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_instance = MagicMock()
        mock_instance.extract_info.side_effect = DownloadError(err_msg)
        mock_ydl_cls.return_value.__enter__.return_value = mock_instance

        with pytest.raises(YtDlpServiceError) as exc_info:
            download_media(
                url="https://www.youtube.com/watch?v=fzyL44FH2fI",
                target_dir=str(tmp_path),
                media_type="video",
            )
        assert "Channel membership content cannot be downloaded" in exc_info.value.user_message


def test_extract_media_info_404_not_found():
    from yt_dlp.utils import DownloadError

    err_msg = "ERROR: [youtube] abc1234: Video unavailable. This video does not exist"
    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_instance = MagicMock()
        mock_instance.extract_info.side_effect = DownloadError(err_msg)
        mock_ydl_cls.return_value.__enter__.return_value = mock_instance

        with pytest.raises(YtDlpServiceError) as exc_info:
            extract_media_info("https://www.youtube.com/watch?v=abc1234")
        assert "Video not found (404)" in exc_info.value.user_message


def test_extract_media_info_503_unavailable():
    from yt_dlp.utils import DownloadError

    err_msg = "HTTP Error 503: Service Temporarily Unavailable"
    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_instance = MagicMock()
        mock_instance.extract_info.side_effect = DownloadError(err_msg)
        mock_ydl_cls.return_value.__enter__.return_value = mock_instance

        with pytest.raises(YtDlpServiceError) as exc_info:
            extract_media_info("https://www.youtube.com/watch?v=abc1234")
        assert "temporarily unavailable (HTTP 503)" in exc_info.value.user_message


def test_extract_media_info_unsupported_platform():
    from yt_dlp.utils import DownloadError

    err_msg = "ERROR: Unsupported URL: https://example.com/page"
    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_instance = MagicMock()
        mock_instance.extract_info.side_effect = DownloadError(err_msg)
        mock_ydl_cls.return_value.__enter__.return_value = mock_instance

        with pytest.raises(YtDlpServiceError) as exc_info:
            extract_media_info("https://example.com/page")
        assert "platform or website is not supported" in exc_info.value.user_message


def test_extract_media_info_live_stream():
    from yt_dlp.utils import DownloadError

    err_msg = "ERROR: [youtube] live123: This video is a live stream. Recordings are not available."
    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_instance = MagicMock()
        mock_instance.extract_info.side_effect = DownloadError(err_msg)
        mock_ydl_cls.return_value.__enter__.return_value = mock_instance

        with pytest.raises(YtDlpServiceError) as exc_info:
            extract_media_info("https://www.youtube.com/watch?v=live123")
        assert "Live streams cannot be downloaded" in exc_info.value.user_message


def test_extract_media_info_age_restricted():
    from yt_dlp.utils import DownloadError

    err_msg = "ERROR: [youtube] age123: Sign in to confirm your age. This video may be inappropriate for some users."
    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_instance = MagicMock()
        mock_instance.extract_info.side_effect = DownloadError(err_msg)
        mock_ydl_cls.return_value.__enter__.return_value = mock_instance

        with pytest.raises(YtDlpServiceError) as exc_info:
            extract_media_info("https://www.youtube.com/watch?v=age123")
        assert "website has no login function" in exc_info.value.user_message


def test_extract_media_info_rate_limited():
    from yt_dlp.utils import DownloadError

    err_msg = "HTTP Error 429: Too Many Requests"
    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_instance = MagicMock()
        mock_instance.extract_info.side_effect = DownloadError(err_msg)
        mock_ydl_cls.return_value.__enter__.return_value = mock_instance

        with pytest.raises(YtDlpServiceError) as exc_info:
            extract_media_info("https://www.youtube.com/watch?v=rate123")
        assert "temporarily limiting requests" in exc_info.value.user_message


def test_proxy_402_error_mapping():
    from yt_dlp.utils import DownloadError

    err_msg = (
        "Unable to download API page: <urlopen error Tunnel connection failed: "
        "402 Payment Required> (caused by ProxyError('<urlopen error Tunnel connection failed: 402 Payment Required>'))"
    )
    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_instance = MagicMock()
        mock_instance.extract_info.side_effect = DownloadError(err_msg)
        mock_ydl_cls.return_value.__enter__.return_value = mock_instance

        with pytest.raises(YtDlpServiceError) as exc_info:
            extract_media_info("https://www.youtube.com/watch?v=proxyfail")
        assert "402" in exc_info.value.user_message
        assert "proxy" in exc_info.value.user_message.lower()




