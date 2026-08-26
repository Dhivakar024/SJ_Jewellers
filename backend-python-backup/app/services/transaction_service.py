import math
import re
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from bson import ObjectId
from pymongo.database import Database
from fastapi import HTTPException, status

from app.schemas.transactions import (
    UnifiedTransactionItem,
    CustomerTransactionListResponse,
    AdminTransactionCustomerInfo,
    AdminUnifiedTransactionItem,
    AdminTransactionListResponse,
    AdminTransactionDetailResponse,
)


def _to_object_id(id_val: Any) -> Optional[ObjectId]:
    """Helper to safely convert string to ObjectId."""
    if isinstance(id_val, ObjectId):
        return id_val
    try:
        return ObjectId(str(id_val))
    except Exception:
        return None


def _parse_date_filters(from_date_str: Optional[str], to_date_str: Optional[str]) -> Tuple[Optional[datetime], Optional[datetime]]:
    """Parse YYYY-MM-DD date filter strings into timezone-aware datetimes."""
    from_dt = None
    to_dt = None

    if from_date_str and from_date_str.strip():
        try:
            from_dt = datetime.strptime(from_date_str.strip(), "%Y-%m-%d").replace(
                hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="from_date must follow YYYY-MM-DD format",
            )

    if to_date_str and to_date_str.strip():
        try:
            to_dt = datetime.strptime(to_date_str.strip(), "%Y-%m-%d").replace(
                hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="to_date must follow YYYY-MM-DD format",
            )

    return from_dt, to_dt


