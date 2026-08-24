from fastapi import APIRouter

router = APIRouter(prefix="/api/rates", tags=["Rates"])


@router.get("", summary="Rates module status")
async def rates_status():
    """Placeholder endpoint confirming the rates module is registered."""
    return {"message": "Rates router is available", "module": "rates"}
