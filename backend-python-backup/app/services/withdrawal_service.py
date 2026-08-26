import math
import re
import secrets
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, Optional, List
from bson import ObjectId
from pymongo.database import Database
from fastapi import HTTPException, status

from app.config import settings
from app.schemas.withdrawals import (
    CreateWithdrawalRequest,
    WithdrawalResponse,
    CustomerWithdrawalListResponse,
    AdminWithdrawalCustomerInfo,
    AdminWithdrawalListItem,
    AdminWithdrawalListResponse,
    AdminWithdrawalDetailResponse,
    WithdrawalActionResponse,
)
from app.services.metal_rates_service import (
    ensure_rates_initialized,
    _check_and_expire_rates,
    DEFAULT_GOLD_RATE,
    DEFAULT_SILVER_RATE,
)
from app.services.holdings_service import (
    get_or_create_holding_doc,
    ensure_holdings_indexes,
)

_withdrawal_indexes_initialized = False


def _to_object_id(id_val: Any) -> Optional[ObjectId]:
    """Helper to safely convert string to ObjectId."""
    if isinstance(id_val, ObjectId):
        return id_val
    try:
        return ObjectId(str(id_val))
    except Exception:
        return None


def _quantize_2(val: Decimal) -> float:
    """Format and round monetary decimal values cleanly to 2 decimal places."""
    return float(val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def _generate_withdrawal_txn_id() -> str:
    """Generate unique withdrawal transaction identifier."""
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    random_hex = secrets.token_hex(4).upper()
    return f"WD-{date_str}-{random_hex}"


def ensure_withdrawal_indexes(db: Database):
    """Ensure indexes on withdrawals collection."""
    global _withdrawal_indexes_initialized
    if _withdrawal_indexes_initialized or db is None:
        return
    try:
        db.withdrawals.create_index("user_id", name="idx_withdrawals_user_id")
        db.withdrawals.create_index("transaction_id", unique=True, name="uniq_withdrawals_transaction_id")
        db.withdrawals.create_index("status", name="idx_withdrawals_status")
        db.withdrawals.create_index("metal", name="idx_withdrawals_metal")
        db.withdrawals.create_index([("metal", 1), ("created_at", -1)], name="idx_withdrawals_metal_date")
        db.withdrawals.create_index("withdrawal_mode", name="idx_withdrawals_mode")
        _withdrawal_indexes_initialized = True
    except Exception:
        pass


def _format_withdrawal_response(doc: Dict[str, Any]) -> WithdrawalResponse:
    """Format MongoDB withdrawal document into safe WithdrawalResponse schema."""
    return WithdrawalResponse(
        withdrawal_id=str(doc.get("_id", doc.get("id"))),
        transaction_id=doc.get("transaction_id", ""),
        metal=doc.get("metal", ""),
        quantity_grams=float(doc.get("quantity_grams", 0.0)),
        rate_per_gram=float(doc.get("rate_per_gram", 0.0)),
        metal_value=float(doc.get("metal_value", 0.0)),
        withdrawal_mode=doc.get("withdrawal_mode", "physical"),
        status=doc.get("status", "pending"),
        rejection_reason=doc.get("rejection_reason"),
        admin_note=doc.get("admin_note"),
        created_at=doc.get("created_at"),
        approved_at=doc.get("approved_at"),
        rejected_at=doc.get("rejected_at"),
    )


def create_withdrawal_request(
    db: Database,
    current_user: Dict[str, Any],
    data: CreateWithdrawalRequest,
) -> WithdrawalResponse:
    """Validate customer KYC and available balance, reserve holding weight, and create pending withdrawal."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    ensure_withdrawal_indexes(db)
    ensure_holdings_indexes(db)
    ensure_rates_initialized(db)
    _check_and_expire_rates(db)

    # 1. Fetch user document and verify KYC
    user_obj_id = _to_object_id(current_user["id"])
    user_doc = db.users.find_one({"_id": user_obj_id}) if user_obj_id else db.users.find_one({"_id": current_user["id"]})

    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user_doc.get("kyc_status") != "verified":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="KYC verification is required before withdrawal",
        )

    if user_doc.get("account_status") != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is {user_doc.get('account_status')}. Please contact support.",
        )

    metal = data.metal.lower().strip()
    if metal not in ["gold", "silver"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Metal must be either 'gold' or 'silver'")

    # 2. Check minimum withdrawal quantity
    if metal == "gold" and data.quantity_grams < settings.MIN_GOLD_WITHDRAWAL_GRAMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum gold withdrawal quantity is {settings.MIN_GOLD_WITHDRAWAL_GRAMS} grams",
        )
    if metal == "silver" and data.quantity_grams < settings.MIN_SILVER_WITHDRAWAL_GRAMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum silver withdrawal quantity is {settings.MIN_SILVER_WITHDRAWAL_GRAMS} grams",
        )

    # 3. Check customer available balance (quantity_grams - reserved_grams)
    holdings_doc = get_or_create_holding_doc(db, user_doc["_id"])
    metal_data = holdings_doc.get(metal, {})
    total_qty = Decimal(str(metal_data.get("quantity_grams", 0.0)))
    reserved_qty = Decimal(str(metal_data.get("reserved_grams", 0.0)))
    available_qty = total_qty - reserved_qty
    requested_qty = Decimal(str(data.quantity_grams))

    if requested_qty > available_qty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient {metal} balance",
        )

    # 4. Rate Snapshot
    rate_doc = db.rates.find_one({"metal": metal})
    default_rate = DEFAULT_GOLD_RATE if metal == "gold" else DEFAULT_SILVER_RATE
    active_rate = float(rate_doc.get("active_rate", default_rate)) if rate_doc else default_rate

    metal_val_dec = requested_qty * Decimal(str(active_rate))
    metal_value = _quantize_2(metal_val_dec)
    rate_per_gram = _quantize_2(Decimal(str(active_rate)))

    now_utc = datetime.now(timezone.utc)
    txn_id = _generate_withdrawal_txn_id()

    # 5. Reserve requested quantity in customer holdings
    db.holdings.update_one(
        {"_id": holdings_doc["_id"]},
        {
            "$inc": {f"{metal}.reserved_grams": float(requested_qty)},
            "$set": {"updated_at": now_utc},
        }
    )

    # 6. Save pending withdrawal document
    withdrawal_doc = {
        "user_id": user_doc["_id"],
        "metal": metal,
        "quantity_grams": float(requested_qty),
        "rate_per_gram": rate_per_gram,
        "metal_value": metal_value,
        "status": "pending",
        "withdrawal_mode": data.withdrawal_mode,
        "transaction_id": txn_id,
        "rejection_reason": None,
        "admin_note": None,
        "created_at": now_utc,
        "updated_at": now_utc,
        "approved_at": None,
        "rejected_at": None,
    }

    res = db.withdrawals.insert_one(withdrawal_doc)
    withdrawal_doc["_id"] = res.inserted_id

    # Trigger customer and admin notifications
    try:
        from app.services.notification_service import notify_withdrawal_submitted
        notify_withdrawal_submitted(db, withdrawal_doc)
    except Exception:
        pass

    return _format_withdrawal_response(withdrawal_doc)


def approve_withdrawal(
    db: Database,
    withdrawal_id: str,
    admin_user: Dict[str, Any],
) -> WithdrawalActionResponse:
    """Admin action: Approve pending withdrawal, deduct holding balance, and release reserved quantity."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    w_obj_id = _to_object_id(withdrawal_id)
    w_doc = None
    if w_obj_id:
        w_doc = db.withdrawals.find_one({"_id": w_obj_id})
    if not w_doc:
        w_doc = db.withdrawals.find_one({"transaction_id": withdrawal_id})
    if not w_doc:
        w_doc = db.withdrawals.find_one({"_id": withdrawal_id})

    if not w_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Withdrawal request not found")

    if w_doc.get("status") != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve withdrawal with status '{w_doc.get('status')}'",
        )

    # Verify user KYC is still verified
    user_doc = db.users.find_one({"_id": w_doc["user_id"]})
    if not user_doc or user_doc.get("kyc_status") != "verified":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer KYC must be verified before approval",
        )

    metal = w_doc["metal"]
    w_qty = Decimal(str(w_doc["quantity_grams"]))
    holdings_doc = get_or_create_holding_doc(db, w_doc["user_id"])
    metal_data = holdings_doc.get(metal, {})

    cur_qty = Decimal(str(metal_data.get("quantity_grams", 0.0)))
    cur_res = Decimal(str(metal_data.get("reserved_grams", 0.0)))
    cur_avg = Decimal(str(metal_data.get("average_buy_rate", 0.0)))

    if w_qty > cur_qty or w_qty > cur_res:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Holding balance inconsistency detected",
        )

    new_qty = max(Decimal("0.0"), cur_qty - w_qty)
    new_res = max(Decimal("0.0"), cur_res - w_qty)
    new_inv = max(Decimal("0.0"), new_qty * cur_avg)
    now_utc = datetime.now(timezone.utc)

    # Atomically update holdings: deduct actual weight and release reserved weight
    db.holdings.update_one(
        {"_id": holdings_doc["_id"]},
        {
            "$set": {
                f"{metal}.quantity_grams": float(new_qty),
                f"{metal}.reserved_grams": float(new_res),
                f"{metal}.total_invested": _quantize_2(new_inv),
                "updated_at": now_utc,
            }
        }
    )

    # Update withdrawal status to approved
    db.withdrawals.update_one(
        {"_id": w_doc["_id"]},
        {
            "$set": {
                "status": "approved",
                "approved_at": now_utc,
                "updated_at": now_utc,
            }
        }
    )

    # Trigger customer notification for approved withdrawal
    try:
        from app.services.notification_service import notify_withdrawal_approved
        w_doc["status"] = "approved"
        notify_withdrawal_approved(db, w_doc)
    except Exception:
        pass

    return WithdrawalActionResponse(
        message="Withdrawal request approved successfully",
        withdrawal_id=str(w_doc["_id"]),
        status="approved",
    )


