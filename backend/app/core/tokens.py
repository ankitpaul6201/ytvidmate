import hashlib
import hmac
import os
import time

TOKEN_TTL_SECONDS = 3600  # 1 hour validity


def _get_signing_secret() -> bytes:
    val = os.getenv("SECRET_KEY") or "ytvidmate_local_signing_key"
    return val.encode("utf-8")


def generate_job_token(job_id: str) -> str:
    """Generates an HMAC-SHA256 signed token for a given job_id with expiry."""
    expires_at = int(time.time()) + TOKEN_TTL_SECONDS
    payload = f"{job_id}:{expires_at}"
    secret_key = _get_signing_secret()
    sig = hmac.new(secret_key, payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{expires_at}.{sig}"


def verify_job_token(job_id: str, token: str) -> bool:
    """Validates that token matches job_id, signature is authentic, and unexpired."""
    if not token or "." not in token:
        return False

    try:
        expires_at_str, received_sig = token.split(".", 1)
        expires_at = int(expires_at_str)
        if time.time() > expires_at:
            return False  # Token expired

        payload = f"{job_id}:{expires_at}"
        secret_key = _get_signing_secret()
        expected_sig = hmac.new(
            secret_key, payload.encode("utf-8"), hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected_sig, received_sig)
    except Exception:
        return False
