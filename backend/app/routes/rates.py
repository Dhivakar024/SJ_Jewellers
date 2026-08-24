from fastapi import APIRouter, Depends, status
from pymongo.database import Database

from app.database.connection import get_database
from app.schemas.rates import RatesPublicResponse
from app.services.metal_rates_service import get_rates_public

router = APIRouter(prefix="/api/rates", tags=["Rates"])


@router.get(
    "",
    response_model=RatesPublicResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current public Gold and Silver rates",
    description="Returns the active operational rates for Gold and Silver. Used by User App and Admin Panel for purchases, valuations, and charts without requiring authentication.",
)
async def get_current_rates(db: Database = Depends(get_database)):
    """Public endpoint to fetch active metal rates."""
    return get_rates_public(db)
