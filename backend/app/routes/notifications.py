from fastapi import APIRouter

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("", summary="Notifications module status")
async def notifications_status():
    """Placeholder endpoint confirming the notifications module is registered."""
    return {"message": "Notifications router is available", "module": "notifications"}
