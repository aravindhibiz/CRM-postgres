from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file explicitly
# Path from backend/app/core/config.py to root/.env
env_file = Path(__file__).parent.parent.parent.parent / ".env"
load_dotenv(env_file)


class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours instead of 30 minutes

    # Frontend URL for OAuth redirects
    FRONTEND_URL: str = "http://localhost:3000"

    # Google OAuth settings
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # Integration settings
    INTEGRATION_ENCRYPTION_KEY: Optional[str] = None

    # SendGrid settings
    SENDGRID_API_KEY: Optional[str] = None

    class Config:
        # Look for .env file in the backend directory
        env_file = Path(__file__).parent.parent.parent / ".env"
        case_sensitive = False  # Allow case-insensitive environment variables


# Create settings instance
settings = Settings()
