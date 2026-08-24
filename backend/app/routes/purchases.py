from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Path, Query, status
from pymongo.database import Database

from app.database.connection import get_database
from app.schemas.purchases import (
    CreatePurchaseRequest,
    PurchaseResponse,
    CustomerPurchaseListResponse,
)
from app.services.purchase_service import (
    create_purchase,
    get_customer_purchases,
    get_customer_purchase_by_id,
)
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/purchases", tags=["Purchases"])


@router.post(
    "",
    response_model=PurchaseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Purchase Gold or Silver",
    description="Creates a new purchase for Gold or Silver. Securely calculates the purchase total and 3% GST based on the current active metal rate fetched directly from the database.",
)
async def buy_metal(
    data: CreatePurchaseRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to buy gold or silver."""
    return create_purchase(db, current_user, data)


@router.get(
    "",
    response_model=CustomerPurchaseListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get customer purchase history",
    description="Retrieves a paginated list of purchases belonging to the authenticated customer. Supports filtering by metal ('gold', 'silver') and status.",
)
async def list_my_purchases(
    metal: Optional[str] = Query(None, description="Filter by metal ('gold' or 'silver')"),
    status: Optional[str] = Query(None, description="Filter by purchase status ('completed', etc.)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to view personal purchase history."""
    return get_customer_purchases(
        db=db,
        current_user=current_user,
        metal=metal,
        status_filter=status,
        page=page,
        limit=limit,
    )


@router.get(
    "/{purchase_id}",
    response_model=PurchaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single purchase details",
    description="Retrieves full details for a specific purchase ID or transaction ID belonging to the authenticated customer.",
)
async def get_single_purchase(
    purchase_id: str = Path(..., description="Purchase ID or Transaction ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to inspect a single purchase."""
    return get_customer_purchase_by_id(db, current_user, purchase_id)
