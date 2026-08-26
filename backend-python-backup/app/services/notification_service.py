import math
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List, Tuple
from bson import ObjectId
from pymongo.database import Database
from fastapi import HTTPException, status

from app.schemas.notifications import (
    NotificationItem,
    NotificationListResponse,
    UnreadCountResponse,
    MarkReadActionResponse,
    MarkAllReadActionResponse,
)

_notification_indexes_initialized = False


def _to_object_id(id_val: Any) -> Optional[ObjectId]:
    """Helper to safely convert string to ObjectId."""
    if isinstance(id_val, ObjectId):
        return id_val
    try:
        return ObjectId(str(id_val))
    except Exception:
        return None


def ensure_notification_indexes(db: Database):
    """Ensure indexes on notifications collection."""
    global _notification_indexes_initialized
    if _notification_indexes_initialized or db is None:
        return
    try:
        db.notifications.create_index(
            [("recipient_type", 1), ("recipient_id", 1), ("created_at", -1)],
            name="idx_notifications_recipient_date",
        )
        db.notifications.create_index("is_read", name="idx_notifications_is_read")
        db.notifications.create_index("type", name="idx_notifications_type")
        db.notifications.create_index(
            [("source_type", 1), ("source_id", 1), ("type", 1), ("recipient_id", 1)],
            unique=True,
            sparse=True,
            name="uniq_notifications_source_event",
        )
        _notification_indexes_initialized = True
    except Exception:
        pass


def _format_notification_response(doc: Dict[str, Any]) -> NotificationItem:
    """Format MongoDB notification document into safe NotificationItem schema."""
    return NotificationItem(
        notification_id=str(doc.get("_id", doc.get("id"))),
        recipient_type=doc.get("recipient_type", "customer"),
        recipient_id=str(doc.get("recipient_id", "")),
        type=doc.get("type", ""),
        title=doc.get("title", ""),
        message=doc.get("message", ""),
        data=doc.get("data", {}),
        is_read=doc.get("is_read", False),
        created_at=doc.get("created_at"),
        read_at=doc.get("read_at"),
    )


def create_notification(
    db: Database,
    recipient_type: str,
    recipient_id: Any,
    notif_type: str,
    title: str,
    message: str,
    data: Optional[Dict[str, Any]] = None,
    source_type: Optional[str] = None,
    source_id: Optional[Any] = None,
) -> Optional[Dict[str, Any]]:
    """Create a new notification document with built-in duplicate prevention."""
    if db is None:
        return None

    ensure_notification_indexes(db)
    recip_obj_id = _to_object_id(recipient_id) or str(recipient_id)
    src_obj_id = _to_object_id(source_id) or (str(source_id) if source_id else None)

    # Check for duplicate notification if source is provided
    if source_type and src_obj_id:
        existing = db.notifications.find_one({
            "source_type": source_type,
            "source_id": src_obj_id,
            "type": notif_type,
            "recipient_id": recip_obj_id,
        })
        if existing:
            return existing

    now_utc = datetime.now(timezone.utc)
    notif_doc = {
        "recipient_type": recipient_type,
        "recipient_id": recip_obj_id,
        "type": notif_type,
        "title": title,
        "message": message,
        "data": data or {},
        "is_read": False,
        "source_type": source_type,
        "source_id": src_obj_id,
        "created_at": now_utc,
        "read_at": None,
    }

    try:
        res = db.notifications.insert_one(notif_doc)
        notif_doc["_id"] = res.inserted_id
        return notif_doc
    except Exception:
        # Prevent failure on unique index conflict
        return db.notifications.find_one({
            "source_type": source_type,
            "source_id": src_obj_id,
            "type": notif_type,
            "recipient_id": recip_obj_id,
        })


# -------------------------------------------------------------
# Trigger Helpers for Specific Business Events
# -------------------------------------------------------------

