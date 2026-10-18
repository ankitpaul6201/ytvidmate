import os
from pydantic import SecretStr
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    frontend_origin: str = "http://localhost:3000,http://localhost:3001"
    redis_url: SecretStr = SecretStr("redis://localhost:6379/0")
    tmp_dir: str = "./temp"
    turnstile_secret_key: SecretStr | None = None
    database_url: SecretStr | None = None
    sentry_dsn: SecretStr | None = None
    ffmpeg_path: str | None = None
    max_filesize_bytes: int = 2_000_000_000
    max_duration_seconds: int = 10_800
    rate_limit_info: str = "10/10m"
    rate_limit_download: str = "5/10m"
    max_concurrent_downloads: int = 3
    max_queue_size: int = 30
    cleanup_interval_seconds: int = 60

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }

    @property
    def allowed_origins(self) -> list[str]:
        raw = os.environ.get("ALLOWED_ORIGINS", self.frontend_origin)
        origins = [o.strip() for o in raw.split(",") if o.strip()]

        if self.app_env != "production":
            for port in [3000, 3001, 3002, 3003, 3004, 3005]:
                origins.append(f"http://localhost:{port}")
                origins.append(f"http://127.0.0.1:{port}")

        return list(dict.fromkeys(origins))


settings = Settings()