def reject_withdrawal(
    db: Database,
    withdrawal_id: str,
    admin_user: Dict[str, Any],
    reason: str,
) -> WithdrawalActionResponse:
    """Admin action: Reject pending withdrawal, release reserved quantity, preserving customer holding balance."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    w_obj_id = _to_object_id(withdrawal_id)
    w_doc = None
    if w_obj_id:
        w_doc = db.withdrawals.find_one({"_id": w_obj_id})
    if not w_doc:
        w_doc = db.withdrawals.find_one({"transaction_id": withdrawal_id})
    if not w_doc:
        w_doc = db.withdrawals.find_one({"_id": withdrawal_id})

    if not w_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Withdrawal request not found")

    if w_doc.get("status") != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject withdrawal with status '{w_doc.get('status')}'",
        )

    metal = w_doc["metal"]
    w_qty = Decimal(str(w_doc["quantity_grams"]))
    holdings_doc = get_or_create_holding_doc(db, w_doc["user_id"])
    cur_res = Decimal(str(holdings_doc.get(metal, {}).get("reserved_grams", 0.0)))
    new_res = max(Decimal("0.0"), cur_res - w_qty)
    now_utc = datetime.now(timezone.utc)

    # Release reserved balance on holdings
    db.holdings.update_one(
        {"_id": holdings_doc["_id"]},
        {
            "$set": {
                f"{metal}.reserved_grams": float(new_res),
                "updated_at": now_utc,
            }
        }
    )

    # Update withdrawal document
    db.withdrawals.update_one(
        {"_id": w_doc["_id"]},
        {
            "$set": {
                "status": "rejected",
                "rejection_reason": reason,
                "rejected_at": now_utc,
                "updated_at": now_utc,
            }
        }
    )

    # Trigger customer notification for rejected withdrawal
    try:
        from app.services.notification_service import notify_withdrawal_rejected
        w_doc["status"] = "rejected"
        notify_withdrawal_rejected(db, w_doc, reason)
    except Exception:
        pass

    return WithdrawalActionResponse(
        message="Withdrawal request rejected",
        withdrawal_id=str(w_doc["_id"]),
        status="rejected",
    )


def cancel_customer_withdrawal(
    db: Database,
    current_user: Dict[str, Any],
    withdrawal_id: str,
) -> WithdrawalActionResponse:
    """Customer action: Cancel own pending withdrawal request, releasing reserved quantity."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    w_obj_id = _to_object_id(withdrawal_id)
    w_doc = None
    if w_obj_id:
        w_doc = db.withdrawals.find_one({"_id": w_obj_id})
    if not w_doc:
        w_doc = db.withdrawals.find_one({"transaction_id": withdrawal_id})
    if not w_doc:
        w_doc = db.withdrawals.find_one({"_id": withdrawal_id})

    if not w_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Withdrawal request not found")

    # Verify ownership
    doc_user_id = str(w_doc.get("user_id"))
    req_user_id = str(current_user.get("id", current_user.get("_id")))
    if doc_user_id != req_user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Withdrawal request not found")

    if w_doc.get("status") != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending withdrawal requests can be cancelled",
        )

    metal = w_doc["metal"]
    w_qty = Decimal(str(w_doc["quantity_grams"]))
    holdings_doc = get_or_create_holding_doc(db, w_doc["user_id"])
    cur_res = Decimal(str(holdings_doc.get(metal, {}).get("reserved_grams", 0.0)))
    new_res = max(Decimal("0.0"), cur_res - w_qty)
    now_utc = datetime.now(timezone.utc)

    # Release reserved balance on holdings
    db.holdings.update_one(
        {"_id": holdings_doc["_id"]},
        {
            "$set": {
                f"{metal}.reserved_grams": float(new_res),
                "updated_at": now_utc,
            }
        }
    )

    # Update withdrawal document
    db.withdrawals.update_one(
        {"_id": w_doc["_id"]},
        {
            "$set": {
                "status": "cancelled",
                "updated_at": now_utc,
            }
        }
    )

    # Trigger customer notification for cancelled withdrawal
    try:
        from app.services.notification_service import notify_withdrawal_cancelled
        w_doc["status"] = "cancelled"
        notify_withdrawal_cancelled(db, w_doc)
    except Exception:
        pass

    return WithdrawalActionResponse(
        message="Withdrawal request cancelled successfully",
        withdrawal_id=str(w_doc["_id"]),
        status="cancelled",
    )


