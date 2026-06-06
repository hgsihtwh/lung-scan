import time

import redis.asyncio as aioredis
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from .config import settings


RATE_LIMITS: dict[str, tuple[int, int]] = {
    "/api/auth/login": (10, 60),
    "/api/auth/register": (5, 60),
    "/api/auth/forgot-password": (5, 60),
    "/api/auth/resend-code": (3, 60),
    "/scans/upload": (20, 3600),
}

GLOBAL_LIMIT = (200, 60)


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app) -> None:
        super().__init__(app)
        self.redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

    async def dispatch(self, request: Request, call_next):
        ip = self._get_client_ip(request)
        path = request.url.path

        limit, period = self._get_limit_for_path(path)

        allowed, retry_after = await self._check_rate_limit(ip, path, limit, period)

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
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _get_limit_for_path(self, path: str) -> tuple[int, int]:
        for route, limits in RATE_LIMITS.items():
            if path == route or path.endswith(route):
                return limits
        return GLOBAL_LIMIT

    async def _check_rate_limit(
        self, ip: str, path: str, limit: int, period: int
    ) -> tuple[bool, int]:
        window = int(time.time()) // period
        key = f"rate_limit:{ip}:{path}:{window}"

        try:
            pipe = self.redis.pipeline()
            pipe.incr(key)
            pipe.expire(key, period)
            results = await pipe.execute()
            count = results[0]

            if count > limit:
                ttl = await self.redis.ttl(key)
                return False, ttl if ttl > 0 else period

            return True, 0

        except aioredis.RedisError:
            return True, 0
