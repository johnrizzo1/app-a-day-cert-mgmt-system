import os
from typing import Any, Dict, List, Optional

from pydantic import BaseSettings, PostgresDsn, validator


class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str
    DEBUG: bool

    DATABASE_URL: PostgresDsn
    
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()