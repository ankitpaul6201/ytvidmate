import json
import logging
import os
import shutil
import subprocess

logger = logging.getLogger(__name__)


class FFmpegServiceError(Exception):
    pass


def _ensure_path(directory: str) -> None:
    if not directory or not os.path.isdir(directory):
        return
    current_paths = [
        p.lower() for p in os.environ.get("PATH", "").split(os.pathsep) if p
    ]
    if directory.lower() not in current_paths:
        os.environ["PATH"] = directory + os.pathsep + os.environ.get("PATH", "")


def find_ffmpeg_path() -> str | None:
    """
    Finds the ffmpeg executable across configured settings, PATH,
    and known install locations. Automatically prepends the found
    directory to os.environ["PATH"].
    """
    try:
        from app.core.config import settings

        if settings.ffmpeg_path:
            cand = os.path.expandvars(settings.ffmpeg_path)
            if os.path.isfile(cand):
                _ensure_path(os.path.dirname(cand))
                return cand
            exe_cand = os.path.join(
                cand, "ffmpeg.exe" if os.name == "nt" else "ffmpeg"
            )
            if os.path.isfile(exe_cand):
                _ensure_path(cand)
                return exe_cand
    except Exception as e:
        logger.debug(f"Could not load settings for ffmpeg: {e}")

    found = shutil.which("ffmpeg")
    if found:
        return found

    if os.name == "nt":
        known_locations = [
            r"C:\Program Files\Softdeluxe\Free Download Manager",
            r"C:\Program Files\TOPSPEED NETWORK LIMITED\FebBox\FFmpeg",
            r"C:\ffmpeg\bin",
            r"C:\Program Files\ffmpeg\bin",
            os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Links"),
        ]
        for loc in known_locations:
            exe = os.path.join(loc, "ffmpeg.exe")
            if os.path.isfile(exe):
                _ensure_path(loc)
                return exe

        winget_pkgs = os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Packages")
        if os.path.isdir(winget_pkgs):
            try:
                for root, _, files in os.walk(winget_pkgs):
                    if "ffmpeg.exe" in (f.lower() for f in files):
                        exe = os.path.join(root, "ffmpeg.exe")
                        _ensure_path(root)
                        return exe
            except Exception:
                pass

    return None


def find_ffprobe_path() -> str | None:
    """
    Finds the ffprobe executable across configured settings, PATH,
    and adjacent to ffmpeg.
    """
    found = shutil.which("ffprobe")
    if found:
        return found

    ffmpeg_exe = find_ffmpeg_path()
    if ffmpeg_exe:
        parent = os.path.dirname(ffmpeg_exe)
        cand = os.path.join(
            parent, "ffprobe.exe" if os.name == "nt" else "ffprobe"
        )
        if os.path.isfile(cand):
            _ensure_path(parent)
            return cand

    return None


def get_ffmpeg_dir() -> str | None:
    p = find_ffmpeg_path()
    return os.path.dirname(p) if p else None


def is_ffmpeg_available() -> bool:
    return find_ffmpeg_path() is not None


def is_ffprobe_available() -> bool:
    return find_ffprobe_path() is not None


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