def notify_purchase_completed(db: Database, purchase_doc: Dict[str, Any]):
    """Send customer notification when purchase is completed."""
    if not db or not purchase_doc:
        return
    metal = str(purchase_doc.get("metal", "metal")).capitalize()
    qty = purchase_doc.get("quantity_grams", 0.0)
    user_id = purchase_doc.get("user_id")
    p_id = purchase_doc.get("_id")
    txn_id = purchase_doc.get("transaction_id", "")

    create_notification(
        db=db,
        recipient_type="customer",
        recipient_id=user_id,
        notif_type="purchase_completed",
        title=f"{metal} Purchase Successful",
        message=f"Your {metal} purchase of {qty} g has been completed successfully.",
        data={
            "transaction_id": txn_id,
            "purchase_id": str(p_id),
            "metal": purchase_doc.get("metal"),
            "quantity_grams": qty,
            "total_amount": purchase_doc.get("total_amount"),
        },
        source_type="purchase",
        source_id=p_id,
    )


def notify_withdrawal_submitted(db: Database, withdrawal_doc: Dict[str, Any]):
    """Send customer and admin notifications when a withdrawal request is submitted."""
    if not db or not withdrawal_doc:
        return
    metal = str(withdrawal_doc.get("metal", "metal")).capitalize()
    qty = withdrawal_doc.get("quantity_grams", 0.0)
    user_id = withdrawal_doc.get("user_id")
    w_id = withdrawal_doc.get("_id")
    txn_id = withdrawal_doc.get("transaction_id", "")

    # 1. Customer notification
    create_notification(
        db=db,
        recipient_type="customer",
        recipient_id=user_id,
        notif_type="withdrawal_submitted",
        title="Withdrawal Request Submitted",
        message=f"Your {metal} withdrawal request for {qty} g has been submitted for verification.",
        data={
            "transaction_id": txn_id,
            "withdrawal_id": str(w_id),
            "metal": withdrawal_doc.get("metal"),
            "quantity_grams": qty,
        },
        source_type="withdrawal",
        source_id=w_id,
    )

    # 2. Admin notification for all admins
    admins = list(db.users.find({"role": "admin"}))
    for adm in admins:
        create_notification(
            db=db,
            recipient_type="admin",
            recipient_id=adm["_id"],
            notif_type="withdrawal_submitted",
            title="New Withdrawal Request",
            message=f"A customer has submitted a {metal} withdrawal request for {qty} g.",
            data={
                "transaction_id": txn_id,
                "withdrawal_id": str(w_id),
                "user_id": str(user_id),
                "metal": withdrawal_doc.get("metal"),
                "quantity_grams": qty,
            },
            source_type="withdrawal",
            source_id=w_id,
        )


def notify_withdrawal_approved(db: Database, withdrawal_doc: Dict[str, Any]):
    """Send customer notification when withdrawal is approved."""
    if not db or not withdrawal_doc:
        return
    metal = str(withdrawal_doc.get("metal", "metal")).capitalize()
    qty = withdrawal_doc.get("quantity_grams", 0.0)
    user_id = withdrawal_doc.get("user_id")
    w_id = withdrawal_doc.get("_id")
    txn_id = withdrawal_doc.get("transaction_id", "")

    create_notification(
        db=db,
        recipient_type="customer",
        recipient_id=user_id,
        notif_type="withdrawal_approved",
        title="Withdrawal Approved",
        message=f"Your {metal} withdrawal request for {qty} g has been approved.",
        data={
            "transaction_id": txn_id,
            "withdrawal_id": str(w_id),
            "metal": withdrawal_doc.get("metal"),
            "quantity_grams": qty,
        },
        source_type="withdrawal",
        source_id=w_id,
    )


