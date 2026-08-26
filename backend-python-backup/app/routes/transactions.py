from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Path, Query, status
from pymongo.database import Database

from app.database.connection import get_database
from app.schemas.transactions import (
    CustomerTransactionListResponse,
    UnifiedTransactionItem,
)
from app.services.transaction_service import (
    get_customer_transactions,
    get_customer_transaction_by_id,
)
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.get(
    "",
    response_model=CustomerTransactionListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get unified customer transaction history",
    description="Retrieves a paginated list of unified transactions (both purchases and withdrawals) sorted newest first. Supports filtering by type ('purchase', 'withdrawal'), metal ('gold', 'silver'), direction ('credit', 'debit'), status, date range, and transaction ID search.",
)
async def list_my_transactions(
    type: Optional[str] = Query(None, description="Filter by transaction type ('purchase', 'withdrawal')"),
    metal: Optional[str] = Query(None, description="Filter by metal ('gold', 'silver')"),
    direction: Optional[str] = Query(None, description="Filter by direction ('credit', 'debit')"),
    status: Optional[str] = Query(None, description="Filter by transaction status"),
    from_date: Optional[str] = Query(None, description="Filter start date in YYYY-MM-DD format"),
    to_date: Optional[str] = Query(None, description="Filter end date in YYYY-MM-DD format"),
    search: Optional[str] = Query(None, description="Search by transaction ID"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to view personal unified transaction timeline."""
    return get_customer_transactions(
        db=db,
        current_user=current_user,
        txn_type=type,
        metal=metal,
        status_filter=status,
        direction=direction,
        from_date=from_date,
        to_date=to_date,
        search=search,
        page=page,
        limit=limit,
    )


@router.get(
    "/{transaction_id}",
    response_model=UnifiedTransactionItem,
    status_code=status.HTTP_200_OK,
    summary="Get single transaction detail",
    description="Retrieves full normalized details for a specific transaction ID belonging to the authenticated customer.",
)
async def get_single_transaction(
    transaction_id: str = Path(..., description="Unique Transaction ID (e.g. GOLD-20260824-... or WD-20260824-...)"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to view a specific transaction."""
    return get_customer_transaction_by_id(db, current_user, transaction_id)
