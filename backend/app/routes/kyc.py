from fastapi import APIRouter

router = APIRouter(prefix="/api/kyc", tags=["KYC Verification"])


@router.get("", summary="KYC module status")
async def kyc_status():
    """Placeholder endpoint confirming the KYC module is registered."""
    return {"message": "KYC router is available", "module": "kyc"}
