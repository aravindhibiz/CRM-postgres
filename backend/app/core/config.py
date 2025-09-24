from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        # Look for .env file in the backend directory
        env_file = Path(__file__).parent.parent.parent / ".env"

settings = Settings()