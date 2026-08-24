import math
import re
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from bson import ObjectId
from pymongo.database import Database
from fastapi import HTTPException, status

from app.schemas.profile import (
    AddressProfileSchema,
    UserProfileData,
    UserProfileResponse,
    UpdateProfileRequest,
)
from app.schemas.admin_users import (
    AdminUserListItem,
    AdminUserListResponse,
    AdminUserDetailResponse,
    AdminUserStatusResponse,
)


def _to_object_id(id_val: Any) -> Optional[ObjectId]:
    """Helper to safely convert string to ObjectId."""
    if isinstance(id_val, ObjectId):
        return id_val
    try:
        return ObjectId(str(id_val))
    except Exception:
        return None


def _format_profile_data(profile_dict: Optional[Dict[str, Any]]) -> UserProfileData:
    """Format raw profile dictionary into safe UserProfileData schema."""
    if not isinstance(profile_dict, dict):
        return UserProfileData()

    addr_data = profile_dict.get("address")
    address = None
    if isinstance(addr_data, dict):
        address = AddressProfileSchema(
            address_line=addr_data.get("address_line"),
            city=addr_data.get("city"),
            state=addr_data.get("state"),
            pincode=addr_data.get("pincode"),
        )

    return UserProfileData(
        full_name=profile_dict.get("full_name"),
        date_of_birth=profile_dict.get("date_of_birth"),
        gender=profile_dict.get("gender"),
        relationship=profile_dict.get("relationship"),
        relationship_other=profile_dict.get("relationship_other"),
        address=address,
        profile_image_url=profile_dict.get("profile_image_url"),
        pan=profile_dict.get("pan"),
        aadhar=profile_dict.get("aadhar"),
        account_number=profile_dict.get("account_number"),
        ifsc=profile_dict.get("ifsc"),
        nominee_name=profile_dict.get("nominee_name"),
        nominee_mobile=profile_dict.get("nominee_mobile"),
        nominee_dob=profile_dict.get("nominee_dob"),
        nominee_address=profile_dict.get("nominee_address"),
    )


def _format_user_profile_response(user_doc: Dict[str, Any]) -> UserProfileResponse:
    """Format MongoDB user document into safe UserProfileResponse schema."""
    profile_data = user_doc.get("profile")
    is_completed = user_doc.get("profile_completed", False)
    if not is_completed and isinstance(profile_data, dict):
        addr = profile_data.get("address")
        if addr and isinstance(addr, dict) and addr.get("address_line"):
            if profile_data.get("full_name") or profile_data.get("nominee_name") or profile_data.get("pan"):
                is_completed = True

    return UserProfileResponse(
        user_id=str(user_doc.get("_id", user_doc.get("id"))),
        name=user_doc.get("name", ""),
        mobile=user_doc.get("mobile", ""),
        email=user_doc.get("email"),
        role=user_doc.get("role", "customer"),
        account_status=user_doc.get("account_status", "active"),
        kyc_status=user_doc.get("kyc_status", "pending"),
        profile_completed=is_completed,
        profile=_format_profile_data(user_doc.get("profile")),
        created_at=user_doc.get("created_at"),
        updated_at=user_doc.get("updated_at"),
    )


def _format_admin_user_detail_response(user_doc: Dict[str, Any]) -> AdminUserDetailResponse:
    """Format MongoDB user document into AdminUserDetailResponse schema."""
    return AdminUserDetailResponse(
        user_id=str(user_doc.get("_id", user_doc.get("id"))),
        name=user_doc.get("name", ""),
        mobile=user_doc.get("mobile", ""),
        email=user_doc.get("email"),
        role=user_doc.get("role", "customer"),
        account_status=user_doc.get("account_status", "active"),
        kyc_status=user_doc.get("kyc_status", "pending"),
        profile=_format_profile_data(user_doc.get("profile")),
        created_at=user_doc.get("created_at"),
        updated_at=user_doc.get("updated_at"),
    )


def get_my_profile(db: Database, current_user: Dict[str, Any]) -> UserProfileResponse:
    """Retrieve full profile details of the authenticated user."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    user_obj_id = _to_object_id(current_user["id"])
    user_doc = None
    if user_obj_id:
        user_doc = db.users.find_one({"_id": user_obj_id})
    if not user_doc:
        user_doc = db.users.find_one({"_id": current_user["id"]})

    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return _format_user_profile_response(user_doc)


def update_my_profile(
    db: Database,
    current_user: Dict[str, Any],
    data: UpdateProfileRequest,
) -> UserProfileResponse:
    """Perform partial update on the authenticated customer's profile fields."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    user_obj_id = _to_object_id(current_user["id"])
    user_doc = None
    if user_obj_id:
        user_doc = db.users.find_one({"_id": user_obj_id})
    if not user_doc:
        user_doc = db.users.find_one({"_id": current_user["id"]})

    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing_profile = user_doc.get("profile")
    if not isinstance(existing_profile, dict):
        existing_profile = {}

    existing_address = existing_profile.get("address")
    if not isinstance(existing_address, dict):
        existing_address = {}

    now_utc = datetime.now(timezone.utc)
    update_dict: Dict[str, Any] = {"updated_at": now_utc}

    # Update address fields partially if provided
    if data.address is not None:
        if data.address.address_line is not None:
            existing_address["address_line"] = data.address.address_line
        if data.address.city is not None:
            existing_address["city"] = data.address.city
        if data.address.state is not None:
            existing_address["state"] = data.address.state
        if data.address.pincode is not None:
            existing_address["pincode"] = data.address.pincode
        update_dict["profile.address"] = existing_address

    # Update individual profile fields
    if data.full_name is not None:
        update_dict["profile.full_name"] = data.full_name
        update_dict["name"] = data.full_name  # synchronize top-level display name

    if data.date_of_birth is not None:
        update_dict["profile.date_of_birth"] = data.date_of_birth

    if data.gender is not None:
        update_dict["profile.gender"] = data.gender

    if data.relationship is not None:
        update_dict["profile.relationship"] = data.relationship
        if data.relationship == "other":
            update_dict["profile.relationship_other"] = data.relationship_other
        else:
            update_dict["profile.relationship_other"] = None

    if data.profile_image_url is not None:
        update_dict["profile.profile_image_url"] = data.profile_image_url

    if data.pan is not None:
        update_dict["profile.pan"] = data.pan

    if data.aadhar is not None:
        update_dict["profile.aadhar"] = data.aadhar

    if data.account_number is not None:
        update_dict["profile.account_number"] = data.account_number

    if data.ifsc is not None:
        update_dict["profile.ifsc"] = data.ifsc

    if data.nominee_name is not None:
        update_dict["profile.nominee_name"] = data.nominee_name

    if data.nominee_mobile is not None:
        update_dict["profile.nominee_mobile"] = data.nominee_mobile

    if data.nominee_dob is not None:
        update_dict["profile.nominee_dob"] = data.nominee_dob

    if data.nominee_address is not None:
        update_dict["profile.nominee_address"] = data.nominee_address

    # Save to MongoDB
    update_dict["profile_completed"] = True
    match_query = {"_id": user_obj_id} if user_obj_id else {"_id": current_user["id"]}
    db.users.update_one(match_query, {"$set": update_dict})

    updated_doc = db.users.find_one(match_query)
    return _format_user_profile_response(updated_doc)


