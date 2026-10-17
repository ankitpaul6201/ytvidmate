import pytest

from app.core.config import settings
from app.core.turnstile import verify_turnstile_token


@pytest.mark.asyncio
async def test_turnstile_non_production():
    # In non-production (e.g. development/testing), always permits
    settings.app_env = "development"
    assert await verify_turnstile_token(None, "127.0.0.1") is True
    assert await verify_turnstile_token("dummy-token", "127.0.0.1") is True


@pytest.mark.asyncio
async def test_turnstile_production_missing_token():
    settings.app_env = "production"
    from pydantic import SecretStr
    settings.turnstile_secret_key = SecretStr("dummy-secret-key")

    assert await verify_turnstile_token(None, "127.0.0.1") is False

    # Restore development setting
    settings.app_env = "development"
    settings.turnstile_secret_key = None
