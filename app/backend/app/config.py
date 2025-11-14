from pydantic import BaseSettings

class Settings(BaseSettings):
    DB_HOST: str = "mysql"
    DB_PORT: int = 3306
    DB_USER: str = "appuser"
    DB_PASSWORD: str = "apppassword"
    DB_NAME: str = "appstore"
    DB_POOL_SIZE: int = 10

    FRONTEND_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173", "http://localhost:5000"]

    class Config:
        env_file = "../.env"  # when running from project root via docker-compose env_file already in container

settings = Settings()
