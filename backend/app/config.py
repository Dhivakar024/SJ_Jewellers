from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration settings loaded from environment variables or .env file."""
    
    APP_NAME: str = "Gold & Silver API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Application Timezone
    APP_TIMEZONE: str = "Asia/Kolkata"
    
    # Database Settings
    MONGODB_URI: Optional[str] = None
    DATABASE_NAME: str = "gold_silver"
    
    # Security Settings
    JWT_SECRET: str = "default_jwt_secret_please_set_in_env_file"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # External Metal Rates API Settings
    METAL_RATES_API_URL: Optional[str] = None
    METAL_RATES_API_KEY: Optional[str] = None

    # Purchase & Tax Settings
    MIN_GOLD_PURCHASE_GRAMS: float = 0.001
    MIN_SILVER_PURCHASE_GRAMS: float = 0.001
    GST_RATE_PERCENT: float = 3.0

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
