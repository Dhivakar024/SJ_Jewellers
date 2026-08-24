from fastapi import APIRouter

router = APIRouter(prefix="/api/holdings", tags=["Holdings"])


@router.get("", summary="Holdings module status")
async def holdings_status():
    """Placeholder endpoint confirming the holdings module is registered."""
    return {"message": "Holdings router is available", "module": "holdings"}
