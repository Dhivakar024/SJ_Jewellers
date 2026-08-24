from fastapi import APIRouter

router = APIRouter(prefix="/api/purchases", tags=["Purchases"])


@router.get("", summary="Purchases module status")
async def purchases_status():
    """Placeholder endpoint confirming the purchases module is registered."""
    return {"message": "Purchases router is available", "module": "purchases"}
