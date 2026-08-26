from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, status
from pymongo.database import Database

from app.database.connection import get_database
from app.schemas.admin_dashboard import (
    AdminDashboardOverviewResponse,
    SalesByMetalResponse,
    SalesByMetalTransactionsResponse,
    SalesChartResponse,
    PendingKYCCountResponse,
    WithdrawalsSummaryResponse,
    DashboardRecentTransactionsResponse,
    DashboardRecentMembersResponse,
    CustomerGrowthResponse,
    TransactionStatsResponse,
    DashboardCurrentRatesResponse,
    DashboardNotificationSummaryResponse,
)
from app.services.admin_dashboard_service import (
    get_dashboard_overview,
    get_sales_by_metal,
    get_sales_by_metal_transactions,
    get_sales_chart,
    get_pending_kyc_count,
    get_withdrawals_summary,
    get_dashboard_recent_transactions,
    get_dashboard_recent_members,
    get_customer_growth,
    get_transaction_stats,
    get_dashboard_current_rates,
    get_dashboard_notification_summary,
)
from app.utils.security import require_admin

router = APIRouter(prefix="/api/admin/dashboard", tags=["Admin Dashboard"])


@router.get(
    "",
    response_model=AdminDashboardOverviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Get main admin dashboard overview",
    description="Retrieves live top-level summary metrics across customers, Gold & Silver holdings, cumulative sales values, KYC queues, withdrawal requests, and unread admin notifications.",
)
async def dashboard_overview(
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Main overview summary for Admin Dashboard."""
    return get_dashboard_overview(db, admin_user)


@router.get(
    "/sales-by-metal",
    response_model=SalesByMetalResponse,
    status_code=status.HTTP_200_OK,
    summary="Get sales value by metal",
    description="Powers the Sales by Metal (Value) interactive graph. Computes cumulative completed sales values and transaction counts for Gold and Silver.",
)
async def sales_by_metal(
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Sales value and transaction volume breakdown by metal."""
    return get_sales_by_metal(db)


@router.get(
    "/sales-by-metal/transactions",
    response_model=SalesByMetalTransactionsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get sales transaction counts by metal",
    description="Powers the Sales by Metal (Transactions) interactive graph. Returns completed purchase transaction counts for Gold and Silver.",
)
async def sales_by_metal_transactions(
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Sales transaction count breakdown by metal."""
    return get_sales_by_metal_transactions(db)


@router.get(
    "/sales-chart",
    response_model=SalesChartResponse,
    status_code=status.HTTP_200_OK,
    summary="Get sales timeline timeseries for charts",
    description="Retrieves a continuous, chronological sequence of daily sales values for Gold, Silver, and total sales across selected period (7d, 30d, 90d, 1y) or custom date range.",
)
async def sales_chart(
    period: str = Query("30d", description="Time period ('7d', '30d', '90d', '1y')"),
    metal: str = Query("all", description="Metal filter ('gold', 'silver', 'all')"),
    from_date: Optional[str] = Query(None, description="Custom start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="Custom end date (YYYY-MM-DD)"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Continuous timeseries data for Sales interactive charts."""
    return get_sales_chart(
        db=db,
        period=period,
        metal=metal,
        from_date=from_date,
        to_date=to_date,
    )


@router.get(
    "/pending-kyc",
    response_model=PendingKYCCountResponse,
    status_code=status.HTTP_200_OK,
    summary="Get pending KYC verification count",
    description="Returns the total number of customer KYC submissions currently awaiting admin review.",
)
async def pending_kyc_count(
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Pending KYC count indicator."""
    return get_pending_kyc_count(db)


@router.get(
    "/withdrawals-summary",
    response_model=WithdrawalsSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get withdrawal requests summary",
    description="Returns aggregate counts of withdrawal requests partitioned by status (pending, approved, rejected, cancelled) and metal (gold, silver).",
)
async def withdrawals_summary(
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Withdrawals queue breakdown."""
    return get_withdrawals_summary(db)


@router.get(
    "/recent-transactions",
    response_model=DashboardRecentTransactionsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get latest transactions for dashboard timeline",
    description="Retrieves the latest purchases and withdrawals combined, with customer names attached.",
)
async def recent_transactions(
    limit: int = Query(10, ge=1, le=50, description="Maximum number of items to return"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Recent transaction activity list."""
    return get_dashboard_recent_transactions(db, limit=limit)


@router.get(
    "/recent-members",
    response_model=DashboardRecentMembersResponse,
    status_code=status.HTTP_200_OK,
    summary="Get recently registered members",
    description="Retrieves the newest customer registrations with registration timestamps and account statuses.",
)
async def recent_members(
    limit: int = Query(10, ge=1, le=50, description="Maximum number of items to return"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Recently joined customers list."""
    return get_dashboard_recent_members(db, limit=limit)


@router.get(
    "/customer-growth",
    response_model=CustomerGrowthResponse,
    status_code=status.HTTP_200_OK,
    summary="Get customer growth statistics",
    description="Retrieves daily new customer registrations and running cumulative customer totals for growth analytics.",
)
async def customer_growth(
    period: str = Query("30d", description="Time period ('7d', '30d', '90d', '1y')"),
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Customer registration and growth timeline."""
    return get_customer_growth(db, period=period)


@router.get(
    "/transaction-stats",
    response_model=TransactionStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get detailed transaction status statistics",
    description="Retrieves total counts of purchases and withdrawals partitioned by their lifecycle statuses.",
)
async def transaction_stats(
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Transaction status counts."""
    return get_transaction_stats(db)


@router.get(
    "/current-rates",
    response_model=DashboardCurrentRatesResponse,
    status_code=status.HTTP_200_OK,
    summary="Get operational metal rates for dashboard",
    description="Retrieves live Gold and Silver buy and sell rates directly from the operational Rates engine.",
)
async def current_rates(
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Current live metal rates for dashboard cards."""
    return get_dashboard_current_rates(db)


@router.get(
    "/notification-summary",
    response_model=DashboardNotificationSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get unread notification count for dashboard",
    description="Retrieves unread notification count for administrative alerts badge.",
)
async def notification_summary(
    admin_user: Dict[str, Any] = Depends(require_admin),
    db: Database = Depends(get_database),
):
    """Unread notifications summary count."""
    return get_dashboard_notification_summary(db, admin_user)
