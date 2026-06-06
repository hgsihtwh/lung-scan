from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from .api import auth_router, v1_router
from .core.config import settings
from .core.logger import LoggingMiddleware, logger
from .core.rate_limiter import RateLimitMiddleware
from .database import Base, engine, get_db

from sqlalchemy import text
from sqlalchemy.orm import Session


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LungScan API",
    description="API для анализа КТ грудной клетки",
    version="1.0.0",
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


@app.get("/")
async def root():
    return {"message": "LungScan API", "status": "running"}


@app.get("/health")
async def health(db: Session = Depends(get_db)):
    import redis as sync_redis

    db_status = "ok"
    redis_status = "ok"

    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"

    try:
        r = sync_redis.from_url(settings.REDIS_URL, decode_responses=True)
        r.ping()
    except Exception:
        redis_status = "error"

    overall = "healthy" if db_status == "ok" and redis_status == "ok" else "degraded"

    return {
        "status": overall,
        "version": "1.0.0",
        "services": {
            "database": db_status,
            "redis": redis_status,
        },
    }