def notify_withdrawal_rejected(db: Database, withdrawal_doc: Dict[str, Any], reason: str):
    """Send customer notification when withdrawal is rejected."""
    if not db or not withdrawal_doc:
        return
    metal = str(withdrawal_doc.get("metal", "metal")).capitalize()
    qty = withdrawal_doc.get("quantity_grams", 0.0)
    user_id = withdrawal_doc.get("user_id")
    w_id = withdrawal_doc.get("_id")
    txn_id = withdrawal_doc.get("transaction_id", "")

    create_notification(
        db=db,
        recipient_type="customer",
        recipient_id=user_id,
        notif_type="withdrawal_rejected",
        title="Withdrawal Rejected",
        message=f"Your {metal} withdrawal request for {qty} g has been rejected.",
        data={
            "transaction_id": txn_id,
            "withdrawal_id": str(w_id),
            "metal": withdrawal_doc.get("metal"),
            "quantity_grams": qty,
            "reason": reason,
        },
        source_type="withdrawal",
        source_id=w_id,
    )


def notify_withdrawal_cancelled(db: Database, withdrawal_doc: Dict[str, Any]):
    """Send customer notification when withdrawal is cancelled."""
    if not db or not withdrawal_doc:
        return
    metal = str(withdrawal_doc.get("metal", "metal")).capitalize()
    qty = withdrawal_doc.get("quantity_grams", 0.0)
    user_id = withdrawal_doc.get("user_id")
    w_id = withdrawal_doc.get("_id")
    txn_id = withdrawal_doc.get("transaction_id", "")

    create_notification(
        db=db,
        recipient_type="customer",
        recipient_id=user_id,
        notif_type="withdrawal_cancelled",
        title="Withdrawal Cancelled",
        message=f"Your {metal} withdrawal request for {qty} g has been cancelled.",
        data={
            "transaction_id": txn_id,
            "withdrawal_id": str(w_id),
            "metal": withdrawal_doc.get("metal"),
            "quantity_grams": qty,
        },
        source_type="withdrawal",
        source_id=w_id,
    )


def notify_kyc_submitted(db: Database, user_id: Any, kyc_id: Any):
    """Send admin notification when KYC is submitted."""
    if not db:
        return
    admins = list(db.users.find({"role": "admin"}))
    for adm in admins:
        create_notification(
            db=db,
            recipient_type="admin",
            recipient_id=adm["_id"],
            notif_type="kyc_submitted",
            title="New KYC Verification",
            message="A customer has submitted KYC documents for verification.",
            data={"user_id": str(user_id), "kyc_id": str(kyc_id)},
            source_type="kyc",
            source_id=kyc_id,
        )


def notify_kyc_approved(db: Database, user_id: Any, kyc_id: Any):
    """Send customer notification when KYC is verified."""
    if not db:
        return
    create_notification(
        db=db,
        recipient_type="customer",
        recipient_id=user_id,
        notif_type="kyc_approved",
        title="KYC Verified",
        message="Your KYC verification has been approved successfully.",
        data={"kyc_id": str(kyc_id)},
        source_type="kyc",
        source_id=kyc_id,
    )


def notify_kyc_rejected(db: Database, user_id: Any, kyc_id: Any, reason: str):
    """Send customer notification when KYC is rejected."""
    if not db:
        return
    create_notification(
        db=db,
        recipient_type="customer",
        recipient_id=user_id,
        notif_type="kyc_rejected",
        title="KYC Verification Rejected",
        message="Your KYC verification could not be approved.",
        data={"kyc_id": str(kyc_id), "reason": reason},
        source_type="kyc",
        source_id=kyc_id,
    )


# -------------------------------------------------------------
# API Service Layer Queries
# -------------------------------------------------------------

