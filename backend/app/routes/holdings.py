from typing import Dict, Any
from fastapi import APIRouter, Depends, Path, status
from pymongo.database import Database

from app.database.connection import get_database
from app.schemas.holdings import CustomerHoldingsResponse, SingleMetalHoldingResponse
from app.services.holdings_service import get_customer_holdings, get_customer_metal_holding
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/holdings", tags=["Holdings & Portfolio"])


@router.get(
    "/me",
    response_model=CustomerHoldingsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get customer complete holdings & portfolio valuation",
    description="Retrieves the authenticated customer's Gold and Silver quantity balances, invested amounts, average buy rates, and live market valuation with profit/loss.",
)
async def get_my_holdings(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to view full holdings balance and live valuation."""
    return get_customer_holdings(db, current_user)


@router.get(
    "/me/{metal}",
    response_model=SingleMetalHoldingResponse,
    status_code=status.HTTP_200_OK,
    summary="Get metal-specific holdings & valuation",
    description="Retrieves the authenticated customer's holdings, balance, and live market valuation strictly for the specified metal ('gold' or 'silver').",
)
async def get_my_metal_holding(
    metal: str = Path(..., description="Metal name: 'gold' or 'silver'"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to view single metal balance and valuation."""
    return get_customer_metal_holding(db, current_user, metal)
