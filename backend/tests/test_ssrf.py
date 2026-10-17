import pytest

from app.core.security import safe_job_path, safe_name, validate_public_url

BLOCKED_URLS = [
    "http://localhost/",
    "http://127.0.0.1/",
    "http://127.1/",
    "http://0x7f000001/",
    "http://2130706433/",
    "http://[::1]/",
    "http://169.254.169.254/latest/meta-data/",
    "http://10.0.0.5/",
    "http://192.168.1.1/",
    "file:///etc/passwd",
    "http://evil.com@127.0.0.1/",
    "http://user:pass@example.com/",
    "ftp://example.com/file.mp4",
    "javascript:alert(1)",
    "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
    "http://example.com:8080/video",
    "http://example.com:22/video",
]


@pytest.mark.parametrize("url", BLOCKED_URLS)
def test_ssrf_blocked_urls(url: str):
    """Verifies that all SSRF test vectors from docs/09_SECURITY.md are rejected."""
    with pytest.raises(ValueError):
        validate_public_url(url)


def test_url_length_limit():
    long_url = "https://example.com/" + "a" * 2050
    with pytest.raises(ValueError, match="maximum length"):
        validate_public_url(long_url)


def test_valid_public_url():
    valid = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    result = validate_public_url(valid)
    assert result == valid


def test_safe_name_sanitization():
    unsafe_title = '../../etc/passwd "bad" | special & characters <>'
    cleaned = safe_name(unsafe_title, "mp4")
    assert "/" not in cleaned
    assert "\\" not in cleaned
    assert ".." not in cleaned
    assert "|" not in cleaned
    assert cleaned.endswith(".mp4")


def test_safe_job_path_valid():
    valid_uuid = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    path = safe_job_path("temp_dir", valid_uuid, "video.mp4")
    assert valid_uuid in path
    assert path.endswith("video.mp4")


def test_safe_job_path_traversal():
    valid_uuid = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    with pytest.raises(ValueError, match="Path traversal"):
        safe_job_path("temp_dir", valid_uuid, "../../../etc/passwd")

    with pytest.raises(ValueError):
        safe_job_path("temp_dir", "invalid-uuid", "video.mp4")
