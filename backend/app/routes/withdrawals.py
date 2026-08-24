from fastapi import APIRouter

router = APIRouter(prefix="/api/withdrawals", tags=["Withdrawals"])


@router.get("", summary="Withdrawals module status")
async def withdrawals_status():
    """Placeholder endpoint confirming the withdrawals module is registered."""
    return {"message": "Withdrawals router is available", "module": "withdrawals"}
