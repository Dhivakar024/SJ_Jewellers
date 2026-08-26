from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, field_validator


class CreateWithdrawalRequest(BaseModel):
    """Payload for submitting a withdrawal request."""
    metal: str = Field(..., description="Metal to withdraw: 'gold' or 'silver'")
    quantity_grams: float = Field(..., gt=0, description="Quantity in grams to withdraw")
    withdrawal_mode: str = Field("physical", description="Withdrawal mode (e.g. 'physical')")

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

    @field_validator("withdrawal_mode", mode="before")
    @classmethod
    def normalize_mode(cls, v: Optional[str]) -> str:
        if isinstance(v, str):
            cleaned = v.strip().lower()
            return cleaned if cleaned else "physical"
        return "physical"


class WithdrawalResponse(BaseModel):
    """Customer withdrawal details response."""
    withdrawal_id: str
    transaction_id: str
    metal: str
    quantity_grams: float
    rate_per_gram: float
    metal_value: float
    withdrawal_mode: str
    status: str
    rejection_reason: Optional[str] = None
    admin_note: Optional[str] = None
    created_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None


class CustomerWithdrawalListResponse(BaseModel):
    """Paginated list of customer withdrawals."""
    items: List[WithdrawalResponse]
    page: int
    limit: int
    total: int
    total_pages: int


class AdminWithdrawalRejectRequest(BaseModel):
    """Payload for administrative withdrawal rejection."""
    reason: str = Field(..., min_length=1, description="Mandatory reason for rejection")

    @field_validator("reason", mode="before")
    @classmethod
    def validate_reason(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Rejection reason is required")
            return v
        raise ValueError("Rejection reason is required")


class AdminWithdrawalCustomerInfo(BaseModel):
    """Customer profile summary attached to withdrawal in admin portal."""
    user_id: str
    name: str
    mobile: str
    email: Optional[str] = None
    kyc_status: str


class AdminWithdrawalListItem(BaseModel):
    """Withdrawal summary item in admin withdrawal queue."""
    withdrawal_id: str
    transaction_id: str
    customer: AdminWithdrawalCustomerInfo
    metal: str
    quantity_grams: float
    rate_per_gram: float
    metal_value: float
    withdrawal_mode: str
    status: str
    created_at: Optional[datetime] = None


class AdminWithdrawalListResponse(BaseModel):
    """Paginated withdrawal list for Admin portal."""
    items: List[AdminWithdrawalListItem]
    page: int
    limit: int
    total: int
    total_pages: int


class AdminWithdrawalDetailResponse(BaseModel):
    """Full withdrawal inspection response for Admin."""
    withdrawal_id: str
    transaction_id: str
    customer: AdminWithdrawalCustomerInfo
    metal: str
    quantity_grams: float
    rate_per_gram: float
    metal_value: float
    withdrawal_mode: str
    status: str
    rejection_reason: Optional[str] = None
    admin_note: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None


class WithdrawalActionResponse(BaseModel):
    """Response returned upon approving, rejecting, or cancelling a withdrawal."""
    message: str
    withdrawal_id: str
    status: str
