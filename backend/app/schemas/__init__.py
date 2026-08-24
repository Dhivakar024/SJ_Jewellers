"""Pydantic request and response schemas package."""

from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    RegisterResponse,
    TokenResponse,
)
from app.schemas.kyc import (
    AddressSchema,
    KYCSubmitRequest,
    KYCRejectRequest,
    KYCResponse,
    AdminKYCPendingItem,
    AdminKYCPendingListResponse,
    AdminKYCUserProfile,
    AdminKYCDetailResponse,
    KYCActionResponse,
)

__all__ = [
    "UserRegisterRequest",
    "UserLoginRequest",
    "UserResponse",
    "RegisterResponse",
    "TokenResponse",
    "AddressSchema",
    "KYCSubmitRequest",
    "KYCRejectRequest",
    "KYCResponse",
    "AdminKYCPendingItem",
    "AdminKYCPendingListResponse",
    "AdminKYCUserProfile",
    "AdminKYCDetailResponse",
    "KYCActionResponse",
]