def get_admin_users(
    db: Database,
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    kyc_status_filter: Optional[str] = None,
) -> AdminUserListResponse:
    """Retrieve paginated user list with search and filtering for Admin portal."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    query: Dict[str, Any] = {}

    if status_filter:
        query["account_status"] = status_filter.lower().strip()

    if kyc_status_filter:
        query["kyc_status"] = kyc_status_filter.lower().strip()

    if search and search.strip():
        search_pattern = re.escape(search.strip())
        search_regex = {"$regex": search_pattern, "$options": "i"}
        query["$or"] = [
            {"name": search_regex},
            {"mobile": search_regex},
            {"email": search_regex},
            {"profile.full_name": search_regex},
        ]

    safe_limit = max(1, min(limit, 100))
    safe_page = max(1, page)
    skip = (safe_page - 1) * safe_limit

    total = db.users.count_documents(query)
    total_pages = max(1, math.ceil(total / safe_limit))

    cursor = db.users.find(query).sort("created_at", -1).skip(skip).limit(safe_limit)

    items: List[AdminUserListItem] = []
    for doc in cursor:
        items.append(
            AdminUserListItem(
                user_id=str(doc["_id"]),
                name=doc.get("name", ""),
                mobile=doc.get("mobile", ""),
                email=doc.get("email"),
                role=doc.get("role", "customer"),
                account_status=doc.get("account_status", "active"),
                kyc_status=doc.get("kyc_status", "pending"),
                created_at=doc.get("created_at"),
            )
        )

    return AdminUserListResponse(
        items=items,
        page=safe_page,
        limit=safe_limit,
        total=total,
        total_pages=total_pages,
    )


def get_admin_user_detail(db: Database, user_id: str) -> AdminUserDetailResponse:
    """Retrieve comprehensive details of a specific user for Admin."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    user_obj_id = _to_object_id(user_id)
    doc = None
    if user_obj_id:
        doc = db.users.find_one({"_id": user_obj_id})
    if not doc:
        doc = db.users.find_one({"_id": user_id})

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return _format_admin_user_detail_response(doc)


def update_user_status_by_admin(
    db: Database,
    user_id: str,
    new_status: str,
    admin_user: Dict[str, Any],
) -> AdminUserStatusResponse:
    """Admin action: Update user account status (active, suspended, banned)."""
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database service unavailable")

    valid_statuses = ["active", "suspended", "banned"]
    cleaned_status = new_status.lower().strip()
    if cleaned_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
        )

    user_obj_id = _to_object_id(user_id)
    doc = None
    if user_obj_id:
        doc = db.users.find_one({"_id": user_obj_id})
    if not doc:
        doc = db.users.find_one({"_id": user_id})

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Safety guard: Cannot ban/modify another admin
    if doc.get("role") == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify another administrator account",
        )

    now_utc = datetime.now(timezone.utc)
    match_query = {"_id": user_obj_id} if user_obj_id else {"_id": user_id}

    db.users.update_one(
        match_query,
        {"$set": {"account_status": cleaned_status, "updated_at": now_utc}}
    )

    action_messages = {
        "banned": "User banned successfully",
        "suspended": "User suspended successfully",
        "active": "User status updated successfully",
    }

    return AdminUserStatusResponse(
        message=action_messages.get(cleaned_status, "User status updated successfully"),
        status=cleaned_status,
    )


def ban_user_by_admin(
    db: Database,
    user_id: str,
    admin_user: Dict[str, Any],
) -> AdminUserStatusResponse:
    """Admin action: Ban user account."""
    res = update_user_status_by_admin(db, user_id, "banned", admin_user)
    res.message = "User banned successfully"
    return res


def unban_user_by_admin(
    db: Database,
    user_id: str,
    admin_user: Dict[str, Any],
) -> AdminUserStatusResponse:
    """Admin action: Unban user account."""
    res = update_user_status_by_admin(db, user_id, "active", admin_user)
    res.message = "User unbanned successfully"
    return res
