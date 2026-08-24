from fastapi import APIRouter

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.get("", summary="Auth module status")
async def auth_status():
    """Placeholder endpoint confirming the authentication module is registered."""
    return {"message": "Auth router is available", "module": "auth"}
