from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.connection import ping_database, close_database_connection
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

# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API service for Gold & Silver User App and Admin Panel",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration Placeholder
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
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
    return {"message": "Gold & Silver Backend is running"}


# Health Check Endpoint with Live MongoDB Connectivity Verification
@app.get("/api/health", tags=["General"])
async def health_check():
    """Health check endpoint verifying both API service and MongoDB Atlas connectivity."""
    is_connected = ping_database()
    
    if is_connected:
        return {
            "status": "ok",
            "service": "gold-silver-backend",
            "database": "connected",
        }
    else:
        return {
            "status": "error",
            "service": "gold-silver-backend",
            "database": "disconnected",
        }
