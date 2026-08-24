import math
import re
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, Optional, List, Tuple
from bson import ObjectId
from pymongo.database import Database
from fastapi import HTTPException, status

from app.schemas.holdings import (
    MetalHoldingValuation,
    CustomerHoldingsResponse,
    SingleMetalHoldingResponse,
    AdminCustomerHoldingsResponse,
    AdminHoldingsListItem,
    AdminHoldingsListResponse,
)
from app.services.metal_rates_service import (
    ensure_rates_initialized,
    _check_and_expire_rates,
    DEFAULT_GOLD_RATE,
    DEFAULT_SILVER_RATE,
)

_holdings_indexes_initialized = False


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


def ensure_holdings_indexes(db: Database):
    """Ensure indexes for holdings and holding_transactions collections."""
    global _holdings_indexes_initialized
    if _holdings_indexes_initialized or db is None:
        return
    try:
        db.holdings.create_index("user_id", unique=True, name="uniq_holdings_user_id")
        db.holding_transactions.create_index("purchase_id", unique=True, name="uniq_holding_txns_purchase_id")
        db.holding_transactions.create_index([("user_id", 1), ("processed_at", -1)], name="idx_holding_txns_user_date")
        _holdings_indexes_initialized = True
    except Exception:
        pass


def get_or_create_holding_doc(db: Database, user_id: Any) -> Dict[str, Any]:
    """Retrieve existing holdings document for user, or initialize empty holdings if none exists."""
    ensure_holdings_indexes(db)
    user_obj_id = _to_object_id(user_id)
    query = {"$or": [{"user_id": user_obj_id}, {"user_id": str(user_id)}]} if user_obj_id else {"user_id": str(user_id)}
    
    doc = db.holdings.find_one(query)
    if doc:
        return doc

    now_utc = datetime.now(timezone.utc)
    target_user_id = user_obj_id if user_obj_id else str(user_id)
    
    default_doc = {
        "user_id": target_user_id,
        "gold": {
            "quantity_grams": 0.0,
            "total_invested": 0.0,
            "average_buy_rate": 0.0,
        },
        "silver": {
            "quantity_grams": 0.0,
            "total_invested": 0.0,
            "average_buy_rate": 0.0,
        },
        "created_at": now_utc,
        "updated_at": now_utc,
    }

    try:
        res = db.holdings.insert_one(default_doc)
        default_doc["_id"] = res.inserted_id
        return default_doc
    except Exception:
        # In case of race condition
        return db.holdings.find_one(query)


def process_purchase_for_holdings(db: Database, purchase_doc: Dict[str, Any]):
    """Update customer metal holdings upon completion of a purchase with strict idempotency and metal isolation."""
    if db is None or not purchase_doc:
        return

    # Only process completed and paid purchases
    if purchase_doc.get("status") != "completed" or purchase_doc.get("payment_status") != "paid":
        return

    purchase_id = purchase_doc.get("_id")
    if not purchase_id:
        return

    ensure_holdings_indexes(db)

    # 1. Idempotency Check: Verify if purchase was already processed
    existing_txn = db.holding_transactions.find_one({"purchase_id": purchase_id})
    if existing_txn:
        return

    metal = str(purchase_doc.get("metal", "")).lower().strip()
    if metal not in ["gold", "silver"]:
        return

    # Extract purchase quantity and invested metal value
    purch_qty = Decimal(str(purchase_doc.get("quantity_grams", 0.0)))
    purch_val = Decimal(str(purchase_doc.get("metal_value", 0.0)))
    if purch_qty <= 0:
        return

    user_id = purchase_doc.get("user_id")
    holdings_doc = get_or_create_holding_doc(db, user_id)

    # 2. Strict Metal Separation: update only the purchased metal
    metal_data = holdings_doc.get(metal, {})
    old_qty = Decimal(str(metal_data.get("quantity_grams", 0.0)))
    old_inv = Decimal(str(metal_data.get("total_invested", 0.0)))

    new_qty = old_qty + purch_qty
    new_inv = old_inv + purch_val
    new_avg_rate = (new_inv / new_qty) if new_qty > 0 else Decimal("0.0")

    new_qty_f = float(new_qty)
    new_inv_f = _quantize_2(new_inv)
    new_avg_f = _quantize_2(new_avg_rate)

    now_utc = datetime.now(timezone.utc)

    # 3. Update holdings document
    db.holdings.update_one(
        {"_id": holdings_doc["_id"]},
        {
            "$set": {
                f"{metal}.quantity_grams": new_qty_f,
                f"{metal}.total_invested": new_inv_f,
                f"{metal}.average_buy_rate": new_avg_f,
                "updated_at": now_utc,
            }
        }
    )

    # 4. Insert holding transaction audit record for duplicate protection
    try:
        db.holding_transactions.insert_one({
            "purchase_id": purchase_id,
            "user_id": user_id,
            "metal": metal,
            "quantity_grams": new_qty_f,
            "invested_amount": new_inv_f,
            "processed_at": now_utc,
        })
    except Exception:
        pass


