import math
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List, Tuple
from bson import ObjectId
from pymongo.database import Database
from fastapi import HTTPException, status

from app.schemas.admin_dashboard import (
    CustomerStatsSummary,
    MetalStatsSummary,
    KYCStatsSummary,
    WithdrawalStatsSummary,
    NotificationStatsSummary,
    AdminDashboardOverviewResponse,
    MetalSalesValue,
    SalesByMetalResponse,
    MetalTransactionsCount,
    SalesByMetalTransactionsResponse,
    SalesChartDataPoint,
    SalesChartResponse,
    PendingKYCCountResponse,
    MetalWithdrawalBreakdown,
    WithdrawalsSummaryResponse,
    DashboardRecentTransactionItem,
    DashboardRecentTransactionsResponse,
    DashboardRecentMemberItem,
    DashboardRecentMembersResponse,
    CustomerGrowthDataPoint,
    CustomerGrowthResponse,
    PurchaseStatusStats,
    WithdrawalStatusStats,
    MetalTransactionStats,
    TransactionStatsResponse,
    MetalRateSummaryItem,
    DashboardCurrentRatesResponse,
    DashboardNotificationSummaryResponse,
)
from app.services.metal_rates_service import (
    get_rates_public,
    DEFAULT_GOLD_RATE,
    DEFAULT_SILVER_RATE,
)
from app.services.notification_service import (
    get_unread_notification_count,
)


def _round_2(val: Any) -> float:
    """Format float or decimal safely to 2 decimal places."""
    try:
        return round(float(val), 2)
    except Exception:
        return 0.0


def _get_period_dates(period: str, from_date_str: Optional[str] = None, to_date_str: Optional[str] = None) -> Tuple[datetime, datetime, List[str]]:
    """Resolve start datetime, end datetime, and list of continuous daily date strings (YYYY-MM-DD)."""
    now = datetime.now(timezone.utc)
    
    if from_date_str or to_date_str:
        if not from_date_str or not to_date_str:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Both from_date and to_date must be provided for custom date ranges",
            )
        try:
            start_dt = datetime.strptime(from_date_str.strip(), "%Y-%m-%d").replace(
                hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc
            )
            end_dt = datetime.strptime(to_date_str.strip(), "%Y-%m-%d").replace(
                hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dates must follow YYYY-MM-DD format",
            )
        if start_dt > end_dt:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="from_date cannot be after to_date",
            )
    else:
        period_map = {
            "7d": 7,
            "30d": 30,
            "90d": 90,
            "1y": 365,
        }
        days = period_map.get(period.lower().strip() if period else "30d")
        if not days:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid period. Allowed values: '7d', '30d', '90d', '1y'",
            )
        start_dt = (now - timedelta(days=days - 1)).replace(hour=0, minute=0, second=0, microsecond=0)
        end_dt = now.replace(hour=23, minute=59, second=59, microsecond=999999)

    # Generate continuous date strings
    curr = start_dt
    date_keys = []
    while curr <= end_dt:
        date_keys.append(curr.strftime("%Y-%m-%d"))
        curr += timedelta(days=1)

    return start_dt, end_dt, date_keys


