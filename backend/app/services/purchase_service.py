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
from app.schemas.purchases import (
    CreatePurchaseRequest,
    PurchaseResponse,
    CustomerPurchaseListResponse,
    AdminPurchaseCustomerInfo,
    AdminPurchaseListItem,
    AdminPurchaseListResponse,
    AdminPurchaseDetailResponse,
)
from app.services.metal_rates_service import ensure_rates_initialized, _check_and_expire_rates
from app.services.holdings_service import process_purchase_for_holdings

_purchase_indexes_initialized = False


def _to_object_id(id_val: Any) -> Optional[ObjectId]:
    """Helper to safely convert string to ObjectId."""
    if isinstance(id_val, ObjectId):
        return id_val
    try:
        return ObjectId(str(id_val))
    except Exception:
        return None


def _to_decimal(val: Any) -> Decimal:
    """Safely convert any numeric value to Decimal."""
    return Decimal(str(val))


def _quantize_2(val: Decimal) -> float:
    """Format and round monetary decimal values cleanly to 2 decimal places."""
    return float(val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def _generate_transaction_id(metal: str) -> str:
    """Generate a unique, searchable, immutable transaction ID."""
    prefix = metal.upper()
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    random_hex = secrets.token_hex(4).upper()
    return f"{prefix}-{date_str}-{random_hex}"


def ensure_purchase_indexes(db: Database):
    """Ensure indexes for purchase collections."""
    global _purchase_indexes_initialized
    if _purchase_indexes_initialized or db is None:
        return
    try:
        db.purchases.create_index("user_id", name="idx_purchases_user_id")
        db.purchases.create_index("transaction_id", unique=True, name="uniq_purchases_transaction_id")
        db.purchases.create_index([("metal", 1), ("created_at", -1)], name="idx_purchases_metal_date")
        db.purchases.create_index("status", name="idx_purchases_status")
        db.purchases.create_index("payment_status", name="idx_purchases_payment_status")
        db.purchases.create_index("created_at", name="idx_purchases_created_at")
        _purchase_indexes_initialized = True
    except Exception:
        pass


def _format_purchase_response(doc: Dict[str, Any]) -> PurchaseResponse:
    """Format MongoDB purchase document into safe PurchaseResponse schema."""
    return PurchaseResponse(
        purchase_id=str(doc.get("_id", doc.get("id"))),
        transaction_id=doc.get("transaction_id", ""),
        metal=doc.get("metal", ""),
        quantity_grams=float(doc.get("quantity_grams", 0.0)),
        rate_per_gram=float(doc.get("rate_per_gram", 0.0)),
        metal_value=float(doc.get("metal_value", 0.0)),
        gst_rate_percent=float(doc.get("gst_rate_percent", 3.0)),
        gst_amount=float(doc.get("gst_amount", 0.0)),
        total_amount=float(doc.get("total_amount", 0.0)),
        currency=doc.get("currency", "INR"),
        status=doc.get("status", "completed"),
        payment_status=doc.get("payment_status", "paid"),
        created_at=doc.get("created_at"),
    )


def create_purchase(
    db: Database,
    current_user: Dict[str, Any],
    data: CreatePurchaseRequest,
) -> PurchaseResponse:
    """Create a new metal purchase calculating live rates and GST securely on the backend."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    ensure_purchase_indexes(db)
    ensure_rates_initialized(db)
    _check_and_expire_rates(db)

    metal = data.metal.lower()
    if metal not in ["gold", "silver"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Metal must be either 'gold' or 'silver'")

    # Validate minimum purchase weight
    if metal == "gold" and data.quantity_grams < settings.MIN_GOLD_PURCHASE_GRAMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum gold purchase quantity is {settings.MIN_GOLD_PURCHASE_GRAMS} grams",
        )
    if metal == "silver" and data.quantity_grams < settings.MIN_SILVER_PURCHASE_GRAMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum silver purchase quantity is {settings.MIN_SILVER_PURCHASE_GRAMS} grams",
        )

    # Fetch live operational rate for the requested metal
    rate_doc = db.rates.find_one({"metal": metal})
    if not rate_doc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Active rate for {metal} is currently unavailable",
        )

    active_rate = rate_doc.get("active_rate", rate_doc.get("api_rate"))
    if not active_rate or active_rate <= 0:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Active rate for {metal} is invalid",
        )

    # Precise financial calculations using Decimal
    qty_dec = _to_decimal(data.quantity_grams)
    rate_dec = _to_decimal(active_rate)
    gst_pct_dec = _to_decimal(settings.GST_RATE_PERCENT)

    metal_val_dec = qty_dec * rate_dec
    gst_amt_dec = metal_val_dec * (gst_pct_dec / Decimal("100"))
    total_amt_dec = metal_val_dec + gst_amt_dec

    metal_value = _quantize_2(metal_val_dec)
    gst_amount = _quantize_2(gst_amt_dec)
    total_amount = _quantize_2(total_amt_dec)
    rate_per_gram = _quantize_2(rate_dec)
    quantity_grams = float(qty_dec)

    user_obj_id = _to_object_id(current_user["id"])
    now_utc = datetime.now(timezone.utc)
    txn_id = _generate_transaction_id(metal)

    purchase_doc = {
        "user_id": user_obj_id if user_obj_id else current_user["id"],
        "metal": metal,
        "quantity_grams": quantity_grams,
        "rate_per_gram": rate_per_gram,
        "metal_value": metal_value,
        "gst_rate_percent": float(gst_pct_dec),
        "gst_amount": gst_amount,
        "total_amount": total_amount,
        "currency": "INR",
        "status": "completed",
        "payment_status": "paid",
        "transaction_id": txn_id,
        "created_at": now_utc,
        "updated_at": now_utc,
    }

    res = db.purchases.insert_one(purchase_doc)
    purchase_doc["_id"] = res.inserted_id

    # Automatically update customer holdings upon completed purchase
    try:
        process_purchase_for_holdings(db, purchase_doc)
    except Exception:
        pass

    return _format_purchase_response(purchase_doc)


def get_customer_purchases(
    db: Database,
    current_user: Dict[str, Any],
    metal: Optional[str] = None,
    status_filter: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> CustomerPurchaseListResponse:
    """Retrieve paginated purchases belonging strictly to the authenticated customer."""
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

    total = db.purchases.count_documents(query)
    total_pages = max(1, math.ceil(total / safe_limit))

    cursor = db.purchases.find(query).sort("created_at", -1).skip(skip).limit(safe_limit)
    items = [_format_purchase_response(doc) for doc in cursor]

    return CustomerPurchaseListResponse(
        items=items,
        page=safe_page,
        limit=safe_limit,
        total=total,
        total_pages=total_pages,
    )


def get_customer_purchase_by_id(
    db: Database,
    current_user: Dict[str, Any],
    purchase_id: str,
) -> PurchaseResponse:
    """Retrieve a single purchase detail for the authenticated customer."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    purch_obj_id = _to_object_id(purchase_id)
    doc = None
    if purch_obj_id:
        doc = db.purchases.find_one({"_id": purch_obj_id})
    if not doc:
        doc = db.purchases.find_one({"transaction_id": purchase_id})
    if not doc:
        doc = db.purchases.find_one({"_id": purchase_id})

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase not found")

    # Security check: Ensure purchase belongs to current authenticated customer
    doc_user_id = str(doc.get("user_id"))
    req_user_id = str(current_user.get("id", current_user.get("_id")))
    if doc_user_id != req_user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase not found")

    return _format_purchase_response(doc)


def get_admin_purchases(
    db: Database,
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    metal: Optional[str] = None,
    status_filter: Optional[str] = None,
    payment_status: Optional[str] = None,
) -> AdminPurchaseListResponse:
    """Retrieve paginated purchases for Admin portal with search and filtering."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    query: Dict[str, Any] = {}

    if metal and metal.lower().strip() in ["gold", "silver"]:
        query["metal"] = metal.lower().strip()

    if status_filter:
        query["status"] = status_filter.lower().strip()

    if payment_status:
        query["payment_status"] = payment_status.lower().strip()

    if search and search.strip():
        search_term = search.strip()
        search_pattern = re.escape(search_term)
        search_regex = {"$regex": search_pattern, "$options": "i"}

        # Search matching users
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

    total = db.purchases.count_documents(query)
    total_pages = max(1, math.ceil(total / safe_limit))

    cursor = db.purchases.find(query).sort("created_at", -1).skip(skip).limit(safe_limit)

    items: List[AdminPurchaseListItem] = []
    for doc in cursor:
        user_id_val = doc.get("user_id")
        user_doc = db.users.find_one({"_id": user_id_val}) if user_id_val else None

        customer_info = AdminPurchaseCustomerInfo(
            user_id=str(user_id_val),
            name=user_doc.get("name", "") if user_doc else "Unknown",
            mobile=user_doc.get("mobile", "") if user_doc else "",
            email=user_doc.get("email") if user_doc else None,
        )

        items.append(
            AdminPurchaseListItem(
                purchase_id=str(doc["_id"]),
                transaction_id=doc.get("transaction_id", ""),
                customer=customer_info,
                metal=doc.get("metal", ""),
                quantity_grams=float(doc.get("quantity_grams", 0.0)),
                rate_per_gram=float(doc.get("rate_per_gram", 0.0)),
                total_amount=float(doc.get("total_amount", 0.0)),
                status=doc.get("status", "completed"),
                payment_status=doc.get("payment_status", "paid"),
                created_at=doc.get("created_at"),
            )
        )

    return AdminPurchaseListResponse(
        items=items,
        page=safe_page,
        limit=safe_limit,
        total=total,
        total_pages=total_pages,
    )


def get_admin_purchase_by_id(
    db: Database,
    purchase_id: str,
) -> AdminPurchaseDetailResponse:
    """Retrieve full purchase details and attached customer profile for Admin."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    purch_obj_id = _to_object_id(purchase_id)
    doc = None
    if purch_obj_id:
        doc = db.purchases.find_one({"_id": purch_obj_id})
    if not doc:
        doc = db.purchases.find_one({"transaction_id": purchase_id})
    if not doc:
        doc = db.purchases.find_one({"_id": purchase_id})

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase not found")

    user_id_val = doc.get("user_id")
    user_doc = db.users.find_one({"_id": user_id_val}) if user_id_val else None

    customer_info = AdminPurchaseCustomerInfo(
        user_id=str(user_id_val),
        name=user_doc.get("name", "") if user_doc else "Unknown",
        mobile=user_doc.get("mobile", "") if user_doc else "",
        email=user_doc.get("email") if user_doc else None,
    )

    return AdminPurchaseDetailResponse(
        purchase_id=str(doc["_id"]),
        transaction_id=doc.get("transaction_id", ""),
        customer=customer_info,
        metal=doc.get("metal", ""),
        quantity_grams=float(doc.get("quantity_grams", 0.0)),
        rate_per_gram=float(doc.get("rate_per_gram", 0.0)),
        metal_value=float(doc.get("metal_value", 0.0)),
        gst_rate_percent=float(doc.get("gst_rate_percent", 3.0)),
        gst_amount=float(doc.get("gst_amount", 0.0)),
        total_amount=float(doc.get("total_amount", 0.0)),
        currency=doc.get("currency", "INR"),
        status=doc.get("status", "completed"),
        payment_status=doc.get("payment_status", "paid"),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
    )
