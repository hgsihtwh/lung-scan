from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 дней

    # Database
    DATABASE_URL: str = "sqlite:///./sql_app.db"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Model API
    MODEL_API_URL: str = "http://localhost:8001/predict"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