def get_dashboard_overview(db: Database, admin_user: Dict[str, Any]) -> AdminDashboardOverviewResponse:
    """Retrieve top-level dashboard metrics for customers, metal holdings, sales, KYC, withdrawals, and notifications."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    # 1. Customer metrics
    total_cust = db.users.count_documents({"role": "customer"})
    active_cust = db.users.count_documents({"role": "customer", "account_status": "active"})
    blocked_cust = db.users.count_documents({"role": "customer", "account_status": {"$in": ["suspended", "banned"]}})

    # 2. Holdings metrics
    holdings_agg = list(db.holdings.aggregate([
        {"$group": {
            "_id": None,
            "total_gold": {"$sum": "$gold.quantity_grams"},
            "total_silver": {"$sum": "$silver.quantity_grams"},
        }}
    ]))
    gold_holdings_grams = _round_2(holdings_agg[0]["total_gold"]) if holdings_agg else 0.0
    silver_holdings_grams = _round_2(holdings_agg[0]["total_silver"]) if holdings_agg else 0.0

    # 3. Sales metrics (completed purchases)
    sales_agg = list(db.purchases.aggregate([
        {"$match": {"status": "completed"}},
        {"$group": {
            "_id": "$metal",
            "total_val": {"$sum": "$total_amount"},
            "txns_count": {"$sum": 1},
        }}
    ]))
    sales_map = {item["_id"]: item for item in sales_agg}

    gold_sales_val = _round_2(sales_map.get("gold", {}).get("total_val", 0.0))
    gold_sales_txns = sales_map.get("gold", {}).get("txns_count", 0)

    silver_sales_val = _round_2(sales_map.get("silver", {}).get("total_val", 0.0))
    silver_sales_txns = sales_map.get("silver", {}).get("txns_count", 0)

    # 4. KYC metrics
    kyc_pending = db.kyc.count_documents({"status": "pending"})
    kyc_approved = db.kyc.count_documents({"status": "verified"})
    kyc_rejected = db.kyc.count_documents({"status": "rejected"})

    # 5. Withdrawals metrics
    wd_pending = db.withdrawals.count_documents({"status": "pending"})
    wd_approved = db.withdrawals.count_documents({"status": "approved"})
    wd_rejected = db.withdrawals.count_documents({"status": "rejected"})

    # 6. Notifications unread
    unread_notifs = get_unread_notification_count(db, admin_user.get("id", admin_user.get("_id")), recipient_type="admin")

    return AdminDashboardOverviewResponse(
        customers=CustomerStatsSummary(
            total=total_cust,
            active=active_cust,
            blocked=blocked_cust,
        ),
        gold=MetalStatsSummary(
            total_holdings_grams=gold_holdings_grams,
            total_sales_value=gold_sales_val,
            total_transactions=gold_sales_txns,
        ),
        silver=MetalStatsSummary(
            total_holdings_grams=silver_holdings_grams,
            total_sales_value=silver_sales_val,
            total_transactions=silver_sales_txns,
        ),
        kyc=KYCStatsSummary(
            pending=kyc_pending,
            approved=kyc_approved,
            rejected=kyc_rejected,
        ),
        withdrawals=WithdrawalStatsSummary(
            pending=wd_pending,
            approved=wd_approved,
            rejected=wd_rejected,
        ),
        notifications=NotificationStatsSummary(
            unread=unread_notifs,
        ),
    )


def get_sales_by_metal(db: Database) -> SalesByMetalResponse:
    """Retrieve cumulative completed sales value and transaction count by metal."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    sales_agg = list(db.purchases.aggregate([
        {"$match": {"status": "completed"}},
        {"$group": {
            "_id": "$metal",
            "total_val": {"$sum": "$total_amount"},
            "txns_count": {"$sum": 1},
        }}
    ]))
    sales_map = {item["_id"]: item for item in sales_agg}

    return SalesByMetalResponse(
        gold=MetalSalesValue(
            value=_round_2(sales_map.get("gold", {}).get("total_val", 0.0)),
            transactions=sales_map.get("gold", {}).get("txns_count", 0),
        ),
        silver=MetalSalesValue(
            value=_round_2(sales_map.get("silver", {}).get("total_val", 0.0)),
            transactions=sales_map.get("silver", {}).get("txns_count", 0),
        ),
    )


def get_sales_by_metal_transactions(db: Database) -> SalesByMetalTransactionsResponse:
    """Retrieve completed sales transaction count for Gold and Silver."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    gold_count = db.purchases.count_documents({"status": "completed", "metal": "gold"})
    silver_count = db.purchases.count_documents({"status": "completed", "metal": "silver"})

    return SalesByMetalTransactionsResponse(
        gold=MetalTransactionsCount(transactions=gold_count),
        silver=MetalTransactionsCount(transactions=silver_count),
    )


def get_sales_chart(
    db: Database,
    period: str = "30d",
    metal: str = "all",
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
) -> SalesChartResponse:
    """Retrieve continuous date-based sales timeseries for Gold, Silver, and total."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    metal_filter = metal.lower().strip() if metal else "all"
    if metal_filter not in ["gold", "silver", "all"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="metal must be 'gold', 'silver', or 'all'")

    start_dt, end_dt, date_keys = _get_period_dates(period, from_date, to_date)

    match_stage: Dict[str, Any] = {
        "status": "completed",
        "created_at": {"$gte": start_dt, "$lte": end_dt},
    }
    if metal_filter in ["gold", "silver"]:
        match_stage["metal"] = metal_filter

    pipeline = [
        {"$match": match_stage},
        {
            "$group": {
                "_id": {
                    "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                    "metal": "$metal",
                },
                "daily_sales": {"$sum": "$total_amount"},
            }
        },
    ]

    agg_results = list(db.purchases.aggregate(pipeline))

    # Build continuous chronological map
    data_map: Dict[str, Dict[str, float]] = {
        dk: {"gold": 0.0, "silver": 0.0} for dk in date_keys
    }

    for item in agg_results:
        d_str = item["_id"].get("date")
        m_str = item["_id"].get("metal")
        amt = float(item.get("daily_sales", 0.0))
        if d_str in data_map:
            if m_str == "gold":
                data_map[d_str]["gold"] = amt
            elif m_str == "silver":
                data_map[d_str]["silver"] = amt

    points: List[SalesChartDataPoint] = []
    for dk in date_keys:
        g_val = _round_2(data_map[dk]["gold"])
        s_val = _round_2(data_map[dk]["silver"])
        if metal_filter == "gold":
            points.append(SalesChartDataPoint(date=dk, gold=g_val, silver=0.0, total=g_val))
        elif metal_filter == "silver":
            points.append(SalesChartDataPoint(date=dk, gold=0.0, silver=s_val, total=s_val))
        else:
            points.append(SalesChartDataPoint(date=dk, gold=g_val, silver=s_val, total=_round_2(g_val + s_val)))

    return SalesChartResponse(
        period=period,
        data=points,
    )


