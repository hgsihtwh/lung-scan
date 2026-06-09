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

    # Environment
    ENVIRONMENT: str = "development"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Model API
    MODEL_API_URL: str = "http://localhost:8001/predict"

    # Email Settings
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    SMTP_FROM_EMAIL: str
    SMTP_FROM_NAME: str = "Lung Scan"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def cors_origins_list(self) -> list[str]:
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        if self.is_production:
            return [o for o in origins if "localhost" not in o]
        return origins

    class Config:
        env_file = "../.env"


settings = Settings()
