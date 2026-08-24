from fastapi import APIRouter

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("", summary="Admin module status")
async def admin_status():
    """Placeholder endpoint confirming the admin module is registered."""
    return {"message": "Admin router is available", "module": "admin"}
