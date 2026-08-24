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
from app.schemas.rates import (
    MetalRatePublicResponse,
    RatesPublicResponse,
    MetalRateAdminResponse,
    RatesAdminResponse,
    MetalCustomRateInput,
    SetCustomRatesRequest,
    MetalRateSummary,
    RefreshRatesResponse,
    RateHistoryItem,
    RateHistoryResponse,
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
    "MetalRatePublicResponse",
    "RatesPublicResponse",
    "MetalRateAdminResponse",
    "RatesAdminResponse",
    "MetalCustomRateInput",
    "SetCustomRatesRequest",
    "MetalRateSummary",
    "RefreshRatesResponse",
    "RateHistoryItem",
    "RateHistoryResponse",
]
