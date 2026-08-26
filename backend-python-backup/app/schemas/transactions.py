from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class UnifiedTransactionItem(BaseModel):
    """Normalized transaction item representing a purchase or withdrawal."""
    transaction_id: str
    type: str = Field(..., description="Transaction type: 'purchase' or 'withdrawal'")
    metal: str = Field(..., description="Metal: 'gold' or 'silver'")
    direction: str = Field(..., description="Accounting direction: 'credit' for purchases, 'debit' for withdrawals")
    quantity_grams: float
    rate_per_gram: float
    metal_value: float
    gst_amount: float = 0.0
    total_amount: float
    status: str
    created_at: datetime


class CustomerTransactionListResponse(BaseModel):
    """Paginated list of customer unified transactions."""
    items: List[UnifiedTransactionItem]
    page: int
    limit: int
    total: int
    total_pages: int


class AdminTransactionCustomerInfo(BaseModel):
    """Customer profile summary attached to transactions for Admin review."""
    user_id: str
    name: str
    email: Optional[str] = None
    mobile: str


class AdminUnifiedTransactionItem(BaseModel):
    """Unified transaction item in admin transaction list."""
    transaction_id: str
    customer: AdminTransactionCustomerInfo
    type: str
    metal: str
    direction: str
    quantity_grams: float
    rate_per_gram: float
    metal_value: float
    gst_amount: float = 0.0
    total_amount: float
    status: str
    created_at: datetime


class AdminTransactionListResponse(BaseModel):
    """Paginated list of all customer transactions for Admin portal."""
    items: List[AdminUnifiedTransactionItem]
    page: int
    limit: int
    total: int
    total_pages: int


class AdminTransactionDetailResponse(BaseModel):
    """Detailed transaction inspection for Admin."""
    transaction_id: str
    customer: AdminTransactionCustomerInfo
    type: str
    metal: str
    direction: str
    quantity_grams: float
    rate_per_gram: float
    metal_value: float
    gst_amount: float = 0.0
    total_amount: float
    status: str
    created_at: datetime
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    admin_note: Optional[str] = None
    withdrawal_mode: Optional[str] = None
    payment_status: Optional[str] = None
