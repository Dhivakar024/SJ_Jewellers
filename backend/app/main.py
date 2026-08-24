import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.database.connection import ping_database, close_database_connection
from app.middleware import AuthRateLimiterMiddleware, SecurityHeadersMiddleware
from app.routes import (
    auth_router,
    profile_router,
    users_router,
    kyc_router,
    rates_router,
    purchases_router,
    holdings_router,
    withdrawals_router,
    transactions_router,
    notifications_router,
    admin_router,
    admin_dashboard_router,
)

logger = logging.getLogger("gold_silver.api")

# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API service for Gold & Silver User App and Admin Panel",
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. Attach Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 2. Attach Auth Rate Limiter Middleware
app.add_middleware(AuthRateLimiterMiddleware, max_requests=20, window_seconds=60)

# 3. CORS Configuration
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# 4. Global Exception Handlers for Sanitized Error Responses
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Sanitize and standardize HTTP error responses."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Sanitize and format Pydantic validation errors clearly."""
    errors = []
    for err in exc.errors():
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        errors.append(f"{loc}: {err.get('msg', 'Invalid value')}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Request validation failed",
            "errors": errors,
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all unhandled exception handler that prevents traceback and secret leaks."""
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred. Please try again later.",
            "error_type": "internal_error",
        },
    )


# 5. Include API Routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(users_router)
app.include_router(kyc_router)
app.include_router(rates_router)
app.include_router(purchases_router)
app.include_router(holdings_router)
app.include_router(withdrawals_router)
app.include_router(transactions_router)
app.include_router(notifications_router)
app.include_router(admin_router)
app.include_router(admin_dashboard_router)


# Lifecycle event for database cleanup on shutdown
@app.on_event("shutdown")
def shutdown_event():
    close_database_connection()


# Root Info Endpoint
@app.get("/", tags=["General"])
async def root():
    """Root endpoint returning basic service status."""
    return {"message": "Gold & Silver Backend is running", "status": "active"}


# Health Check Endpoints
@app.get("/health", tags=["General"])
@app.get("/api/health", tags=["General"])
async def health_check():
    """Health check endpoint verifying both API service and MongoDB connectivity without exposing credentials."""
    is_connected = ping_database()
    
    if is_connected:
        return {
            "status": "ok",
            "service": "gold-silver-backend",
            "database": "connected",
        }
    else:
        return {
            "status": "degraded",
            "service": "gold-silver-backend",
            "database": "disconnected",
        }
