"""API Routes Package."""

from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.users import router as users_router
from app.routes.kyc import router as kyc_router
from app.routes.rates import router as rates_router
from app.routes.purchases import router as purchases_router
from app.routes.holdings import router as holdings_router
from app.routes.withdrawals import router as withdrawals_router
from app.routes.transactions import router as transactions_router
from app.routes.notifications import router as notifications_router
from app.routes.admin import router as admin_router

__all__ = [
    "auth_router",
    "profile_router",
    "users_router",
    "kyc_router",
    "rates_router",
    "purchases_router",
    "holdings_router",
    "withdrawals_router",
    "transactions_router",
    "notifications_router",
    "admin_router",
]
