from typing import Dict, Any
from fastapi import APIRouter, Depends, Path, status
from pymongo.database import Database

from app.database.connection import get_database
from app.schemas.kyc import (
    AdminKYCPendingListResponse,
    AdminKYCDetailResponse,
    KYCRejectRequest,
    KYCActionResponse,
)
from app.services.kyc_service import (
    get_pending_kyc_list,
    get_kyc_details,
    approve_kyc,
    reject_kyc,
)
from app.utils.security import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("", summary="Admin module status")
async def admin_status():
    """Placeholder endpoint confirming the admin module is registered."""
    return {"message": "Admin router is available", "module": "admin"}


# -------------------------------------------------------------
# Admin KYC Management Endpoints
# -------------------------------------------------------------

@router.get(
    "/kyc/pending",
    response_model=AdminKYCPendingListResponse,
    summary="List all pending KYC submissions",
    description="Retrieves a list of customer KYC submissions awaiting review. Restricted strictly to administrators.",
)
async def list_pending_kyc(
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to view pending KYC queue."""
    return get_pending_kyc_list(db)


@router.get(
    "/kyc/{kyc_id}",
    response_model=AdminKYCDetailResponse,
    summary="Get detailed customer KYC information",
    description="Retrieves the full KYC document and customer profile for administrative review.",
)
async def get_single_kyc(
    kyc_id: str = Path(..., description="ID of the KYC document"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to review specific KYC submission."""
    return get_kyc_details(db, kyc_id)


@router.patch(
    "/kyc/{kyc_id}/approve",
    response_model=KYCActionResponse,
    summary="Approve customer KYC verification",
    description="Approves a pending KYC submission, updates kyc status to 'verified', and synchronizes the customer's account status.",
)
async def approve_customer_kyc(
    kyc_id: str = Path(..., description="ID of the KYC document to approve"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to approve customer KYC."""
    return approve_kyc(db, kyc_id, admin_user)


@router.patch(
    "/kyc/{kyc_id}/reject",
    response_model=KYCActionResponse,
    summary="Reject customer KYC verification",
    description="Rejects a customer KYC submission with a mandatory reason, updating kyc status to 'rejected' and synchronizing the user account.",
)
async def reject_customer_kyc(
    data: KYCRejectRequest,
    kyc_id: str = Path(..., description="ID of the KYC document to reject"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to reject customer KYC."""
    return reject_kyc(db, kyc_id, admin_user, data.reason)
