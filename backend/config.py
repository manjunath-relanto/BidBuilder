from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SQLALCHEMY_DATABASE_URI: str = f"sqlite:///{Path(__file__).resolve().parents[0] / 'bidbuilder.db'}"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    SECRET_KEY: str = 'supersecretkey'
    ALGORITHM: str = 'HS256'

settings = Settings()
