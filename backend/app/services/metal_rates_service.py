import logging
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, Optional, List, Tuple
from zoneinfo import ZoneInfo
import httpx
from pymongo.database import Database
from fastapi import HTTPException, status

from app.config import settings
from app.schemas.rates import (
    MetalRatePublicResponse,
    RatesPublicResponse,
    MetalRateAdminResponse,
    RatesAdminResponse,
    SetCustomRatesRequest,
    MetalRateSummary,
    RefreshRatesResponse,
    RateHistoryItem,
    RateHistoryResponse,
)

logger = logging.getLogger("gold_silver.rates")

# Default Baseline Rates if database is completely fresh and external API is unconfigured
DEFAULT_GOLD_RATE = 16263.65
DEFAULT_SILVER_RATE = 267.00

_rates_initialized = False


def _clean_rate(value: Any) -> float:
    """Format and round rate cleanly to 2 decimal places using Decimal."""
    d = Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return float(d)


def get_end_of_day_expiry() -> datetime:
    """Calculate the expiration datetime (23:59:59 today) in the configured application timezone, returned in UTC."""
    try:
        app_tz = ZoneInfo(settings.APP_TIMEZONE)
    except Exception:
        app_tz = ZoneInfo("Asia/Kolkata")

    now_in_tz = datetime.now(app_tz)
    end_of_day = now_in_tz.replace(hour=23, minute=59, second=59, microsecond=0)
    return end_of_day.astimezone(timezone.utc)


def ensure_rates_initialized(db: Database):
    """Seed initial gold and silver records in the rates collection and ensure indexes."""
    global _rates_initialized
    if _rates_initialized or db is None:
        return

    try:
        # Unique index on metal
        db.rates.create_index("metal", unique=True, name="uniq_rates_metal")
        db.rate_history.create_index([("metal", 1), ("changed_at", -1)], name="idx_history_metal_date")

        now = datetime.now(timezone.utc)

        # Seed Gold if missing
        if not db.rates.find_one({"metal": "gold"}):
            db.rates.insert_one({
                "metal": "gold",
                "api_rate": DEFAULT_GOLD_RATE,
                "active_rate": DEFAULT_GOLD_RATE,
                "mode": "api",
                "custom_rate": None,
                "custom_rate_date": None,
                "custom_rate_expires_at": None,
                "updated_at": now,
            })

        # Seed Silver if missing
        if not db.rates.find_one({"metal": "silver"}):
            db.rates.insert_one({
                "metal": "silver",
                "api_rate": DEFAULT_SILVER_RATE,
                "active_rate": DEFAULT_SILVER_RATE,
                "mode": "api",
                "custom_rate": None,
                "custom_rate_date": None,
                "custom_rate_expires_at": None,
                "updated_at": now,
            })

        _rates_initialized = True
    except Exception as e:
        logger.error(f"Error initializing rates: {e}")


def _check_and_expire_rates(db: Database):
    """Check if any active custom rate has passed its expiration time and automatically reset to API mode."""
    if db is None:
        return

    now_utc = datetime.now(timezone.utc)
    for metal in ["gold", "silver"]:
        doc = db.rates.find_one({"metal": metal})
        if not doc:
            continue

        if doc.get("mode") == "custom":
            expires_at = doc.get("custom_rate_expires_at")
            if expires_at:
                # Ensure expires_at has timezone info for comparison
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)

                if expires_at < now_utc:
                    # Custom rate has expired -> auto reset to API mode
                    prev_active = _clean_rate(doc.get("active_rate", doc["api_rate"]))
                    api_rate = _clean_rate(doc.get("api_rate", DEFAULT_GOLD_RATE if metal == "gold" else DEFAULT_SILVER_RATE))

                    db.rates.update_one(
                        {"metal": metal},
                        {
                            "$set": {
                                "mode": "api",
                                "active_rate": api_rate,
                                "custom_rate": None,
                                "custom_rate_expires_at": None,
                                "updated_at": now_utc,
                            }
                        }
                    )

                    # Record history event for system expiration
                    db.rate_history.insert_one({
                        "metal": metal,
                        "previous_rate": prev_active,
                        "new_rate": api_rate,
                        "mode": "api",
                        "changed_by": None,
                        "source": "system",
                        "changed_at": now_utc,
                    })


