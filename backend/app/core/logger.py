import logging
import time
from logging.handlers import RotatingFileHandler
from pathlib import Path

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)


def setup_logger() -> logging.Logger:
    logger = logging.getLogger("lungscan")
    logger.setLevel(logging.DEBUG)

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    file_handler = RotatingFileHandler(
        LOG_DIR / "app.log",
        maxBytes=5 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    error_handler = RotatingFileHandler(
        LOG_DIR / "errors.log",
        maxBytes=5 * 1024 * 1024,
        backupCount=3,
        encoding="utf-8",
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)

    if not logger.handlers:
        logger.addHandler(console_handler)
        logger.addHandler(file_handler)
        logger.addHandler(error_handler)

    return logger


logger = setup_logger()


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()

        if request.url.path in ("/health", "/"):
            return await call_next(request)

        ip = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
        if not ip:
            ip = request.client.host if request.client else "unknown"

        logger.info(f"→ {request.method} {request.url.path} | IP: {ip}")

        try:
            response = await call_next(request)
            duration = round((time.time() - start) * 1000)

            level = logging.INFO if response.status_code < 400 else logging.WARNING
            if response.status_code >= 500:
                level = logging.ERROR

            logger.log(
                level,
                f"← {request.method} {request.url.path} | "
                f"{response.status_code} | {duration}ms | IP: {ip}",
            )
            return response

        except Exception as e:
            duration = round((time.time() - start) * 1000)
            logger.error(
                f"✗ {request.method} {request.url.path} | "
                f"UNHANDLED ERROR: {e!s} | {duration}ms | IP: {ip}"
            )
            raise
