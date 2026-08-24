from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from bson import ObjectId
from pymongo.database import Database
from fastapi import HTTPException, status

from app.schemas.kyc import (
    KYCSubmitRequest,
    KYCResponse,
    AdminKYCPendingItem,
    AdminKYCPendingListResponse,
    AdminKYCUserProfile,
    AdminKYCDetailResponse,
    KYCActionResponse,
    AddressSchema,
)

_kyc_indexes_initialized = False


def ensure_kyc_indexes(db: Database):
    """Ensure unique index on user_id in kyc collection."""
    global _kyc_indexes_initialized
    if _kyc_indexes_initialized or db is None:
        return
    try:
        db.kyc.create_index("user_id", unique=True, name="uniq_kyc_user_id")
        _kyc_indexes_initialized = True
    except Exception:
        pass


def _to_object_id(id_val: Any) -> Optional[ObjectId]:
    """Helper to safely convert string to ObjectId."""
    if isinstance(id_val, ObjectId):
        return id_val
    try:
        return ObjectId(str(id_val))
    except Exception:
        return None


def format_kyc_response(doc: Dict[str, Any]) -> KYCResponse:
    """Format raw MongoDB KYC document to KYCResponse schema."""
    addr_data = doc.get("address", {})
    if isinstance(addr_data, dict):
        address = AddressSchema(
            address_line=addr_data.get("address_line", ""),
            city=addr_data.get("city", ""),
            state=addr_data.get("state", ""),
            pincode=addr_data.get("pincode", ""),
        )
    else:
        address = AddressSchema(address_line="", city="", state="", pincode="")

    return KYCResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        full_name=doc.get("full_name", ""),
        date_of_birth=str(doc.get("date_of_birth", "")),
        gender=doc.get("gender", ""),
        address=address,
        id_type=doc.get("id_type", ""),
        id_number=doc.get("id_number", ""),
        status=doc.get("status", "pending"),
        rejection_reason=doc.get("rejection_reason"),
        submitted_at=doc.get("submitted_at"),
        reviewed_at=doc.get("reviewed_at"),
        reviewed_by=str(doc["reviewed_by"]) if doc.get("reviewed_by") else None,
        updated_at=doc.get("updated_at"),
    )


def submit_kyc(db: Database, current_user: Dict[str, Any], data: KYCSubmitRequest) -> KYCResponse:
    """Submit customer KYC details or resubmit a previously rejected KYC."""
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    ensure_kyc_indexes(db)
    user_id_obj = _to_object_id(current_user["id"])
    if not user_id_obj:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID")

    existing_kyc = db.kyc.find_one({"user_id": user_id_obj})
    now = datetime.now(timezone.utc)

    if existing_kyc:
        existing_status = existing_kyc.get("status", "pending")
        if existing_status == "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="KYC verification is already pending",
            )
        if existing_status == "verified":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="KYC is already verified",
            )
        
        # If status is rejected, update the existing record
        update_fields = {
            "full_name": data.full_name,
            "date_of_birth": data.date_of_birth,
            "gender": data.gender,
            "address": data.address.model_dump(),
            "id_type": data.id_type,
            "id_number": data.id_number,
            "status": "pending",
            "rejection_reason": None,
            "submitted_at": now,
            "reviewed_at": None,
            "reviewed_by": None,
            "updated_at": now,
        }
        db.kyc.update_one({"_id": existing_kyc["_id"]}, {"$set": update_fields})
        db.users.update_one({"_id": user_id_obj}, {"$set": {"kyc_status": "pending", "updated_at": now}})
        
        updated_doc = db.kyc.find_one({"_id": existing_kyc["_id"]})
        return format_kyc_response(updated_doc)

    # New KYC submission
    new_kyc_doc = {
        "user_id": user_id_obj,
        "full_name": data.full_name,
        "date_of_birth": data.date_of_birth,
        "gender": data.gender,
        "address": data.address.model_dump(),
        "id_type": data.id_type,
        "id_number": data.id_number,
        "status": "pending",
        "rejection_reason": None,
        "submitted_at": now,
        "reviewed_at": None,
        "reviewed_by": None,
        "updated_at": now,
    }

    result = db.kyc.insert_one(new_kyc_doc)
    db.users.update_one({"_id": user_id_obj}, {"$set": {"kyc_status": "pending", "updated_at": now}})
    new_kyc_doc["_id"] = result.inserted_id
    return format_kyc_response(new_kyc_doc)


def get_user_kyc(db: Database, current_user: Dict[str, Any]) -> KYCResponse:
    """Retrieve current customer's KYC details."""
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    user_id_obj = _to_object_id(current_user["id"])
    kyc_doc = db.kyc.find_one({"user_id": user_id_obj})
    if not kyc_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KYC record not found",
        )
    return format_kyc_response(kyc_doc)


