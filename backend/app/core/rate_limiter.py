import time

import redis
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from .config import settings

# Лимиты: (количество запросов, период в секундах)
RATE_LIMITS: dict[str, tuple[int, int]] = {
    "/api/auth/login": (10, 60),        # 10 req/min — защита от брутфорса
    "/api/auth/register": (5, 60),      # 5 req/min
    "/api/auth/forgot-password": (5, 60),  # 5 req/min
    "/api/auth/resend-code": (3, 60),   # 3 req/min
    "/scans/upload": (20, 3600),        # 20 загрузок/час
}

# Глобальный лимит для всех остальных эндпоинтов
GLOBAL_LIMIT = (200, 60)  # 200 req/min


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app) -> None:
        super().__init__(app)
        self.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)

    async def dispatch(self, request: Request, call_next):
        ip = self._get_client_ip(request)
        path = request.url.path

        limit, period = self._get_limit_for_path(path)

        allowed, retry_after = self._check_rate_limit(ip, path, limit, period)

        if not allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests. Please try again later.",
                    "retry_after": retry_after,
                },
                headers={"Retry-After": str(retry_after)},
            )

        return await call_next(request)

    def _get_client_ip(self, request: Request) -> str:
        # Учитываем proxy заголовки (nginx, docker)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _get_limit_for_path(self, path: str) -> tuple[int, int]:
        for route, limits in RATE_LIMITS.items():
            if path.endswith(route) or route in path:
                return limits
        return GLOBAL_LIMIT

    def _check_rate_limit(
        self, ip: str, path: str, limit: int, period: int
    ) -> tuple[bool, int]:
        # Ключ: ip + путь + текущее окно времени
        window = int(time.time()) // period
        key = f"rate_limit:{ip}:{path}:{window}"

        try:
            pipe = self.redis.pipeline()
            pipe.incr(key)
            pipe.expire(key, period)
            results = pipe.execute()
            count = results[0]

            if count > limit:
                ttl = self.redis.ttl(key)
                return False, ttl if ttl > 0 else period

            return True, 0

        except redis.RedisError:
            # Если Redis недоступен — пропускаем запрос (fail open)
            return True, 0