def get_customer_withdrawals(
    db: Database,
    current_user: Dict[str, Any],
    metal: Optional[str] = None,
    status_filter: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> CustomerWithdrawalListResponse:
    """Retrieve paginated list of withdrawals belonging to authenticated customer."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    user_obj_id = _to_object_id(current_user["id"])
    query: Dict[str, Any] = {
        "$or": [
            {"user_id": user_obj_id} if user_obj_id else {"user_id": current_user["id"]},
            {"user_id": current_user["id"]},
        ]
    }

    if metal and metal.lower().strip() in ["gold", "silver"]:
        query["metal"] = metal.lower().strip()

    if status_filter:
        query["status"] = status_filter.lower().strip()

    safe_limit = max(1, min(limit, 100))
    safe_page = max(1, page)
    skip = (safe_page - 1) * safe_limit

    total = db.withdrawals.count_documents(query)
    total_pages = max(1, math.ceil(total / safe_limit))

    cursor = db.withdrawals.find(query).sort("created_at", -1).skip(skip).limit(safe_limit)
    items = [_format_withdrawal_response(doc) for doc in cursor]

    return CustomerWithdrawalListResponse(
        items=items,
        page=safe_page,
        limit=safe_limit,
        total=total,
        total_pages=total_pages,
    )


def get_customer_withdrawal_by_id(
    db: Database,
    current_user: Dict[str, Any],
    withdrawal_id: str,
) -> WithdrawalResponse:
    """Retrieve single withdrawal details for authenticated customer."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    w_obj_id = _to_object_id(withdrawal_id)
    doc = None
    if w_obj_id:
        doc = db.withdrawals.find_one({"_id": w_obj_id})
    if not doc:
        doc = db.withdrawals.find_one({"transaction_id": withdrawal_id})
    if not doc:
        doc = db.withdrawals.find_one({"_id": withdrawal_id})

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Withdrawal request not found")

    doc_user_id = str(doc.get("user_id"))
    req_user_id = str(current_user.get("id", current_user.get("_id")))
    if doc_user_id != req_user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Withdrawal request not found")

    return _format_withdrawal_response(doc)


def get_admin_withdrawals(
    db: Database,
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    metal: Optional[str] = None,
    status_filter: Optional[str] = None,
    withdrawal_mode: Optional[str] = None,
) -> AdminWithdrawalListResponse:
    """Retrieve paginated withdrawal requests for Admin with customer search and filtering."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    query: Dict[str, Any] = {}

    if metal and metal.lower().strip() in ["gold", "silver"]:
        query["metal"] = metal.lower().strip()

    if status_filter:
        query["status"] = status_filter.lower().strip()

    if withdrawal_mode:
        query["withdrawal_mode"] = withdrawal_mode.lower().strip()

    if search and search.strip():
        search_term = search.strip()
        search_pattern = re.escape(search_term)
        search_regex = {"$regex": search_pattern, "$options": "i"}

        matching_users = list(db.users.find({
            "$or": [
                {"name": search_regex},
                {"mobile": search_regex},
                {"email": search_regex},
            ]
        }, {"_id": 1}))
        matching_user_ids = [u["_id"] for u in matching_users]

        query["$or"] = [
            {"transaction_id": search_regex},
            {"user_id": {"$in": matching_user_ids}},
        ]

    safe_limit = max(1, min(limit, 100))
    safe_page = max(1, page)
    skip = (safe_page - 1) * safe_limit

    total = db.withdrawals.count_documents(query)
    total_pages = max(1, math.ceil(total / safe_limit))

    cursor = db.withdrawals.find(query).sort("created_at", -1).skip(skip).limit(safe_limit)

    items: List[AdminWithdrawalListItem] = []
    for doc in cursor:
        user_id_val = doc.get("user_id")
        user_doc = db.users.find_one({"_id": user_id_val}) if user_id_val else None

        customer_info = AdminWithdrawalCustomerInfo(
            user_id=str(user_id_val),
            name=user_doc.get("name", "Unknown") if user_doc else "Unknown",
            mobile=user_doc.get("mobile", "") if user_doc else "",
            email=user_doc.get("email") if user_doc else None,
            kyc_status=user_doc.get("kyc_status", "pending") if user_doc else "pending",
        )

        items.append(
            AdminWithdrawalListItem(
                withdrawal_id=str(doc["_id"]),
                transaction_id=doc.get("transaction_id", ""),
                customer=customer_info,
                metal=doc.get("metal", ""),
                quantity_grams=float(doc.get("quantity_grams", 0.0)),
                rate_per_gram=float(doc.get("rate_per_gram", 0.0)),
                metal_value=float(doc.get("metal_value", 0.0)),
                withdrawal_mode=doc.get("withdrawal_mode", "physical"),
                status=doc.get("status", "pending"),
                created_at=doc.get("created_at"),
            )
        )

    return AdminWithdrawalListResponse(
        items=items,
        page=safe_page,
        limit=safe_limit,
        total=total,
        total_pages=total_pages,
    )


def get_admin_withdrawal_by_id(
    db: Database,
    withdrawal_id: str,
) -> AdminWithdrawalDetailResponse:
    """Retrieve full details of a specific withdrawal for Admin review."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    w_obj_id = _to_object_id(withdrawal_id)
    doc = None
    if w_obj_id:
        doc = db.withdrawals.find_one({"_id": w_obj_id})
    if not doc:
        doc = db.withdrawals.find_one({"transaction_id": withdrawal_id})
    if not doc:
        doc = db.withdrawals.find_one({"_id": withdrawal_id})

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Withdrawal request not found")

    user_id_val = doc.get("user_id")
    user_doc = db.users.find_one({"_id": user_id_val}) if user_id_val else None

    customer_info = AdminWithdrawalCustomerInfo(
        user_id=str(user_id_val),
        name=user_doc.get("name", "Unknown") if user_doc else "Unknown",
        mobile=user_doc.get("mobile", "") if user_doc else "",
        email=user_doc.get("email") if user_doc else None,
        kyc_status=user_doc.get("kyc_status", "pending") if user_doc else "pending",
    )

    return AdminWithdrawalDetailResponse(
        withdrawal_id=str(doc["_id"]),
        transaction_id=doc.get("transaction_id", ""),
        customer=customer_info,
        metal=doc.get("metal", ""),
        quantity_grams=float(doc.get("quantity_grams", 0.0)),
        rate_per_gram=float(doc.get("rate_per_gram", 0.0)),
        metal_value=float(doc.get("metal_value", 0.0)),
        withdrawal_mode=doc.get("withdrawal_mode", "physical"),
        status=doc.get("status", "pending"),
        rejection_reason=doc.get("rejection_reason"),
        admin_note=doc.get("admin_note"),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
        approved_at=doc.get("approved_at"),
        rejected_at=doc.get("rejected_at"),
    )
