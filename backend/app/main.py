from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import auth_router, v1_router
from .core.config import settings
from .core.logger import LoggingMiddleware, logger
from .core.rate_limiter import RateLimitMiddleware
from .database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LungScan API",
    description="""
API для анализа КТ снимков грудной клетки.

Сервис предоставляет возможность загружать DICOM архивы,
запускать AI анализ и получать результаты с вердиктом о наличии патологии.

Возможности:
- Регистрация и авторизация с подтверждением email
- Загрузка DICOM архивов (.zip)
- AI анализ снимков
- Получение детальных отчётов
- Refresh токены для безопасной авторизации
    """,
    version="1.0.0",
    contact={
        "name": "LungScan Team",
        "email": "support@lungscan.dev",
    },
    license_info={
        "name": "MIT",
    },
    openapi_tags=[
        {"name": "Authentication", "description": "Регистрация, вход, управление токенами и восстановление пароля"},
        {"name": "Scans", "description": "Получение списка и деталей сканов с пагинацией и фильтрацией"},
        {"name": "Upload", "description": "Загрузка DICOM архивов"},
        {"name": "Analysis", "description": "Запуск AI анализа и получение статуса"},
        {"name": "Feedback", "description": "Обратная связь по результатам анализа"},
        {"name": "Reports", "description": "Скачивание PDF отчётов"},
        {"name": "Users", "description": "Управление профилем пользователя"},
        {"name": "Admin", "description": "Административные операции — очистка файлов"},
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(LoggingMiddleware)

app.include_router(auth_router)
app.include_router(v1_router)

logger.info("LungScan API started")


@app.get("/", tags=["default"], summary="Корневой эндпоинт")
async def root():
    """Проверка работоспособности API."""
    return {"message": "LungScan API", "status": "running"}


@app.get("/health", tags=["default"], summary="Health check")
async def health():
    """Быстрая проверка доступности сервиса."""
    return {"status": "healthy"}
