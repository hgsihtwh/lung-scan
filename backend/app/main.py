from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from jose import JWTError
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

from .api import auth_router, v1_router
from .core.config import settings
from .core.logger import LoggingMiddleware, logger
from .core.rate_limiter import RateLimitMiddleware
from .database import Base, engine

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


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning(f"HTTP {exc.status_code} на {request.url.path}: {exc.detail}")
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
    logger.warning(f"Ошибка валидации на {request.url.path}: {errors}")
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation error", "errors": errors},
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Ошибка БД на {request.url.path}: {exc!s}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.exception_handler(JWTError)
async def jwt_exception_handler(request: Request, exc: JWTError):
    logger.warning(f"JWT ошибка на {request.url.path}: {exc!s}")
    return JSONResponse(
        status_code=401,
        content={"detail": "Invalid token"},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Необработанная ошибка на {request.url.path}: {exc!s}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


app.include_router(auth_router)
app.include_router(v1_router)

logger.info("LungScan API started")


@app.get("/")
async def root():
    return {"message": "LungScan API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
