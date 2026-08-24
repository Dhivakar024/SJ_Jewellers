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
from app.schemas.admin_users import (
    AdminUserListResponse,
    AdminUserDetailResponse,
    AdminUpdateUserStatusRequest,
    AdminUserStatusResponse,
)
from app.schemas.purchases import (
    AdminPurchaseListResponse,
    AdminPurchaseDetailResponse,
)
from app.schemas.holdings import (
    AdminCustomerHoldingsResponse,
    AdminHoldingsListResponse,
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
from app.services.user_service import (
    get_admin_users,
    get_admin_user_detail,
    update_user_status_by_admin,
    ban_user_by_admin,
    unban_user_by_admin,
)
from app.services.purchase_service import (
    get_admin_purchases,
    get_admin_purchase_by_id,
)
from app.services.holdings_service import (
    get_admin_customer_holdings,
    get_admin_all_holdings,
)
from app.utils.security import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("", summary="Admin module status")
async def admin_status():
    """Placeholder endpoint confirming the admin module is registered."""
    return {"message": "Admin router is available", "module": "admin"}


# -------------------------------------------------------------
# Admin User Management Endpoints
# -------------------------------------------------------------

@router.get(
    "/users",
    response_model=AdminUserListResponse,
    summary="List all users with pagination and search",
    description="Retrieves a paginated list of users supporting search by name/mobile/email and filtering by account status and KYC status.",
)
async def list_users(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    search: Optional[str] = Query(None, description="Search term for name, mobile, email"),
    status: Optional[str] = Query(None, description="Filter by account status (active, suspended, banned)"),
    kyc_status: Optional[str] = Query(None, description="Filter by KYC status (pending, verified, rejected)"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to fetch members list."""
    return get_admin_users(
        db=db,
        page=page,
        limit=limit,
        search=search,
        status_filter=status,
        kyc_status_filter=kyc_status,
    )


@router.get(
    "/users/{user_id}",
    response_model=AdminUserDetailResponse,
    summary="Get user details by ID",
    description="Retrieves comprehensive account profile, personal details, address, and status for a specific user.",
)
async def get_user_by_id(
    user_id: str = Path(..., description="Unique ID of the user"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to view single user detail."""
    return get_admin_user_detail(db, user_id)


@router.patch(
    "/users/{user_id}/status",
    response_model=AdminUserStatusResponse,
    summary="Update user account status",
    description="Updates a customer's account status to active, suspended, or banned. Prevents modification of other administrator accounts.",
)
async def update_user_status(
    data: AdminUpdateUserStatusRequest,
    user_id: str = Path(..., description="Unique ID of the user"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to update account status."""
    return update_user_status_by_admin(db, user_id, data.status, admin_user)


@router.patch(
    "/users/{user_id}/ban",
    response_model=AdminUserStatusResponse,
    summary="Ban a user account",
    description="Sets user status to 'banned' without deleting data, immediately blocking protected customer actions.",
)
async def ban_user(
    user_id: str = Path(..., description="Unique ID of the user to ban"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to ban a customer account."""
    return ban_user_by_admin(db, user_id, admin_user)


@router.patch(
    "/users/{user_id}/unban",
    response_model=AdminUserStatusResponse,
    summary="Unban a user account",
    description="Restores a banned user's account status to 'active'.",
)
async def unban_user(
    user_id: str = Path(..., description="Unique ID of the user to unban"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to unban a customer account."""
    return unban_user_by_admin(db, user_id, admin_user)


# -------------------------------------------------------------
# Admin Customer Holdings Endpoints
# -------------------------------------------------------------

@router.get(
    "/users/{user_id}/holdings",
    response_model=AdminCustomerHoldingsResponse,
    summary="Get specific customer holdings and valuation",
    description="Retrieves the full Gold and Silver portfolio balance, average buy rate, and live market valuation for a selected customer.",
)
async def get_customer_holdings_for_admin(
    user_id: str = Path(..., description="Unique ID of the user"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to view customer metal holdings."""
    return get_admin_customer_holdings(db, user_id)


@router.get(
    "/holdings",
    response_model=AdminHoldingsListResponse,
    summary="List all customer holdings with search and live valuation",
    description="Retrieves a paginated list of all customer holdings across Gold and Silver with customer search and filtering.",
)
async def list_all_customer_holdings(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    search: Optional[str] = Query(None, description="Search customer name, mobile, email"),
    metal: Optional[str] = Query(None, description="Filter by active holdings in metal ('gold' or 'silver')"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to list all customer holdings."""
    return get_admin_all_holdings(
        db=db,
        page=page,
        limit=limit,
        search=search,
        metal=metal,
    )


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


# -------------------------------------------------------------
# Admin Purchases Management Endpoints
# -------------------------------------------------------------

@router.get(
    "/purchases",
    response_model=AdminPurchaseListResponse,
    summary="List all purchases for Admin",
    description="Retrieves a paginated list of all customer metal purchases with search by transaction ID/user mobile/name/email and filters by metal, status, and payment status.",
)
async def list_admin_purchases(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    search: Optional[str] = Query(None, description="Search transaction ID, customer name, mobile, email"),
    metal: Optional[str] = Query(None, description="Filter by metal ('gold' or 'silver')"),
    status: Optional[str] = Query(None, description="Filter by purchase status"),
    payment_status: Optional[str] = Query(None, description="Filter by payment status"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to view all metal purchases."""
    return get_admin_purchases(
        db=db,
        page=page,
        limit=limit,
        search=search,
        metal=metal,
        status_filter=status,
        payment_status=payment_status,
    )


@router.get(
    "/purchases/{purchase_id}",
    response_model=AdminPurchaseDetailResponse,
    summary="Get purchase details for Admin",
    description="Retrieves comprehensive purchase details, metal quantities, rate snapshot, GST calculations, and customer profile information.",
)
async def get_admin_purchase(
    purchase_id: str = Path(..., description="Purchase ID or Transaction ID"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Admin endpoint to inspect a specific purchase transaction."""
    return get_admin_purchase_by_id(db, purchase_id)
