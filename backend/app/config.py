from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration settings loaded from environment variables or .env file."""
    
    APP_NAME: str = "Gold & Silver API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database Settings (configured for future MongoDB Atlas connection)
    MONGODB_URI: Optional[str] = None
    DATABASE_NAME: str = "gold_silver"
    
    # Security Settings
    JWT_SECRET: Optional[str] = None
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()


settings = get_settings()
