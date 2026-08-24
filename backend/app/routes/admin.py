from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Path, Query, status
from pymongo.database import Database

from app.database.connection import get_database
from app.schemas.kyc import (
    AdminKYCPendingListResponse,
    AdminKYCDetailResponse,
    KYCRejectRequest,
    KYCActionResponse,
)
from app.schemas.rates import (
    RatesAdminResponse,
    SetCustomRatesRequest,
    RefreshRatesResponse,
    RateHistoryResponse,
)
from app.services.kyc_service import (
    get_pending_kyc_list,
    get_kyc_details,
    approve_kyc,
    reject_kyc,
)
from app.services.metal_rates_service import (
    get_rates_admin,
    set_custom_rates,
    refresh_api_rates,
    get_rate_history,
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


# -------------------------------------------------------------
# Admin Metal Rates Management Endpoints
# -------------------------------------------------------------

@router.get(
    "/rates",
    response_model=RatesAdminResponse,
    summary="Get detailed rate configuration for Admin",
    description="Retrieves the full rate configuration for Gold and Silver, including API rates, active custom rates, modes, and expiration timestamps.",
)
async def get_admin_rates(
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to view rate configurations."""
    return get_rates_admin(db)


@router.patch(
    "/rates/custom",
    response_model=RatesAdminResponse,
    summary="Set or toggle custom rates for Gold and Silver",
    description="Enables or disables custom rate mode for Gold and/or Silver. Custom rates must be >= the current API rate. Automatically sets expiration to end-of-day today.",
)
async def update_custom_rates(
    data: SetCustomRatesRequest,
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to configure custom metal rates."""
    return set_custom_rates(db, admin_user, data)


@router.post(
    "/rates/refresh",
    response_model=RefreshRatesResponse,
    summary="Refresh rates from external market API",
    description="Triggers a refresh of Gold and Silver rates from the external rate provider and updates the database.",
)
async def refresh_rates(
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to refresh live rates from provider."""
    return await refresh_api_rates(db, admin_user)


@router.get(
    "/rates/history",
    response_model=RateHistoryResponse,
    summary="Get rate change audit history",
    description="Retrieves historical records of rate adjustments triggered by admin overrides, API syncs, or automatic end-of-day expirations.",
)
async def list_rate_history(
    metal: Optional[str] = Query(None, description="Filter history by metal ('gold' or 'silver')"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of historical records to return"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to view rate audit history."""
    return get_rate_history(db, metal=metal, limit=limit)