def get_pending_kyc_list(db: Database) -> AdminKYCPendingListResponse:
    """Retrieve all pending KYC records for Admin review."""
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    cursor = db.kyc.find({"status": "pending"}).sort("submitted_at", -1)
    items: List[AdminKYCPendingItem] = []

    for kyc_doc in cursor:
        user_id_obj = kyc_doc.get("user_id")
        user_doc = db.users.find_one({"_id": user_id_obj}) if user_id_obj else None
        
        user_name = user_doc.get("name") if user_doc else kyc_doc.get("full_name", "")
        user_mobile = user_doc.get("mobile") if user_doc else ""

        items.append(
            AdminKYCPendingItem(
                kyc_id=str(kyc_doc["_id"]),
                user_id=str(user_id_obj),
                name=user_name,
                mobile=user_mobile,
                status="pending",
                submitted_at=kyc_doc.get("submitted_at"),
            )
        )

    return AdminKYCPendingListResponse(items=items, total=len(items))


def get_kyc_details(db: Database, kyc_id: str) -> AdminKYCDetailResponse:
    """Retrieve full KYC details along with associated user profile for Admin."""
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    kyc_obj_id = _to_object_id(kyc_id)
    if not kyc_obj_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid KYC ID",
        )

    kyc_doc = db.kyc.find_one({"_id": kyc_obj_id})
    if not kyc_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KYC record not found",
        )

    user_id_obj = kyc_doc.get("user_id")
    user_doc = db.users.find_one({"_id": user_id_obj})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated user not found",
        )

    user_profile = AdminKYCUserProfile(
        id=str(user_doc["_id"]),
        name=user_doc.get("name", ""),
        mobile=user_doc.get("mobile", ""),
        email=user_doc.get("email"),
        account_status=user_doc.get("account_status", "active"),
        kyc_status=user_doc.get("kyc_status", "pending"),
    )

    return AdminKYCDetailResponse(
        kyc=format_kyc_response(kyc_doc),
        user=user_profile,
    )


def approve_kyc(db: Database, kyc_id: str, admin_user: Dict[str, Any]) -> KYCActionResponse:
    """Admin action: Approve customer KYC verification."""
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    kyc_obj_id = _to_object_id(kyc_id)
    if not kyc_obj_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid KYC ID",
        )

    kyc_doc = db.kyc.find_one({"_id": kyc_obj_id})
    if not kyc_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KYC record not found",
        )

    current_status = kyc_doc.get("status")
    if current_status == "verified":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="KYC is already verified",
        )

    now = datetime.now(timezone.utc)
    admin_id = str(admin_user.get("id", admin_user.get("_id")))

    # Update KYC document
    db.kyc.update_one(
        {"_id": kyc_obj_id},
        {
            "$set": {
                "status": "verified",
                "rejection_reason": None,
                "reviewed_at": now,
                "reviewed_by": admin_id,
                "updated_at": now,
            }
        }
    )

    # Synchronize users collection
    user_id_obj = kyc_doc.get("user_id")
    if user_id_obj:
        db.users.update_one(
            {"_id": user_id_obj},
            {"$set": {"kyc_status": "verified", "updated_at": now}}
        )

    return KYCActionResponse(
        message="KYC verified successfully",
        status="verified",
    )


def reject_kyc(db: Database, kyc_id: str, admin_user: Dict[str, Any], reason: str) -> KYCActionResponse:
    """Admin action: Reject customer KYC verification with mandatory reason."""
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    kyc_obj_id = _to_object_id(kyc_id)
    if not kyc_obj_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid KYC ID",
        )

    kyc_doc = db.kyc.find_one({"_id": kyc_obj_id})
    if not kyc_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KYC record not found",
        )

    current_status = kyc_doc.get("status")
    if current_status == "verified":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reject an already verified KYC",
        )

    now = datetime.now(timezone.utc)
    admin_id = str(admin_user.get("id", admin_user.get("_id")))

    # Update KYC document
    db.kyc.update_one(
        {"_id": kyc_obj_id},
        {
            "$set": {
                "status": "rejected",
                "rejection_reason": reason,
                "reviewed_at": now,
                "reviewed_by": admin_id,
                "updated_at": now,
            }
        }
    )

    # Synchronize users collection
    user_id_obj = kyc_doc.get("user_id")
    if user_id_obj:
        db.users.update_one(
            {"_id": user_id_obj},
            {"$set": {"kyc_status": "rejected", "updated_at": now}}
        )

    return KYCActionResponse(
        message="KYC rejected",
        status="rejected",
    )
