from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class AddressSchema(BaseModel):
    """Postal address schema for KYC verification."""
    address_line: str = Field(..., min_length=1, max_length=200, description="Street address or line 1")
    city: str = Field(..., min_length=1, max_length=100, description="City name")
    state: str = Field(..., min_length=1, max_length=100, description="State or province")
    pincode: str = Field(..., min_length=4, max_length=10, description="Postal / ZIP code")

    @field_validator("address_line", "city", "state", "pincode", mode="before")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Address fields cannot be blank")
        return v


class KYCSubmitRequest(BaseModel):
    """Customer KYC submission payload."""
    full_name: str = Field(..., min_length=1, max_length=100, description="Full legal name as in ID proof")
    date_of_birth: str = Field(..., description="Date of birth (YYYY-MM-DD)")
    gender: str = Field(..., description="Gender (male, female, other)")
    address: AddressSchema = Field(..., description="Residential address")
    id_type: str = Field(..., description="Type of identification document")
    id_number: str = Field(..., min_length=3, max_length=50, description="Identification document number")

    @field_validator("full_name", "id_number", mode="before")
    @classmethod
    def strip_text(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Field cannot be empty")
        return v

    @field_validator("gender", mode="before")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().lower()
            if v not in ["male", "female", "other"]:
                raise ValueError("Gender must be one of: male, female, other")
        return v

    @field_validator("id_type", mode="before")
    @classmethod
    def validate_id_type(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().lower()
            valid_types = ["aadhaar", "pan", "passport", "driving_license", "voter_id"]
            if v not in valid_types:
                raise ValueError(f"ID type must be one of: {', '.join(valid_types)}")
        return v


class KYCRejectRequest(BaseModel):
    """Payload for rejecting a KYC submission."""
    reason: str = Field(..., min_length=1, max_length=500, description="Detailed reason for rejection")

    @field_validator("reason", mode="before")
    @classmethod
    def strip_reason(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Rejection reason is required")
        return v


class KYCResponse(BaseModel):
    """Complete KYC details response schema."""
    id: str = Field(..., description="KYC document ID")
    user_id: str = Field(..., description="Associated user ID")
    full_name: str
    date_of_birth: str
    gender: str
    address: AddressSchema
    id_type: str
    id_number: str
    status: str = Field(..., description="KYC status: pending, verified, rejected")
    rejection_reason: Optional[str] = None
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    updated_at: Optional[datetime] = None


class AdminKYCPendingItem(BaseModel):
    """Summary item for pending KYC list in admin portal."""
    kyc_id: str
    user_id: str
    name: str
    mobile: str
    status: str
    submitted_at: Optional[datetime] = None


class AdminKYCPendingListResponse(BaseModel):
    """Response containing list of pending KYC verification items."""
    items: List[AdminKYCPendingItem]
    total: int


class AdminKYCUserProfile(BaseModel):
    """Basic customer profile included in KYC admin details."""
    id: str
    name: str
    mobile: str
    email: Optional[str] = None
    account_status: str
    kyc_status: str


class AdminKYCDetailResponse(BaseModel):
    """Detailed KYC review response for Admin."""
    kyc: KYCResponse
    user: AdminKYCUserProfile


class KYCActionResponse(BaseModel):
    """Response returned upon approving or rejecting KYC."""
    message: str
    status: str
