import json
import logging
import os
import shutil
import subprocess

logger = logging.getLogger(__name__)


class FFmpegServiceError(Exception):
    pass


def is_ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


def is_ffprobe_available() -> bool:
    return shutil.which("ffprobe") is not None


def probe_file(file_path: str) -> dict:
    """
    Runs ffprobe to inspect streams (video, audio) and resolution without shell=True.
    """
    if not is_ffprobe_available():
        raise FFmpegServiceError("ffprobe is not installed or not on PATH")

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "stream=codec_type,width,height,codec_name",
        "-of",
        "json",
        file_path,
    ]

    try:
        res = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,
            shell=False,
            timeout=30,
            text=True,
        )
        data = json.loads(res.stdout)
        streams = data.get("streams", [])

        has_video = any(s.get("codec_type") == "video" for s in streams)
        has_audio = any(s.get("codec_type") == "audio" for s in streams)
        video_stream = next(
            (s for s in streams if s.get("codec_type") == "video"), None
        )

        width = video_stream.get("width") if video_stream else None
        height = video_stream.get("height") if video_stream else None

        return {
            "has_video": has_video,
            "has_audio": has_audio,
            "width": width,
            "height": height,
            "streams": streams,
        }
    except subprocess.SubprocessError as e:
        logger.error(f"ffprobe execution failed: {e}")
        raise FFmpegServiceError(f"ffprobe failed: {e}") from e
    except json.JSONDecodeError as e:
        raise FFmpegServiceError(f"Failed to parse ffprobe JSON output: {e}") from e


def merge_video_audio(video_path: str, audio_path: str, output_path: str) -> str:
    """
    Merges separate video and audio streams into an MP4 file.
    Does NOT use shell=True. Uses explicit argument list.
    """
    if not is_ffmpeg_available():
        raise FFmpegServiceError("ffmpeg is not installed or not on PATH")

    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    cmd = [
        "ffmpeg",
        "-nostdin",
        "-y",
        "-i",
        video_path,
        "-i",
        audio_path,
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        output_path,
    ]

    try:
        subprocess.run(
            cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            check=True,
            shell=False,
            timeout=600,
        )
        return output_path
    except subprocess.CalledProcessError as e:
        err_msg = e.stderr.decode("utf-8", errors="replace") if e.stderr else str(e)
        logger.error(f"FFmpeg merge error: {err_msg}")
        raise FFmpegServiceError(f"FFmpeg merge failed: {err_msg}") from e


def extract_audio_mp3(input_path: str, output_path: str) -> str:
    """
    Converts/extracts audio to MP3 at 192kbps without shell=True.
    """
    if not is_ffmpeg_available():
        raise FFmpegServiceError("ffmpeg is not installed or not on PATH")

    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")

    cmd = [
        "ffmpeg",
        "-nostdin",
        "-y",
        "-i",
        input_path,
        "-vn",
        "-b:a",
        "192k",
        output_path,
    ]

    try:
        subprocess.run(
            cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            check=True,
            shell=False,
            timeout=600,
        )
        return output_path
    except subprocess.CalledProcessError as e:
        err_msg = e.stderr.decode("utf-8", errors="replace") if e.stderr else str(e)
        logger.error(f"FFmpeg audio extraction error: {err_msg}")
        raise FFmpegServiceError(f"FFmpeg audio extraction failed: {err_msg}") from e
