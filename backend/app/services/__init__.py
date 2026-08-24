"""Business logic and service layer package."""

from app.services.auth_service import (
    register_user,
    login_user,
    format_user_response,
    ensure_user_indexes,
)
from app.services.kyc_service import (
    submit_kyc,
    get_user_kyc,
    get_pending_kyc_list,
    get_kyc_details,
    approve_kyc,
    reject_kyc,
    format_kyc_response,
    ensure_kyc_indexes,
)
from app.services.metal_rates_service import (
    get_rates_public,
    get_rates_admin,
    set_custom_rates,
    refresh_api_rates,
    get_rate_history,
    ensure_rates_initialized,
    get_end_of_day_expiry,
)

__all__ = [
    "register_user",
    "login_user",
    "format_user_response",
    "ensure_user_indexes",
    "submit_kyc",
    "get_user_kyc",
    "get_pending_kyc_list",
    "get_kyc_details",
    "approve_kyc",
    "reject_kyc",
    "format_kyc_response",
    "ensure_kyc_indexes",
    "get_rates_public",
    "get_rates_admin",
    "set_custom_rates",
    "refresh_api_rates",
    "get_rate_history",
    "ensure_rates_initialized",
    "get_end_of_day_expiry",
]