def get_rates_public(db: Database) -> RatesPublicResponse:
    """Retrieve operational gold and silver rates for public consumption (User App & Admin)."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    ensure_rates_initialized(db)
    _check_and_expire_rates(db)

    gold_doc = db.rates.find_one({"metal": "gold"})
    silver_doc = db.rates.find_one({"metal": "silver"})

    return RatesPublicResponse(
        gold=MetalRatePublicResponse(
            api_rate=_clean_rate(gold_doc.get("api_rate", DEFAULT_GOLD_RATE)),
            active_rate=_clean_rate(gold_doc.get("active_rate", DEFAULT_GOLD_RATE)),
            mode=gold_doc.get("mode", "api"),
            updated_at=gold_doc.get("updated_at"),
        ),
        silver=MetalRatePublicResponse(
            api_rate=_clean_rate(silver_doc.get("api_rate", DEFAULT_SILVER_RATE)),
            active_rate=_clean_rate(silver_doc.get("active_rate", DEFAULT_SILVER_RATE)),
            mode=silver_doc.get("mode", "api"),
            updated_at=silver_doc.get("updated_at"),
        ),
    )


def get_rates_admin(db: Database) -> RatesAdminResponse:
    """Retrieve full rate management details for Admin."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    ensure_rates_initialized(db)
    _check_and_expire_rates(db)

    gold_doc = db.rates.find_one({"metal": "gold"})
    silver_doc = db.rates.find_one({"metal": "silver"})

    return RatesAdminResponse(
        gold=MetalRateAdminResponse(
            api_rate=_clean_rate(gold_doc.get("api_rate", DEFAULT_GOLD_RATE)),
            active_rate=_clean_rate(gold_doc.get("active_rate", DEFAULT_GOLD_RATE)),
            custom_rate=_clean_rate(gold_doc["custom_rate"]) if gold_doc.get("custom_rate") is not None else None,
            mode=gold_doc.get("mode", "api"),
            custom_rate_expires_at=gold_doc.get("custom_rate_expires_at"),
            updated_at=gold_doc.get("updated_at"),
        ),
        silver=MetalRateAdminResponse(
            api_rate=_clean_rate(silver_doc.get("api_rate", DEFAULT_SILVER_RATE)),
            active_rate=_clean_rate(silver_doc.get("active_rate", DEFAULT_SILVER_RATE)),
            custom_rate=_clean_rate(silver_doc["custom_rate"]) if silver_doc.get("custom_rate") is not None else None,
            mode=silver_doc.get("mode", "api"),
            custom_rate_expires_at=silver_doc.get("custom_rate_expires_at"),
            updated_at=silver_doc.get("updated_at"),
        ),
    )


