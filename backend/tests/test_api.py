from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.core.tokens import generate_job_token
from app.main import app
from app.services.job_manager import job_manager

client = TestClient(app)


def test_api_health():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "ytdlp_version" in data


def test_api_info_invalid_url():
    res = client.post("/api/v1/info", json={"url": "http://127.0.0.1/video"})
    assert res.status_code == 400
    detail = res.json()["detail"].lower()
    assert "blocked" in detail or "scheme" in detail


def test_api_info_success():
    mock_info = {
        "id": "abc123",
        "title": "API Test Video",
        "thumbnail": "https://img.youtube.com/vi/abc123/hqdefault.jpg",
        "duration": 120,
        "uploader": "Test Channel",
        "formats": [
            {"format_id": "137", "height": 1080, "ext": "mp4", "filesize": 50000000},
        ],
    }

    with patch("yt_dlp.YoutubeDL") as mock_ydl_cls:
        mock_instance = MagicMock()
        mock_instance.extract_info.return_value = mock_info
        mock_ydl_cls.return_value.__enter__.return_value = mock_instance

        res = client.post(
            "/api/v1/info",
            json={"url": "https://www.youtube.com/watch?v=abc123"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["id"] == "abc123"
        assert data["title"] == "API Test Video"
        assert len(data["formats"]) > 0


def test_api_download_and_progress_security(tmp_path):
    # Test starting download
    with patch("app.services.job_manager.JobManager._run_job"):
        payload = {
            "url": "https://www.youtube.com/watch?v=abc123",
            "height": 720,
            "type": "video",
        }
        res = client.post("/api/v1/download", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "job_id" in data
        assert "token" in data
        job_id = data["job_id"]
        token = data["token"]

        # Progress without token -> 403 Forbidden
        p_res_no_token = client.get(f"/api/v1/progress/{job_id}")
        assert p_res_no_token.status_code == 403

        # Progress with invalid token -> 403 Forbidden
        p_res_bad_token = client.get(f"/api/v1/progress/{job_id}?token=invalid.token")
        assert p_res_bad_token.status_code == 403

        # Mark job done so the event stream terminates immediately
        job = job_manager.get_job(job_id)
        if job:
            job.status = "done"

        # Progress with valid token -> 200 OK (streaming response)
        p_res_valid = client.get(f"/api/v1/progress/{job_id}?token={token}")
        assert p_res_valid.status_code == 200

        # File download without token -> 403 Forbidden
        f_res_no_token = client.get(f"/api/v1/file/{job_id}")
        assert f_res_no_token.status_code == 403


def test_api_file_download_lifecycle(tmp_path):
    with patch("app.services.job_manager.JobManager._run_job"):
        job = job_manager.create_job(
            url="https://www.youtube.com/watch?v=testfile",
            height=720,
            media_type="video",
        )
        token = generate_job_token(job.job_id)

        dummy_file = tmp_path / "finished.mp4"
        dummy_file.write_bytes(b"dummy mp4 content stream")

        job.status = "done"
        job.file_path = str(dummy_file)
        job.filename = "finished.mp4"

        res = client.get(f"/api/v1/file/{job.job_id}?token={token}")
        assert res.status_code == 200
        assert (
            res.headers["content-disposition"]
            == 'attachment; filename="finished.mp4"'
        )
        assert res.headers["x-content-type-options"] == "nosniff"
        assert res.content == b"dummy mp4 content stream"


def test_api_file_expired():
    fake_job_id = "00000000-0000-0000-0000-000000000000"
    token = generate_job_token(fake_job_id)
    res = client.get(f"/api/v1/file/{fake_job_id}?token={token}")
    assert res.status_code == 410
