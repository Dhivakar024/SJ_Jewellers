from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# 1. Dashboard Overview Schemas
class CustomerStatsSummary(BaseModel):
    total: int = 0
    active: int = 0
    blocked: int = 0  # suspended + banned


class MetalStatsSummary(BaseModel):
    total_holdings_grams: float = 0.0
    total_sales_value: float = 0.0
    total_transactions: int = 0


class KYCStatsSummary(BaseModel):
    pending: int = 0
    approved: int = 0  # verified
    rejected: int = 0


class WithdrawalStatsSummary(BaseModel):
    pending: int = 0
    approved: int = 0
    rejected: int = 0


class NotificationStatsSummary(BaseModel):
    unread: int = 0


class AdminDashboardOverviewResponse(BaseModel):
    customers: CustomerStatsSummary
    gold: MetalStatsSummary
    silver: MetalStatsSummary
    kyc: KYCStatsSummary
    withdrawals: WithdrawalStatsSummary
    notifications: NotificationStatsSummary


# 2. Sales by Metal Schemas
class MetalSalesValue(BaseModel):
    value: float = 0.0
    transactions: int = 0


class SalesByMetalResponse(BaseModel):
    gold: MetalSalesValue
    silver: MetalSalesValue


class MetalTransactionsCount(BaseModel):
    transactions: int = 0


class SalesByMetalTransactionsResponse(BaseModel):
    gold: MetalTransactionsCount
    silver: MetalTransactionsCount


# 3. Date-based Sales Chart Schemas
class SalesChartDataPoint(BaseModel):
    date: str = Field(..., description="ISO Date string (YYYY-MM-DD)")
    gold: float = 0.0
    silver: float = 0.0
    total: float = 0.0


class SalesChartResponse(BaseModel):
    period: str
    data: List[SalesChartDataPoint]


# 4. KYC & Withdrawal Summaries
class PendingKYCCountResponse(BaseModel):
    count: int = 0


class MetalWithdrawalBreakdown(BaseModel):
    pending: int = 0
    approved: int = 0
    rejected: int = 0


class WithdrawalsSummaryResponse(BaseModel):
    pending: int = 0
    approved: int = 0
    rejected: int = 0
    cancelled: int = 0
    gold: MetalWithdrawalBreakdown
    silver: MetalWithdrawalBreakdown


# 5. Recent Activity Schemas
class DashboardRecentTransactionItem(BaseModel):
    transaction_id: str
    customer_name: str
    type: str  # purchase, withdrawal
    metal: str  # gold, silver
    direction: str  # credit, debit
    quantity_grams: float
    total_amount: float
    status: str
    created_at: datetime


class DashboardRecentTransactionsResponse(BaseModel):
    items: List[DashboardRecentTransactionItem]


class DashboardRecentMemberItem(BaseModel):
    user_id: str
    name: str
    email: Optional[str] = None
    mobile: str
    status: str
    created_at: datetime


class DashboardRecentMembersResponse(BaseModel):
    items: List[DashboardRecentMemberItem]


# 6. Customer Growth Schemas
class CustomerGrowthDataPoint(BaseModel):
    date: str = Field(..., description="ISO Date string (YYYY-MM-DD)")
    new_customers: int = 0
    total_customers: int = 0


class CustomerGrowthResponse(BaseModel):
    period: str
    data: List[CustomerGrowthDataPoint]


# 7. Transaction Stats Schemas
class PurchaseStatusStats(BaseModel):
    total: int = 0
    completed: int = 0
    pending: int = 0
    failed: int = 0
    cancelled: int = 0


class WithdrawalStatusStats(BaseModel):
    total: int = 0
    pending: int = 0
    approved: int = 0
    rejected: int = 0
    cancelled: int = 0


class MetalTransactionStats(BaseModel):
    purchases: int = 0
    withdrawals: int = 0


class TransactionStatsResponse(BaseModel):
    purchases: PurchaseStatusStats
    withdrawals: WithdrawalStatusStats
    gold: MetalTransactionStats
    silver: MetalTransactionStats


# 8. Rates & Notifications Summaries
class MetalRateSummaryItem(BaseModel):
    buy_rate: float
    sell_rate: float
    updated_at: datetime


class DashboardCurrentRatesResponse(BaseModel):
    gold: MetalRateSummaryItem
    silver: MetalRateSummaryItem


class DashboardNotificationSummaryResponse(BaseModel):
    unread: int = 0