def get_pending_kyc_count(db: Database) -> PendingKYCCountResponse:
    """Retrieve current pending KYC count for Admin."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")
    count = db.kyc.count_documents({"status": "pending"})
    return PendingKYCCountResponse(count=count)


def get_withdrawals_summary(db: Database) -> WithdrawalsSummaryResponse:
    """Retrieve full breakdown of withdrawal requests by status and metal."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    agg = list(db.withdrawals.aggregate([
        {
            "$group": {
                "_id": {"status": "$status", "metal": "$metal"},
                "count": {"$sum": 1},
            }
        }
    ]))

    counts: Dict[str, Dict[str, int]] = {
        "gold": {"pending": 0, "approved": 0, "rejected": 0, "cancelled": 0},
        "silver": {"pending": 0, "approved": 0, "rejected": 0, "cancelled": 0},
    }

    for item in agg:
        st = item["_id"].get("status", "")
        mt = item["_id"].get("metal", "")
        cnt = int(item.get("count", 0))
        if mt in counts and st in counts[mt]:
            counts[mt][st] = cnt

    total_pending = counts["gold"]["pending"] + counts["silver"]["pending"]
    total_approved = counts["gold"]["approved"] + counts["silver"]["approved"]
    total_rejected = counts["gold"]["rejected"] + counts["silver"]["rejected"]
    total_cancelled = counts["gold"]["cancelled"] + counts["silver"]["cancelled"]

    return WithdrawalsSummaryResponse(
        pending=total_pending,
        approved=total_approved,
        rejected=total_rejected,
        cancelled=total_cancelled,
        gold=MetalWithdrawalBreakdown(
            pending=counts["gold"]["pending"],
            approved=counts["gold"]["approved"],
            rejected=counts["gold"]["rejected"],
        ),
        silver=MetalWithdrawalBreakdown(
            pending=counts["silver"]["pending"],
            approved=counts["silver"]["approved"],
            rejected=counts["silver"]["rejected"],
        ),
    )


def get_dashboard_recent_transactions(db: Database, limit: int = 10) -> DashboardRecentTransactionsResponse:
    """Retrieve latest unified purchases and withdrawals for the dashboard activity list."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    safe_limit = max(1, min(limit, 50))
    purchases = list(db.purchases.find().sort("created_at", -1).limit(safe_limit))
    withdrawals = list(db.withdrawals.find().sort("created_at", -1).limit(safe_limit))

    combined = []
    for p in purchases:
        combined.append({
            "transaction_id": p.get("transaction_id", ""),
            "user_id": p.get("user_id"),
            "type": "purchase",
            "metal": p.get("metal", ""),
            "direction": "credit",
            "quantity_grams": float(p.get("quantity_grams", 0.0)),
            "total_amount": float(p.get("total_amount", 0.0)),
            "status": p.get("status", "completed"),
            "created_at": p.get("created_at") or datetime.now(timezone.utc),
        })

    for w in withdrawals:
        combined.append({
            "transaction_id": w.get("transaction_id", ""),
            "user_id": w.get("user_id"),
            "type": "withdrawal",
            "metal": w.get("metal", ""),
            "direction": "debit",
            "quantity_grams": float(w.get("quantity_grams", 0.0)),
            "total_amount": float(w.get("metal_value", 0.0)),
            "status": w.get("status", "pending"),
            "created_at": w.get("created_at") or datetime.now(timezone.utc),
        })

    combined.sort(key=lambda r: r["created_at"], reverse=True)
    top_items = combined[:safe_limit]

    items = []
    for item in top_items:
        u_doc = db.users.find_one({"_id": item["user_id"]}) if item.get("user_id") else None
        cust_name = u_doc.get("name", "Unknown Customer") if u_doc else "Unknown Customer"
        items.append(
            DashboardRecentTransactionItem(
                transaction_id=item["transaction_id"],
                customer_name=cust_name,
                type=item["type"],
                metal=item["metal"],
                direction=item["direction"],
                quantity_grams=item["quantity_grams"],
                total_amount=item["total_amount"],
                status=item["status"],
                created_at=item["created_at"],
            )
        )

    return DashboardRecentTransactionsResponse(items=items)


def get_dashboard_recent_members(db: Database, limit: int = 10) -> DashboardRecentMembersResponse:
    """Retrieve recently registered customer accounts."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    safe_limit = max(1, min(limit, 50))
    cursor = db.users.find({"role": "customer"}).sort("created_at", -1).limit(safe_limit)

    items = []
    for u in cursor:
        items.append(
            DashboardRecentMemberItem(
                user_id=str(u["_id"]),
                name=u.get("name", "Customer"),
                email=u.get("email"),
                mobile=u.get("mobile", ""),
                status=u.get("account_status", "active"),
                created_at=u.get("created_at") or datetime.now(timezone.utc),
            )
        )

    return DashboardRecentMembersResponse(items=items)