def _normalize_purchase(p_doc: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize MongoDB purchase document into unified transaction format."""
    return {
        "transaction_id": p_doc.get("transaction_id", ""),
        "type": "purchase",
        "metal": str(p_doc.get("metal", "")).lower(),
        "direction": "credit",
        "quantity_grams": float(p_doc.get("quantity_grams", 0.0)),
        "rate_per_gram": float(p_doc.get("rate_per_gram", 0.0)),
        "metal_value": float(p_doc.get("metal_value", 0.0)),
        "gst_amount": float(p_doc.get("gst_amount", 0.0)),
        "total_amount": float(p_doc.get("total_amount", 0.0)),
        "status": p_doc.get("status", "completed"),
        "created_at": p_doc.get("created_at"),
        "user_id": p_doc.get("user_id"),
        "payment_status": p_doc.get("payment_status", "paid"),
        "withdrawal_mode": None,
        "approved_at": None,
        "rejected_at": None,
        "rejection_reason": None,
        "admin_note": None,
    }


def _normalize_withdrawal(w_doc: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize MongoDB withdrawal document into unified transaction format."""
    return {
        "transaction_id": w_doc.get("transaction_id", ""),
        "type": "withdrawal",
        "metal": str(w_doc.get("metal", "")).lower(),
        "direction": "debit",
        "quantity_grams": float(w_doc.get("quantity_grams", 0.0)),
        "rate_per_gram": float(w_doc.get("rate_per_gram", 0.0)),
        "metal_value": float(w_doc.get("metal_value", 0.0)),
        "gst_amount": 0.0,
        "total_amount": float(w_doc.get("metal_value", 0.0)),
        "status": w_doc.get("status", "pending"),
        "created_at": w_doc.get("created_at"),
        "user_id": w_doc.get("user_id"),
        "payment_status": None,
        "withdrawal_mode": w_doc.get("withdrawal_mode", "physical"),
        "approved_at": w_doc.get("approved_at"),
        "rejected_at": w_doc.get("rejected_at"),
        "rejection_reason": w_doc.get("rejection_reason"),
        "admin_note": w_doc.get("admin_note"),
    }


def get_customer_transactions(
    db: Database,
    current_user: Dict[str, Any],
    txn_type: Optional[str] = None,
    metal: Optional[str] = None,
    status_filter: Optional[str] = None,
    direction: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> CustomerTransactionListResponse:
    """Retrieve unified transaction history (purchases and withdrawals) for authenticated customer."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    # Validate filters
    if metal and metal.lower().strip() not in ["gold", "silver"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Metal must be either 'gold' or 'silver'")

    if txn_type and txn_type.lower().strip() not in ["purchase", "withdrawal"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Transaction type must be 'purchase' or 'withdrawal'")

    if direction and direction.lower().strip() not in ["credit", "debit"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Direction must be 'credit' or 'debit'")

    from_dt, to_dt = _parse_date_filters(from_date, to_date)
    user_obj_id = _to_object_id(current_user["id"])

    user_clause = {"$or": [{"user_id": user_obj_id}, {"user_id": current_user["id"]}]} if user_obj_id else {"user_id": current_user["id"]}

    # Common date filter
    date_query = {}
    if from_dt and to_dt:
        date_query["created_at"] = {"$gte": from_dt, "$lte": to_dt}
    elif from_dt:
        date_query["created_at"] = {"$gte": from_dt}
    elif to_dt:
        date_query["created_at"] = {"$lte": to_dt}

    # Common search filter (transaction ID)
    search_query = {}
    if search and search.strip():
        search_query["transaction_id"] = {"$regex": re.escape(search.strip()), "$options": "i"}

    unified_records: List[Dict[str, Any]] = []

    # 1. Query purchases if applicable
    include_purchases = True
    if txn_type and txn_type.lower().strip() == "withdrawal":
        include_purchases = False
    if direction and direction.lower().strip() == "debit":
        include_purchases = False

    if include_purchases:
        p_query: Dict[str, Any] = {**user_clause, **date_query, **search_query}
        if metal:
            p_query["metal"] = metal.lower().strip()
        if status_filter:
            p_query["status"] = status_filter.lower().strip()

        p_cursor = db.purchases.find(p_query)
        for p in p_cursor:
            unified_records.append(_normalize_purchase(p))

    # 2. Query withdrawals if applicable
    include_withdrawals = True
    if txn_type and txn_type.lower().strip() == "purchase":
        include_withdrawals = False
    if direction and direction.lower().strip() == "credit":
        include_withdrawals = False

    if include_withdrawals:
        w_query: Dict[str, Any] = {**user_clause, **date_query, **search_query}
        if metal:
            w_query["metal"] = metal.lower().strip()
        if status_filter:
            w_query["status"] = status_filter.lower().strip()

        w_cursor = db.withdrawals.find(w_query)
        for w in w_cursor:
            unified_records.append(_normalize_withdrawal(w))

    # 3. Sort unified records newest first (created_at DESC)
    unified_records.sort(
        key=lambda r: (
            r.get("created_at") or datetime.min.replace(tzinfo=timezone.utc),
            r.get("transaction_id", ""),
        ),
        reverse=True,
    )

    # 4. Paginate
    safe_limit = max(1, min(limit, 100))
    safe_page = max(1, page)
    total = len(unified_records)
    total_pages = max(1, math.ceil(total / safe_limit))

    start_idx = (safe_page - 1) * safe_limit
    end_idx = start_idx + safe_limit
    paginated_items = unified_records[start_idx:end_idx]

    items = [
        UnifiedTransactionItem(
            transaction_id=r["transaction_id"],
            type=r["type"],
            metal=r["metal"],
            direction=r["direction"],
            quantity_grams=r["quantity_grams"],
            rate_per_gram=r["rate_per_gram"],
            metal_value=r["metal_value"],
            gst_amount=r["gst_amount"],
            total_amount=r["total_amount"],
            status=r["status"],
            created_at=r["created_at"],
        )
        for r in paginated_items
    ]

    return CustomerTransactionListResponse(
        items=items,
        page=safe_page,
        limit=safe_limit,
        total=total,
        total_pages=total_pages,
    )


def get_customer_transaction_by_id(
    db: Database,
    current_user: Dict[str, Any],
    transaction_id: str,
) -> UnifiedTransactionItem:
    """Retrieve single transaction detail by transaction ID for authenticated customer."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    user_obj_id = _to_object_id(current_user["id"])
    user_clause = {"$or": [{"user_id": user_obj_id}, {"user_id": current_user["id"]}]} if user_obj_id else {"user_id": current_user["id"]}

    # Check purchases
    p_doc = db.purchases.find_one({"transaction_id": transaction_id, **user_clause})
    if p_doc:
        norm = _normalize_purchase(p_doc)
        return UnifiedTransactionItem(**norm)

    # Check withdrawals
    w_doc = db.withdrawals.find_one({"transaction_id": transaction_id, **user_clause})
    if w_doc:
        norm = _normalize_withdrawal(w_doc)
        return UnifiedTransactionItem(**norm)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")


def get_admin_transactions(
    db: Database,
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    txn_type: Optional[str] = None,
    metal: Optional[str] = None,
    status_filter: Optional[str] = None,
    direction: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
) -> AdminTransactionListResponse:
    """Retrieve unified transaction history across all customers for Admin."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    if metal and metal.lower().strip() not in ["gold", "silver"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Metal must be either 'gold' or 'silver'")

    if txn_type and txn_type.lower().strip() not in ["purchase", "withdrawal"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Transaction type must be 'purchase' or 'withdrawal'")

    if direction and direction.lower().strip() not in ["credit", "debit"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Direction must be 'credit' or 'debit'")

    from_dt, to_dt = _parse_date_filters(from_date, to_date)

    date_query = {}
    if from_dt and to_dt:
        date_query["created_at"] = {"$gte": from_dt, "$lte": to_dt}
    elif from_dt:
        date_query["created_at"] = {"$gte": from_dt}
    elif to_dt:
        date_query["created_at"] = {"$lte": to_dt}

    search_query = {}
    matching_user_ids = []
    if search and search.strip():
        search_pattern = re.escape(search.strip())
        search_regex = {"$regex": search_pattern, "$options": "i"}

        users = list(db.users.find({
            "$or": [
                {"name": search_regex},
                {"mobile": search_regex},
                {"email": search_regex},
            ]
        }, {"_id": 1}))
        matching_user_ids = [u["_id"] for u in users]

        search_query["$or"] = [
            {"transaction_id": search_regex},
            {"user_id": {"$in": matching_user_ids}},
        ]

    unified_records: List[Dict[str, Any]] = []

    # Purchases
    include_purchases = True
    if txn_type and txn_type.lower().strip() == "withdrawal":
        include_purchases = False
    if direction and direction.lower().strip() == "debit":
        include_purchases = False

    if include_purchases:
        p_query: Dict[str, Any] = {**date_query, **search_query}
        if metal:
            p_query["metal"] = metal.lower().strip()
        if status_filter:
            p_query["status"] = status_filter.lower().strip()

        for p in db.purchases.find(p_query):
            unified_records.append(_normalize_purchase(p))

    # Withdrawals
    include_withdrawals = True
    if txn_type and txn_type.lower().strip() == "purchase":
        include_withdrawals = False
    if direction and direction.lower().strip() == "credit":
        include_withdrawals = False

    if include_withdrawals:
        w_query: Dict[str, Any] = {**date_query, **search_query}
        if metal:
            w_query["metal"] = metal.lower().strip()
        if status_filter:
            w_query["status"] = status_filter.lower().strip()

        for w in db.withdrawals.find(w_query):
            unified_records.append(_normalize_withdrawal(w))

    # Sort newest first
    unified_records.sort(
        key=lambda r: (
            r.get("created_at") or datetime.min.replace(tzinfo=timezone.utc),
            r.get("transaction_id", ""),
        ),
        reverse=True,
    )

    safe_limit = max(1, min(limit, 100))
    safe_page = max(1, page)
    total = len(unified_records)
    total_pages = max(1, math.ceil(total / safe_limit))

    start_idx = (safe_page - 1) * safe_limit
    end_idx = start_idx + safe_limit
    paginated_items = unified_records[start_idx:end_idx]

    items: List[AdminUnifiedTransactionItem] = []
    for r in paginated_items:
        u_doc = db.users.find_one({"_id": r["user_id"]}) if r.get("user_id") else None
        cust_info = AdminTransactionCustomerInfo(
            user_id=str(r.get("user_id", "")),
            name=u_doc.get("name", "Unknown") if u_doc else "Unknown",
            email=u_doc.get("email") if u_doc else None,
            mobile=u_doc.get("mobile", "") if u_doc else "",
        )

        items.append(
            AdminUnifiedTransactionItem(
                transaction_id=r["transaction_id"],
                customer=cust_info,
                type=r["type"],
                metal=r["metal"],
                direction=r["direction"],
                quantity_grams=r["quantity_grams"],
                rate_per_gram=r["rate_per_gram"],
                metal_value=r["metal_value"],
                gst_amount=r["gst_amount"],
                total_amount=r["total_amount"],
                status=r["status"],
                created_at=r["created_at"],
            )
        )

    return AdminTransactionListResponse(
        items=items,
        page=safe_page,
        limit=safe_limit,
        total=total,
        total_pages=total_pages,
    )


def get_admin_transaction_by_id(
    db: Database,
    transaction_id: str,
) -> AdminTransactionDetailResponse:
    """Retrieve full transaction details and attached customer profile for Admin."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    norm = None

    p_doc = db.purchases.find_one({"transaction_id": transaction_id})
    if p_doc:
        norm = _normalize_purchase(p_doc)

    if not norm:
        w_doc = db.withdrawals.find_one({"transaction_id": transaction_id})
        if w_doc:
            norm = _normalize_withdrawal(w_doc)

    if not norm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    u_doc = db.users.find_one({"_id": norm["user_id"]}) if norm.get("user_id") else None
    cust_info = AdminTransactionCustomerInfo(
        user_id=str(norm.get("user_id", "")),
        name=u_doc.get("name", "Unknown") if u_doc else "Unknown",
        email=u_doc.get("email") if u_doc else None,
        mobile=u_doc.get("mobile", "") if u_doc else "",
    )

    return AdminTransactionDetailResponse(
        transaction_id=norm["transaction_id"],
        customer=cust_info,
        type=norm["type"],
        metal=norm["metal"],
        direction=norm["direction"],
        quantity_grams=norm["quantity_grams"],
        rate_per_gram=norm["rate_per_gram"],
        metal_value=norm["metal_value"],
        gst_amount=norm["gst_amount"],
        total_amount=norm["total_amount"],
        status=norm["status"],
        created_at=norm["created_at"],
        approved_at=norm["approved_at"],
        rejected_at=norm["rejected_at"],
        rejection_reason=norm["rejection_reason"],
        admin_note=norm["admin_note"],
        withdrawal_mode=norm["withdrawal_mode"],
        payment_status=norm["payment_status"],
    )
