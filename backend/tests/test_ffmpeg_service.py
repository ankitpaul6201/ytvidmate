import json
from unittest.mock import MagicMock, patch

import pytest

from app.services.ffmpeg_service import (
    extract_audio_mp3,
    merge_video_audio,
    probe_file,
)


def test_probe_file_missing():
    with patch("shutil.which", return_value="C:\\ffmpeg\\ffprobe.exe"):
        with pytest.raises(FileNotFoundError):
            probe_file("non_existent_file.mp4")


def test_probe_file_success(tmp_path):
    dummy_file = tmp_path / "dummy.mp4"
    dummy_file.write_text("sample content")

    mock_probe_output = {
        "streams": [
            {
                "codec_type": "video",
                "codec_name": "h264",
                "width": 1920,
                "height": 1080,
            },
            {"codec_type": "audio", "codec_name": "aac"},
        ]
    }

    mock_res = MagicMock()
    mock_res.stdout = json.dumps(mock_probe_output)

    with patch("shutil.which", return_value="C:\\ffmpeg\\ffprobe.exe"):
        with patch("subprocess.run", return_value=mock_res) as mock_sub:
            result = probe_file(str(dummy_file))
            assert result["has_video"] is True
            assert result["has_audio"] is True
            assert result["width"] == 1920
            assert result["height"] == 1080

            # Verify shell=False was enforced
            mock_sub.assert_called_once()
            _, kwargs = mock_sub.call_args
            assert kwargs.get("shell") is False


def test_merge_video_audio_missing_files():
    with patch("shutil.which", return_value="C:\\ffmpeg\\ffmpeg.exe"):
        with pytest.raises(FileNotFoundError):
            merge_video_audio(
                "non_existent_video.mp4",
                "non_existent_audio.m4a",
                "out.mp4",
            )


def test_merge_video_audio_invocation(tmp_path):
    v_file = tmp_path / "v.mp4"
    a_file = tmp_path / "a.m4a"
    out_file = tmp_path / "merged.mp4"
    v_file.write_text("v")
    a_file.write_text("a")

    with patch("shutil.which", return_value="C:\\ffmpeg\\ffmpeg.exe"):
        with patch("subprocess.run") as mock_sub:
            res = merge_video_audio(str(v_file), str(a_file), str(out_file))
            assert res == str(out_file)

            mock_sub.assert_called_once()
            args, kwargs = mock_sub.call_args
            assert kwargs.get("shell") is False
            cmd = args[0]
            assert cmd[0] == "ffmpeg"
            assert "-i" in cmd
            assert "-c:v" in cmd
            assert "-c:a" in cmd


def test_extract_audio_mp3_invocation(tmp_path):
    in_file = tmp_path / "input.mp4"
    out_file = tmp_path / "output.mp3"
    in_file.write_text("video")

    with patch("shutil.which", return_value="C:\\ffmpeg\\ffmpeg.exe"):
        with patch("subprocess.run") as mock_sub:
            res = extract_audio_mp3(str(in_file), str(out_file))
            assert res == str(out_file)

            mock_sub.assert_called_once()
            args, kwargs = mock_sub.call_args
            assert kwargs.get("shell") is False
            cmd = args[0]
            assert cmd[0] == "ffmpeg"
            assert "-vn" in cmd
            assert "-b:a" in cmd
