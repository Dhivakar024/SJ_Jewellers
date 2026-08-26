from fastapi import APIRouter

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("", summary="Users module status")
async def users_status():
    """Placeholder endpoint confirming the users module is registered."""
    return {"message": "Users router is available", "module": "users"}
