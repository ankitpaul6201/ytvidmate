import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


async def verify_turnstile_token(token: str | None, client_ip: str) -> bool:
    """
    Validates Cloudflare Turnstile token on the server side.
    In non-production or when no key is set, allows execution.
    """
    secret = (
        settings.turnstile_secret_key.get_secret_value()
        if settings.turnstile_secret_key
        else None
    )

    if not secret or settings.app_env != "production":
        return True

    if not token:
        return False

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(
                TURNSTILE_VERIFY_URL,
                data={
                    "secret": secret,
                    "response": token,
                    "remoteip": client_ip,
                },
            )
            data = resp.json()
            return data.get("success", False)
    except Exception as e:
        logger.error(f"Turnstile verification error: {e}")
        return False