def get_customer_growth(db: Database, period: str = "30d") -> CustomerGrowthResponse:
    """Retrieve customer growth timeline with daily registrations and cumulative count."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    start_dt, end_dt, date_keys = _get_period_dates(period)

    # Base customers registered before start date
    base_count = db.users.count_documents({
        "role": "customer",
        "created_at": {"$lt": start_dt},
    })

    # Daily registrations during the period
    agg = list(db.users.aggregate([
        {
            "$match": {
                "role": "customer",
                "created_at": {"$gte": start_dt, "$lte": end_dt},
            }
        },
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                "new_users": {"$sum": 1},
            }
        },
    ]))

    daily_map = {item["_id"]: item.get("new_users", 0) for item in agg}

    points: List[CustomerGrowthDataPoint] = []
    running_total = base_count

    for dk in date_keys:
        new_cnt = daily_map.get(dk, 0)
        running_total += new_cnt
        points.append(
            CustomerGrowthDataPoint(
                date=dk,
                new_customers=new_cnt,
                total_customers=running_total,
            )
        )

    return CustomerGrowthResponse(period=period, data=points)


def get_transaction_stats(db: Database) -> TransactionStatsResponse:
    """Retrieve comprehensive transaction status metrics across purchases and withdrawals."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    # Purchases
    p_total = db.purchases.count_documents({})
    p_comp = db.purchases.count_documents({"status": "completed"})
    p_pend = db.purchases.count_documents({"status": "pending"})
    p_fail = db.purchases.count_documents({"status": "failed"})
    p_canc = db.purchases.count_documents({"status": "cancelled"})

    # Withdrawals
    w_total = db.withdrawals.count_documents({})
    w_pend = db.withdrawals.count_documents({"status": "pending"})
    w_appr = db.withdrawals.count_documents({"status": "approved"})
    w_reje = db.withdrawals.count_documents({"status": "rejected"})
    w_canc = db.withdrawals.count_documents({"status": "cancelled"})

    # Metal breakdown
    g_purch = db.purchases.count_documents({"metal": "gold", "status": "completed"})
    g_withd = db.withdrawals.count_documents({"metal": "gold", "status": "approved"})
    s_purch = db.purchases.count_documents({"metal": "silver", "status": "completed"})
    s_withd = db.withdrawals.count_documents({"metal": "silver", "status": "approved"})

    return TransactionStatsResponse(
        purchases=PurchaseStatusStats(
            total=p_total,
            completed=p_comp,
            pending=p_pend,
            failed=p_fail,
            cancelled=p_canc,
        ),
        withdrawals=WithdrawalStatusStats(
            total=w_total,
            pending=w_pend,
            approved=w_appr,
            rejected=w_reje,
            cancelled=w_canc,
        ),
        gold=MetalTransactionStats(
            purchases=g_purch,
            withdrawals=g_withd,
        ),
        silver=MetalTransactionStats(
            purchases=s_purch,
            withdrawals=s_withd,
        ),
    )


def get_dashboard_current_rates(db: Database) -> DashboardCurrentRatesResponse:
    """Retrieve operational buy/sell rates for Gold and Silver for the Admin Dashboard."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    rates_public = get_rates_public(db)
    g = rates_public.gold
    s = rates_public.silver

    return DashboardCurrentRatesResponse(
        gold=MetalRateSummaryItem(
            buy_rate=g.active_rate,
            sell_rate=g.active_rate,
            updated_at=g.updated_at or datetime.now(timezone.utc),
        ),
        silver=MetalRateSummaryItem(
            buy_rate=s.active_rate,
            sell_rate=s.active_rate,
            updated_at=s.updated_at or datetime.now(timezone.utc),
        ),
    )


def get_dashboard_notification_summary(db: Database, admin_user: Dict[str, Any]) -> DashboardNotificationSummaryResponse:
    """Retrieve unread notification count for the Admin Dashboard."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    count = get_unread_notification_count(
        db=db,
        user_id=admin_user.get("id", admin_user.get("_id")),
        recipient_type="admin",
    )
    return DashboardNotificationSummaryResponse(unread=count)
