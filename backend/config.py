from __future__ import annotations
from pathlib import Path
from pydantic import SecretStr, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent          # .../NyayaSetu/backend
ENV_PATH = BASE_DIR / ".env"                         # .../NyayaSetu/backend/.env

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        env_file_encoding="utf-8",
        extra="ignore",
    )
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: SecretStr | None = None
    smtp_from_email: str | None = None
    smtp_from_name: str = "NyayaSetu"

    app_name: str = "NyayaSetu API"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = False
    api_prefix: str = "/api/v1"
    cors_origins_value: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
        validation_alias="CORS_ORIGINS",
    )

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "nyayasetu"
    court_org_slug: str = "court-registry"
    court_org_name: str = "Court Registry"
    jwt_secret_key: str = "thinkhive-secret-change-in-production-32chars"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    qdrant_url: str | None = None
    qdrant_api_key: SecretStr | None = None
    qdrant_collection: str = "nyayasetu_chunks"
    embedding_dimension: int = 1024

    groq_api_key: SecretStr | None = None
    google_api_key: SecretStr | None = None

    # Google Calendar OAuth (for auto-adding hearing-date reminders)
    google_oauth_client_id: str | None = None
    google_oauth_client_secret: SecretStr | None = None
    google_oauth_redirect_uri: str = "http://localhost:8000/api/v1/calendar/oauth/callback"
    frontend_base_url: str = "http://localhost:5173"

    max_upload_size_mb: int = 25
    allowed_upload_extensions: list[str] = [
        ".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg",
        ".mp3", ".wav", ".m4a", ".webm", ".ogg", ".flac", ".mp4", ".mpeg", ".mpga",
    ]

    redis_url: str = "redis://localhost:6379/0"
    log_level: str = "INFO"

    # Predictive insights / age tagging: a document's age is judged relative
    # to how long the company has been using NyayaSetu, not a fixed day count.
    # position = doc_age / org_lifetime, both measured from "now".
    #   <= age_new_threshold      -> new
    #   <= age_recent_threshold   -> recent
    #   <= age_old_threshold      -> old
    #   above that                -> outdated
    age_new_threshold: float = 0.15
    age_recent_threshold: float = 0.40
    age_old_threshold: float = 0.75

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_value.split(",") if origin.strip()]

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, value: object) -> object:
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "production", "prod"}:
                return False
            if normalized in {"development", "dev"}:
                return True
        return value


settings = Settings()