def set_custom_rates(
    db: Database,
    admin_user: Dict[str, Any],
    data: SetCustomRatesRequest,
) -> RatesAdminResponse:
    """Set or disable custom rate for gold and/or silver with strict validation."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    ensure_rates_initialized(db)
    _check_and_expire_rates(db)

    now_utc = datetime.now(timezone.utc)
    admin_id = str(admin_user.get("id", admin_user.get("_id")))

    # Process Gold
    if data.gold is not None:
        gold_doc = db.rates.find_one({"metal": "gold"})
        current_api = _clean_rate(gold_doc.get("api_rate", DEFAULT_GOLD_RATE))
        prev_active = _clean_rate(gold_doc.get("active_rate", current_api))

        if data.gold.enabled:
            custom_val = _clean_rate(data.gold.rate)
            if custom_val < current_api:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Gold custom rate must be greater than or equal to the current API rate",
                )
            expiry_utc = get_end_of_day_expiry()

            db.rates.update_one(
                {"metal": "gold"},
                {
                    "$set": {
                        "mode": "custom",
                        "custom_rate": custom_val,
                        "active_rate": custom_val,
                        "custom_rate_date": now_utc,
                        "custom_rate_expires_at": expiry_utc,
                        "updated_at": now_utc,
                    }
                }
            )

            # Record history
            db.rate_history.insert_one({
                "metal": "gold",
                "previous_rate": prev_active,
                "new_rate": custom_val,
                "mode": "custom",
                "changed_by": admin_id,
                "source": "admin",
                "changed_at": now_utc,
            })
        else:
            # Disable custom mode
            db.rates.update_one(
                {"metal": "gold"},
                {
                    "$set": {
                        "mode": "api",
                        "custom_rate": None,
                        "active_rate": current_api,
                        "custom_rate_date": None,
                        "custom_rate_expires_at": None,
                        "updated_at": now_utc,
                    }
                }
            )

            if gold_doc.get("mode") == "custom":
                db.rate_history.insert_one({
                    "metal": "gold",
                    "previous_rate": prev_active,
                    "new_rate": current_api,
                    "mode": "api",
                    "changed_by": admin_id,
                    "source": "admin",
                    "changed_at": now_utc,
                })

    # Process Silver
    if data.silver is not None:
        silver_doc = db.rates.find_one({"metal": "silver"})
        current_api = _clean_rate(silver_doc.get("api_rate", DEFAULT_SILVER_RATE))
        prev_active = _clean_rate(silver_doc.get("active_rate", current_api))

        if data.silver.enabled:
            custom_val = _clean_rate(data.silver.rate)
            if custom_val < current_api:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Silver custom rate must be greater than or equal to the current API rate",
                )
            expiry_utc = get_end_of_day_expiry()

            db.rates.update_one(
                {"metal": "silver"},
                {
                    "$set": {
                        "mode": "custom",
                        "custom_rate": custom_val,
                        "active_rate": custom_val,
                        "custom_rate_date": now_utc,
                        "custom_rate_expires_at": expiry_utc,
                        "updated_at": now_utc,
                    }
                }
            )

            # Record history
            db.rate_history.insert_one({
                "metal": "silver",
                "previous_rate": prev_active,
                "new_rate": custom_val,
                "mode": "custom",
                "changed_by": admin_id,
                "source": "admin",
                "changed_at": now_utc,
            })
        else:
            # Disable custom mode
            db.rates.update_one(
                {"metal": "silver"},
                {
                    "$set": {
                        "mode": "api",
                        "custom_rate": None,
                        "active_rate": current_api,
                        "custom_rate_date": None,
                        "custom_rate_expires_at": None,
                        "updated_at": now_utc,
                    }
                }
            )

            if silver_doc.get("mode") == "custom":
                db.rate_history.insert_one({
                    "metal": "silver",
                    "previous_rate": prev_active,
                    "new_rate": current_api,
                    "mode": "api",
                    "changed_by": admin_id,
                    "source": "admin",
                    "changed_at": now_utc,
                })

    return get_rates_admin(db)


async def fetch_external_api_rates() -> Tuple[Optional[float], Optional[float]]:
    """Fetch live market rates from external metal API if configured. Returns (gold_rate, silver_rate) or (None, None)."""
    if not settings.METAL_RATES_API_URL:
        return None, None

    headers = {}
    if settings.METAL_RATES_API_KEY:
        headers["x-access-token"] = settings.METAL_RATES_API_KEY
        headers["Authorization"] = f"Bearer {settings.METAL_RATES_API_KEY}"

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(settings.METAL_RATES_API_URL, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                gold_rate = None
                silver_rate = None

                # Extract rates depending on standard response formats
                if "gold" in data and isinstance(data["gold"], (int, float)):
                    gold_rate = _clean_rate(data["gold"])
                elif "rates" in data and "XAU" in data["rates"]:
                    # Convert ounce/gram if needed or use direct rate
                    gold_rate = _clean_rate(data["rates"]["XAU"])

                if "silver" in data and isinstance(data["silver"], (int, float)):
                    silver_rate = _clean_rate(data["silver"])
                elif "rates" in data and "XAG" in data["rates"]:
                    silver_rate = _clean_rate(data["rates"]["XAG"])

                return gold_rate, silver_rate
    except Exception as e:
        logger.warning(f"Failed to fetch external metal rates: {e}")
    return None, None


async def refresh_api_rates(db: Database, admin_user: Optional[Dict[str, Any]] = None) -> RefreshRatesResponse:
    """Manually or periodically refresh metal rates from external provider, updating database while preserving active custom rates."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    ensure_rates_initialized(db)
    _check_and_expire_rates(db)

    now_utc = datetime.now(timezone.utc)
    admin_id = str(admin_user.get("id", admin_user.get("_id"))) if admin_user else None

    # Attempt fetch
    fetched_gold, fetched_silver = await fetch_external_api_rates()

    # Process Gold
    gold_doc = db.rates.find_one({"metal": "gold"})
    current_gold_api = _clean_rate(gold_doc.get("api_rate", DEFAULT_GOLD_RATE))
    new_gold_api = fetched_gold if (fetched_gold is not None and fetched_gold > 0) else current_gold_api

    prev_gold_active = _clean_rate(gold_doc.get("active_rate", current_gold_api))
    new_gold_active = prev_gold_active

    if gold_doc.get("mode") == "api":
        new_gold_active = new_gold_api

    db.rates.update_one(
        {"metal": "gold"},
        {
            "$set": {
                "api_rate": new_gold_api,
                "active_rate": new_gold_active,
                "updated_at": now_utc,
            }
        }
    )

    if gold_doc.get("mode") == "api" and new_gold_api != prev_gold_active:
        db.rate_history.insert_one({
            "metal": "gold",
            "previous_rate": prev_gold_active,
            "new_rate": new_gold_active,
            "mode": "api",
            "changed_by": admin_id,
            "source": "api" if not admin_id else "admin",
            "changed_at": now_utc,
        })

    # Process Silver
    silver_doc = db.rates.find_one({"metal": "silver"})
    current_silver_api = _clean_rate(silver_doc.get("api_rate", DEFAULT_SILVER_RATE))
    new_silver_api = fetched_silver if (fetched_silver is not None and fetched_silver > 0) else current_silver_api

    prev_silver_active = _clean_rate(silver_doc.get("active_rate", current_silver_api))
    new_silver_active = prev_silver_active

    if silver_doc.get("mode") == "api":
        new_silver_active = new_silver_api

    db.rates.update_one(
        {"metal": "silver"},
        {
            "$set": {
                "api_rate": new_silver_api,
                "active_rate": new_silver_active,
                "updated_at": now_utc,
            }
        }
    )

    if silver_doc.get("mode") == "api" and new_silver_api != prev_silver_active:
        db.rate_history.insert_one({
            "metal": "silver",
            "previous_rate": prev_silver_active,
            "new_rate": new_silver_active,
            "mode": "api",
            "changed_by": admin_id,
            "source": "api" if not admin_id else "admin",
            "changed_at": now_utc,
        })

    return RefreshRatesResponse(
        message="Rates refreshed successfully",
        gold=MetalRateSummary(api_rate=new_gold_api, active_rate=new_gold_active),
        silver=MetalRateSummary(api_rate=new_silver_api, active_rate=new_silver_active),
    )


def get_rate_history(
    db: Database,
    metal: Optional[str] = None,
    limit: int = 50,
) -> RateHistoryResponse:
    """Retrieve audit history of rate updates."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    query: Dict[str, Any] = {}
    if metal and metal.lower() in ["gold", "silver"]:
        query["metal"] = metal.lower()

    safe_limit = max(1, min(limit, 100))
    cursor = db.rate_history.find(query).sort("changed_at", -1).limit(safe_limit)

    items: List[RateHistoryItem] = []
    for doc in cursor:
        items.append(
            RateHistoryItem(
                id=str(doc["_id"]),
                metal=doc.get("metal", ""),
                previous_rate=_clean_rate(doc.get("previous_rate", 0)),
                new_rate=_clean_rate(doc.get("new_rate", 0)),
                mode=doc.get("mode", "api"),
                changed_by=str(doc["changed_by"]) if doc.get("changed_by") else None,
                source=doc.get("source", "system"),
                changed_at=doc.get("changed_at"),
            )
        )

    return RateHistoryResponse(items=items, total=len(items))
