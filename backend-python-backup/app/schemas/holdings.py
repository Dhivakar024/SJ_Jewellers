from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class MetalHoldingValuation(BaseModel):
    """Detailed holdings and live market valuation for a specific metal."""
    quantity_grams: float = Field(..., description="Total weight in grams currently held")
    total_invested: float = Field(..., description="Cumulative investment amount in INR")
    average_buy_rate: float = Field(..., description="Weighted average purchase rate per gram in INR")
    current_rate: float = Field(..., description="Live active market rate per gram in INR")
    current_value: float = Field(..., description="Current market valuation in INR")
    profit_loss: float = Field(..., description="Unrealized profit or loss in INR")


class CustomerHoldingsResponse(BaseModel):
    """Complete portfolio balance and live valuation response for customer."""
    gold: MetalHoldingValuation
    silver: MetalHoldingValuation
    total_invested: float = Field(..., description="Total investment across gold and silver in INR")
    total_current_value: float = Field(..., description="Total current market value across metals in INR")
    total_profit_loss: float = Field(..., description="Total unrealized profit or loss in INR")


class SingleMetalHoldingResponse(BaseModel):
    """Valuation response for a single metal (gold or silver)."""
    metal: str
    quantity_grams: float
    total_invested: float
    average_buy_rate: float
    current_rate: float
    current_value: float
    profit_loss: float


class AdminCustomerHoldingsResponse(BaseModel):
    """Customer holdings overview for administrative inspection."""
    user_id: str
    customer_name: str
    customer_mobile: str
    customer_email: Optional[str] = None
    gold: MetalHoldingValuation
    silver: MetalHoldingValuation
    total_invested: float
    total_current_value: float
    total_profit_loss: float
    updated_at: Optional[datetime] = None


class AdminHoldingsListItem(BaseModel):
    """Summary item in admin holdings list."""
    user_id: str
    customer_name: str
    customer_mobile: str
    customer_email: Optional[str] = None
    gold_quantity: float
    gold_invested: float
    silver_quantity: float
    silver_invested: float
    total_invested: float
    total_current_value: float
    total_profit_loss: float
    updated_at: Optional[datetime] = None


class AdminHoldingsListResponse(BaseModel):
    """Paginated list of all customer holdings for Admin portal."""
    items: List[AdminHoldingsListItem]
    page: int
    limit: int
    total: int
    total_pages: int
