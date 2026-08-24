from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from pymongo.database import Database

from app.database.connection import get_database
from app.schemas.kyc import (
    KYCSubmitRequest,
    KYCResponse,
)
from app.services.kyc_service import submit_kyc, get_user_kyc
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/kyc", tags=["KYC Verification"])


@router.post(
    "/submit",
    response_model=KYCResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit or resubmit KYC verification",
    description="Allows an authenticated customer to submit or resubmit their identification and address details for KYC verification.",
)
async def submit_customer_kyc(
    data: KYCSubmitRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to submit KYC details."""
    return submit_kyc(db, current_user, data)


@router.get(
    "/me",
    response_model=KYCResponse,
    summary="Get current user's KYC details and status",
    description="Retrieves the KYC document and review status for the authenticated customer.",
)
async def get_my_kyc(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to check own KYC status."""
    return get_user_kyc(db, current_user)