def get_user_notifications(
    db: Database,
    user_id: Any,
    recipient_type: str = "customer",
    notif_type: Optional[str] = None,
    is_read: Optional[bool] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> NotificationListResponse:
    """Retrieve paginated notifications for customer or admin."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    ensure_notification_indexes(db)
    user_obj_id = _to_object_id(user_id)

    query: Dict[str, Any] = {
        "recipient_type": recipient_type,
        "$or": [{"recipient_id": user_obj_id}, {"recipient_id": str(user_id)}] if user_obj_id else [{"recipient_id": str(user_id)}],
    }

    if notif_type:
        query["type"] = notif_type.strip()

    if is_read is not None:
        query["is_read"] = is_read

    if from_date or to_date:
        date_filter = {}
        if from_date:
            try:
                from_dt = datetime.strptime(from_date.strip(), "%Y-%m-%d").replace(
                    hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc
                )
                date_filter["$gte"] = from_dt
            except ValueError:
                raise HTTPException(status_code=400, detail="from_date must follow YYYY-MM-DD format")
        if to_date:
            try:
                to_dt = datetime.strptime(to_date.strip(), "%Y-%m-%d").replace(
                    hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc
                )
                date_filter["$lte"] = to_dt
            except ValueError:
                raise HTTPException(status_code=400, detail="to_date must follow YYYY-MM-DD format")
        if date_filter:
            query["created_at"] = date_filter

    safe_limit = max(1, min(limit, 100))
    safe_page = max(1, page)
    skip = (safe_page - 1) * safe_limit

    total = db.notifications.count_documents(query)
    total_pages = max(1, math.ceil(total / safe_limit))

    cursor = db.notifications.find(query).sort("created_at", -1).skip(skip).limit(safe_limit)
    items = [_format_notification_response(doc) for doc in cursor]

    return NotificationListResponse(
        items=items,
        page=safe_page,
        limit=safe_limit,
        total=total,
        total_pages=total_pages,
    )


def get_unread_notification_count(
    db: Database,
    user_id: Any,
    recipient_type: str = "customer",
) -> int:
    """Count unread notifications for a user."""
    if db is None:
        return 0

    ensure_notification_indexes(db)
    user_obj_id = _to_object_id(user_id)

    query = {
        "recipient_type": recipient_type,
        "is_read": False,
        "$or": [{"recipient_id": user_obj_id}, {"recipient_id": str(user_id)}] if user_obj_id else [{"recipient_id": str(user_id)}],
    }

    return db.notifications.count_documents(query)


def get_single_notification(
    db: Database,
    notification_id: str,
    user_id: Any,
    recipient_type: str = "customer",
) -> NotificationItem:
    """Retrieve single notification detail ensuring recipient ownership."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    n_obj_id = _to_object_id(notification_id)
    doc = db.notifications.find_one({"_id": n_obj_id}) if n_obj_id else db.notifications.find_one({"_id": notification_id})

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    # Ownership check
    req_uid = str(user_id)
    doc_uid = str(doc.get("recipient_id"))
    doc_type = doc.get("recipient_type")

    if doc_uid != req_uid or doc_type != recipient_type:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    return _format_notification_response(doc)


def mark_notification_as_read(
    db: Database,
    notification_id: str,
    user_id: Any,
    recipient_type: str = "customer",
) -> MarkReadActionResponse:
    """Mark a specific notification as read."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    n_obj_id = _to_object_id(notification_id)
    doc = db.notifications.find_one({"_id": n_obj_id}) if n_obj_id else db.notifications.find_one({"_id": notification_id})

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    req_uid = str(user_id)
    doc_uid = str(doc.get("recipient_id"))
    doc_type = doc.get("recipient_type")

    if doc_uid != req_uid or doc_type != recipient_type:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    read_at = doc.get("read_at")
    if not doc.get("is_read"):
        read_at = datetime.now(timezone.utc)
        db.notifications.update_one(
            {"_id": doc["_id"]},
            {"$set": {"is_read": True, "read_at": read_at}}
        )

    return MarkReadActionResponse(
        message="Notification marked as read",
        notification_id=str(doc["_id"]),
        is_read=True,
        read_at=read_at,
    )


def mark_all_notifications_as_read(
    db: Database,
    user_id: Any,
    recipient_type: str = "customer",
) -> int:
    """Mark all unread notifications as read for a user."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    user_obj_id = _to_object_id(user_id)
    query = {
        "recipient_type": recipient_type,
        "is_read": False,
        "$or": [{"recipient_id": user_obj_id}, {"recipient_id": str(user_id)}] if user_obj_id else [{"recipient_id": str(user_id)}],
    }

    now_utc = datetime.now(timezone.utc)
    res = db.notifications.update_many(
        query,
        {"$set": {"is_read": True, "read_at": now_utc}}
    )

    return res.modified_count
