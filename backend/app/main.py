import redis as sync_redis

from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from jose import JWTError
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException as StarletteHTTPException

from .api import auth_router, v1_router
from .core.config import settings
from .core.logger import LoggingMiddleware, logger
from .core.rate_limiter import RateLimitMiddleware
from .database import get_db

app = FastAPI(
    title="LungScan API",
    description="""
API for chest CT scan analysis.

Upload DICOM archives, run AI-powered analysis,
and receive detailed reports with pathology verdicts.

Features:
- Registration and authentication with email verification
- DICOM archive upload (.zip)
- AI scan analysis
- Detailed PDF reports
- Refresh token rotation for secure sessions
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
        {"name": "Authentication", "description": "Registration, login, token management and password recovery"},
        {"name": "Scans", "description": "List and detail scans with pagination and filtering"},
        {"name": "Upload", "description": "Upload DICOM archives"},
        {"name": "Analysis", "description": "Trigger AI analysis and poll status"},
        {"name": "Feedback", "description": "Submit feedback on analysis results"},
        {"name": "Reports", "description": "Download PDF reports"},
        {"name": "Users", "description": "User profile management"},
        {"name": "Admin", "description": "Administrative operations — file cleanup"},
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    expose_headers=["X-Total-Count"],
    max_age=600,
)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(LoggingMiddleware)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning(f"HTTP {exc.status_code} at {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = " → ".join(str(x) for x in error["loc"] if x != "body")
        errors.append({"field": field, "message": error["msg"]})
    logger.warning(f"Validation error at {request.url.path}: {errors}")
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation error", "errors": errors},
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error at {request.url.path}: {exc!s}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.exception_handler(JWTError)
async def jwt_exception_handler(request: Request, exc: JWTError):
    logger.warning(f"JWT error at {request.url.path}: {exc!s}")
    return JSONResponse(
        status_code=401,
        content={"detail": "Invalid token"},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error at {request.url.path}: {exc!s}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


app.include_router(auth_router)
app.include_router(v1_router)

logger.info("LungScan API started")


@app.get("/", tags=["default"], summary="Root endpoint")
async def root():
    return {"message": "LungScan API", "status": "running"}


@app.get("/health", tags=["default"], summary="Health check")
async def health(db: Session = Depends(get_db)):
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
