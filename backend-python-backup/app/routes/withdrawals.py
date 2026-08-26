from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Path, Query, status
from pymongo.database import Database

from app.database.connection import get_database
from app.schemas.withdrawals import (
    CreateWithdrawalRequest,
    WithdrawalResponse,
    CustomerWithdrawalListResponse,
    WithdrawalActionResponse,
)
from app.services.withdrawal_service import (
    create_withdrawal_request,
    cancel_customer_withdrawal,
    get_customer_withdrawals,
    get_customer_withdrawal_by_id,
)
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/withdrawals", tags=["Withdrawals"])


@router.post(
    "",
    response_model=WithdrawalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit withdrawal request for Gold or Silver",
    description="Submits a new withdrawal request. Validates customer KYC verification and available holding balance, reserves the requested metal quantity, and creates a pending withdrawal.",
)
async def request_withdrawal(
    data: CreateWithdrawalRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to request metal withdrawal."""
    return create_withdrawal_request(db, current_user, data)


@router.get(
    "",
    response_model=CustomerWithdrawalListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get customer withdrawal history",
    description="Retrieves a paginated list of withdrawal requests submitted by the authenticated customer. Supports filtering by metal ('gold', 'silver') and status.",
)
async def list_my_withdrawals(
    metal: Optional[str] = Query(None, description="Filter by metal ('gold' or 'silver')"),
    status: Optional[str] = Query(None, description="Filter by status ('pending', 'approved', 'rejected', 'cancelled')"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to view personal withdrawal history."""
    return get_customer_withdrawals(
        db=db,
        current_user=current_user,
        metal=metal,
        status_filter=status,
        page=page,
        limit=limit,
    )


@router.get(
    "/{withdrawal_id}",
    response_model=WithdrawalResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single withdrawal details",
    description="Retrieves details for a specific withdrawal request belonging to the authenticated customer.",
)
async def get_single_withdrawal(
    withdrawal_id: str = Path(..., description="Withdrawal ID or Transaction ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to inspect a single withdrawal."""
    return get_customer_withdrawal_by_id(db, current_user, withdrawal_id)


@router.patch(
    "/{withdrawal_id}/cancel",
    response_model=WithdrawalActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Cancel pending withdrawal request",
    description="Cancels an existing pending withdrawal request and releases the reserved metal balance back to available holdings.",
)
async def cancel_withdrawal(
    withdrawal_id: str = Path(..., description="Withdrawal ID or Transaction ID to cancel"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to cancel pending withdrawal."""
    return cancel_customer_withdrawal(db, current_user, withdrawal_id)
