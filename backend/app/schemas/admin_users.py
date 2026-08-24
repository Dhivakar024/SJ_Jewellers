from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from app.schemas.profile import UserProfileData


class AdminUserListItem(BaseModel):
    """User item returned in paginated admin members list."""
    user_id: str = Field(..., description="Unique user identifier")
    name: str
    mobile: str
    email: Optional[str] = None
    role: str
    account_status: str
    kyc_status: str
    created_at: Optional[datetime] = None


class AdminUserListResponse(BaseModel):
    """Paginated user list response for Admin portal."""
    items: List[AdminUserListItem]
    page: int
    limit: int
    total: int
    total_pages: int


class AdminUserDetailResponse(BaseModel):
    """Complete user profile details for administrative inspection."""
    user_id: str
    name: str
    mobile: str
    email: Optional[str] = None
    role: str
    account_status: str
    kyc_status: str
    profile: UserProfileData
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AdminUpdateUserStatusRequest(BaseModel):
    """Payload to update a user's operational status."""
    status: str = Field(..., description="New account status: active, suspended, or banned")

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().lower()
            valid_statuses = ["active", "suspended", "banned"]
            if v not in valid_statuses:
                raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
            return v
        raise ValueError("Status is required")


class AdminUserStatusResponse(BaseModel):
    """Response returned upon successfully modifying account status."""
    message: str
    status: str