def _get_active_rates(db: Database) -> Tuple[float, float]:
    """Retrieve current operational active rates for Gold and Silver."""
    ensure_rates_initialized(db)
    _check_and_expire_rates(db)

    gold_doc = db.rates.find_one({"metal": "gold"})
    silver_doc = db.rates.find_one({"metal": "silver"})

    gold_rate = float(gold_doc.get("active_rate", DEFAULT_GOLD_RATE)) if gold_doc else DEFAULT_GOLD_RATE
    silver_rate = float(silver_doc.get("active_rate", DEFAULT_SILVER_RATE)) if silver_doc else DEFAULT_SILVER_RATE

    return gold_rate, silver_rate


def _build_holdings_valuation(db: Database, holdings_doc: Dict[str, Any]) -> CustomerHoldingsResponse:
    """Calculate current live market valuations and profit/loss across gold and silver balances."""
    active_gold_rate, active_silver_rate = _get_active_rates(db)

    gold_data = holdings_doc.get("gold", {})
    silver_data = holdings_doc.get("silver", {})

    # Gold calculations
    g_qty = Decimal(str(gold_data.get("quantity_grams", 0.0)))
    g_inv = Decimal(str(gold_data.get("total_invested", 0.0)))
    g_avg = Decimal(str(gold_data.get("average_buy_rate", 0.0)))
    g_rate = Decimal(str(active_gold_rate))
    g_val = g_qty * g_rate
    g_pl = g_val - g_inv

    gold_valuation = MetalHoldingValuation(
        quantity_grams=float(g_qty),
        total_invested=_quantize_2(g_inv),
        average_buy_rate=_quantize_2(g_avg),
        current_rate=_quantize_2(g_rate),
        current_value=_quantize_2(g_val),
        profit_loss=_quantize_2(g_pl),
    )

    # Silver calculations
    s_qty = Decimal(str(silver_data.get("quantity_grams", 0.0)))
    s_inv = Decimal(str(silver_data.get("total_invested", 0.0)))
    s_avg = Decimal(str(silver_data.get("average_buy_rate", 0.0)))
    s_rate = Decimal(str(active_silver_rate))
    s_val = s_qty * s_rate
    s_pl = s_val - s_inv

    silver_valuation = MetalHoldingValuation(
        quantity_grams=float(s_qty),
        total_invested=_quantize_2(s_inv),
        average_buy_rate=_quantize_2(s_avg),
        current_rate=_quantize_2(s_rate),
        current_value=_quantize_2(s_val),
        profit_loss=_quantize_2(s_pl),
    )

    # Total Portfolio Calculations
    tot_inv = g_inv + s_inv
    tot_val = g_val + s_val
    tot_pl = tot_val - tot_inv

    return CustomerHoldingsResponse(
        gold=gold_valuation,
        silver=silver_valuation,
        total_invested=_quantize_2(tot_inv),
        total_current_value=_quantize_2(tot_val),
        total_profit_loss=_quantize_2(tot_pl),
    )


