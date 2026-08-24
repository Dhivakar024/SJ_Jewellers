import time
from collections import defaultdict
from typing import Dict, List
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class AuthRateLimiterMiddleware(BaseHTTPMiddleware):
    """In-memory rate limiter for authentication endpoints to prevent brute-force attacks."""

    def __init__(self, app, max_requests: int = 15, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests_history: Dict[str, List[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path.lower()
        
        # Only rate-limit authentication write endpoints
        if request.method == "POST" and (path.endswith("/api/auth/login") or path.endswith("/api/auth/register")):
            client_ip = request.client.host if request.client else "unknown"
            now = time.time()
            window_start = now - self.window_seconds

            # Filter out timestamps outside the sliding window
            timestamps = [t for t in self.requests_history[client_ip] if t > window_start]
            self.requests_history[client_ip] = timestamps

            if len(timestamps) >= self.max_requests:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "detail": "Too many requests. Please wait a moment before trying again.",
                        "error": "rate_limit_exceeded",
                    },
                    headers={"Retry-After": str(self.window_seconds)},
                )

            self.requests_history[client_ip].append(now)

        return await call_next(request)
