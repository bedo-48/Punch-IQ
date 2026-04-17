"""
Centralized configuration loaded from environment variables.

Uses pydantic-settings so that all env reads go through a single, typed
object. Keeps `.env` parsing out of the rest of the codebase.
"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    api_host: str = "0.0.0.0"
    api_port: int = 8000
    log_level: str = "INFO"

    # Comma-separated string in env, parsed to list here.
    cors_origins_raw: str = "http://localhost:5173"

    # The MVP ships with boxing only. The sport prefix on the model filename
    # keeps the naming consistent when UFC is added (see plan.md Stretch goal 1).
    default_sport: str = "boxing"
    model_path: Path = Path("models/boxing_predictor.pkl")
    processed_data_path: Path = Path("data/processed/fights.csv")

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins_raw.split(",") if o.strip()]


settings = Settings()