def get_customer_holdings(db: Database, current_user: Dict[str, Any]) -> CustomerHoldingsResponse:
    """Retrieve full holdings balance and valuation for the authenticated customer."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    holdings_doc = get_or_create_holding_doc(db, current_user["id"])
    return _build_holdings_valuation(db, holdings_doc)


def get_customer_metal_holding(
    db: Database,
    current_user: Dict[str, Any],
    metal: str,
) -> SingleMetalHoldingResponse:
    """Retrieve holdings and live valuation for a specific metal ('gold' or 'silver')."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    cleaned_metal = metal.lower().strip()
    if cleaned_metal not in ["gold", "silver"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Metal must be either 'gold' or 'silver'")

    holdings_resp = get_customer_holdings(db, current_user)
    metal_val = getattr(holdings_resp, cleaned_metal)

    return SingleMetalHoldingResponse(
        metal=cleaned_metal,
        quantity_grams=metal_val.quantity_grams,
        total_invested=metal_val.total_invested,
        average_buy_rate=metal_val.average_buy_rate,
        current_rate=metal_val.current_rate,
        current_value=metal_val.current_value,
        profit_loss=metal_val.profit_loss,
    )


def get_admin_customer_holdings(db: Database, user_id: str) -> AdminCustomerHoldingsResponse:
    """Retrieve a specific customer's holdings and live valuation for Admin."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    user_obj_id = _to_object_id(user_id)
    user_doc = None
    if user_obj_id:
        user_doc = db.users.find_one({"_id": user_obj_id})
    if not user_doc:
        user_doc = db.users.find_one({"_id": user_id})

    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    holdings_doc = get_or_create_holding_doc(db, user_doc["_id"])
    valuation = _build_holdings_valuation(db, holdings_doc)

    return AdminCustomerHoldingsResponse(
        user_id=str(user_doc["_id"]),
        customer_name=user_doc.get("name", "Unknown"),
        customer_mobile=user_doc.get("mobile", ""),
        customer_email=user_doc.get("email"),
        gold=valuation.gold,
        silver=valuation.silver,
        total_invested=valuation.total_invested,
        total_current_value=valuation.total_current_value,
        total_profit_loss=valuation.total_profit_loss,
        updated_at=holdings_doc.get("updated_at"),
    )


def get_admin_all_holdings(
    db: Database,
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    metal: Optional[str] = None,
) -> AdminHoldingsListResponse:
    """Retrieve paginated list of all customer holdings with search and live valuation for Admin."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    ensure_holdings_indexes(db)
    active_gold_rate, active_silver_rate = _get_active_rates(db)

    # Search filter on users
    user_query: Dict[str, Any] = {"role": "customer"}
    if search and search.strip():
        search_pattern = re.escape(search.strip())
        search_regex = {"$regex": search_pattern, "$options": "i"}
        user_query["$or"] = [
            {"name": search_regex},
            {"mobile": search_regex},
            {"email": search_regex},
        ]

    safe_limit = max(1, min(limit, 100))
    safe_page = max(1, page)
    skip = (safe_page - 1) * safe_limit

    total_users = db.users.count_documents(user_query)
    total_pages = max(1, math.ceil(total_users / safe_limit))

    user_cursor = db.users.find(user_query).sort("created_at", -1).skip(skip).limit(safe_limit)

    items: List[AdminHoldingsListItem] = []
    for u in user_cursor:
        u_id = u["_id"]
        h_doc = db.holdings.find_one({"$or": [{"user_id": u_id}, {"user_id": str(u_id)}]}) or {}

        g_data = h_doc.get("gold", {})
        s_data = h_doc.get("silver", {})

        g_qty = Decimal(str(g_data.get("quantity_grams", 0.0)))
        g_inv = Decimal(str(g_data.get("total_invested", 0.0)))
        g_val = g_qty * Decimal(str(active_gold_rate))

        s_qty = Decimal(str(s_data.get("quantity_grams", 0.0)))
        s_inv = Decimal(str(s_data.get("total_invested", 0.0)))
        s_val = s_qty * Decimal(str(active_silver_rate))

        tot_inv = g_inv + s_inv
        tot_val = g_val + s_val
        tot_pl = tot_val - tot_inv

        # Optional filter by metal positive balance if requested
        if metal and metal.lower().strip() == "gold" and g_qty <= 0:
            continue
        if metal and metal.lower().strip() == "silver" and s_qty <= 0:
            continue

        items.append(
            AdminHoldingsListItem(
                user_id=str(u_id),
                customer_name=u.get("name", "Unknown"),
                customer_mobile=u.get("mobile", ""),
                customer_email=u.get("email"),
                gold_quantity=float(g_qty),
                gold_invested=_quantize_2(g_inv),
                silver_quantity=float(s_qty),
                silver_invested=_quantize_2(s_inv),
                total_invested=_quantize_2(tot_inv),
                total_current_value=_quantize_2(tot_val),
                total_profit_loss=_quantize_2(tot_pl),
                updated_at=h_doc.get("updated_at"),
            )
        )

    return AdminHoldingsListResponse(
        items=items,
        page=safe_page,
        limit=safe_limit,
        total=total_users,
        total_pages=total_pages,
    )
