"""Application configuration."""
from pydantic import BaseSettings


class Settings(BaseSettings):
    """App settings from env or defaults."""

    MONGODB_URL: str = "mongodb://localhost:27017"
    DB_NAME: str = "zypark"
    JWT_SECRET: str = "zypark-demo-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    class Config:
        env_file = ".env"


settings = Settings()
