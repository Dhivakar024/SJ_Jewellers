from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class CreatePurchaseRequest(BaseModel):
    """Payload for customer gold or silver purchase."""
    metal: str = Field(..., description="Metal type: 'gold' or 'silver'")
    quantity_grams: float = Field(..., gt=0, description="Weight in grams to purchase")

    @field_validator("metal", mode="before")
    @classmethod
    def normalize_metal(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().lower()
            if v not in ["gold", "silver"]:
                raise ValueError("Metal must be either 'gold' or 'silver'")
            return v
        raise ValueError("Metal is required and must be a string")

    @field_validator("quantity_grams", mode="before")
    @classmethod
    def validate_quantity(cls, v: Any) -> float:
        try:
            val = float(v)
            if val <= 0:
                raise ValueError("Quantity must be greater than 0")
            return val
        except (TypeError, ValueError):
            raise ValueError("Quantity must be a valid positive number")


class PurchaseResponse(BaseModel):
    """Customer purchase details response."""
    purchase_id: str
    transaction_id: str
    metal: str
    quantity_grams: float
    rate_per_gram: float
    metal_value: float
    gst_rate_percent: float
    gst_amount: float
    total_amount: float
    currency: str = "INR"
    status: str
    payment_status: str
    created_at: Optional[datetime] = None


class CustomerPurchaseListResponse(BaseModel):
    """Paginated list of customer purchases."""
    items: List[PurchaseResponse]
    page: int
    limit: int
    total: int
    total_pages: int


class AdminPurchaseCustomerInfo(BaseModel):
    """Customer summary attached to purchase records in admin portal."""
    user_id: str
    name: str
    mobile: str
    email: Optional[str] = None


class AdminPurchaseListItem(BaseModel):
    """Purchase summary item in admin purchase list."""
    purchase_id: str
    transaction_id: str
    customer: AdminPurchaseCustomerInfo
    metal: str
    quantity_grams: float
    rate_per_gram: float
    total_amount: float
    status: str
    payment_status: str
    created_at: Optional[datetime] = None


class AdminPurchaseListResponse(BaseModel):
    """Paginated purchase list for admin portal."""
    items: List[AdminPurchaseListItem]
    page: int
    limit: int
    total: int
    total_pages: int


class AdminPurchaseDetailResponse(BaseModel):
    """Detailed purchase inspection response for admin."""
    purchase_id: str
    transaction_id: str
    customer: AdminPurchaseCustomerInfo
    metal: str
    quantity_grams: float
    rate_per_gram: float
    metal_value: float
    gst_rate_percent: float
    gst_amount: float
    total_amount: float
    currency: str = "INR"
    status: str
    payment_status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
