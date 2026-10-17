from pydantic import SecretStr
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    frontend_origin: str = "http://localhost:3000"
    redis_url: SecretStr = SecretStr("redis://localhost:6379/0")
    tmp_dir: str = "./temp"
    turnstile_secret_key: SecretStr | None = None
    database_url: SecretStr | None = None
    sentry_dsn: SecretStr | None = None
    max_filesize_bytes: int = 2_000_000_000
    max_duration_seconds: int = 10_800
    rate_limit_info: str = "10/10m"
    rate_limit_download: str = "5/10m"

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }

    @property
    def allowed_origins(self) -> list[str]:
        origins = [self.frontend_origin.strip()]
        if self.app_env != "production":
            for port in [3000, 3001, 3002, 3003, 3004, 3005]:
                origins.append(f"http://localhost:{port}")
                origins.append(f"http://127.0.0.1:{port}")
        return list(dict.fromkeys(origins))


settings = Settings()
