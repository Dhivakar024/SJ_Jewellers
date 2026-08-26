from datetime import datetime, timedelta, timezone
from typing import Tuple, Dict, Any, Optional
from bson import ObjectId
from pymongo.database import Database
from pymongo.errors import DuplicateKeyError
from fastapi import HTTPException, status

from app.config import settings
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
)
from app.utils.security import hash_password, verify_password, create_access_token

_indexes_initialized = False


def ensure_user_indexes(db: Database):
    """Ensure unique indexes for mobile and optional email are created on users collection."""
    global _indexes_initialized
    if _indexes_initialized or db is None:
        return
    try:
        # Unique index on mobile
        db.users.create_index("mobile", unique=True, name="uniq_mobile")
        
        # Unique index on email with partial filter for non-null/non-empty strings
        db.users.create_index(
            "email",
            unique=True,
            partialFilterExpression={"email": {"$type": "string", "$gt": ""}},
            name="uniq_email_partial"
        )

        # Ensure default system admin user exists
        admin_doc = db.users.find_one({"role": "admin"})
        if not admin_doc:
            now_utc = datetime.now(timezone.utc)
            db.users.insert_one({
                "name": "SJ Jewellers Admin",
                "mobile": "9999999999",
                "email": "admin@sjjewelers.com",
                "password_hash": hash_password("admin123"),
                "role": "admin",
                "account_status": "active",
                "kyc_status": "verified",
                "profile_completed": True,
                "created_at": now_utc,
                "updated_at": now_utc,
            })

        _indexes_initialized = True
    except Exception:
        # Non-fatal during startup; will retry on next operation
        pass


def _normalize_mobile(raw_mobile: str) -> Tuple[str, list]:
    """Helper to clean and get mobile search variants."""
    clean = (raw_mobile or "").strip()
    digits = "".join(filter(str.isdigit, clean))
    
    # Strip any redundant leading 91 or 0 prefixes while length > 10
    while len(digits) > 10:
        if digits.startswith("91"):
            digits = digits[2:]
        elif digits.startswith("0"):
            digits = digits[1:]
        else:
            break

    if len(digits) == 10:
        clean = digits

    variants = list(set([clean, f"+91{clean}", f"91{clean}", (raw_mobile or "").strip()]))
    return clean, variants




def register_user(db: Database, data: UserRegisterRequest) -> UserResponse:
    """Register a new customer account securely in MongoDB."""
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )
    
    ensure_user_indexes(db)
    clean_mobile, mobile_variants = _normalize_mobile(data.mobile)

    # Check for existing mobile
    if db.users.find_one({"mobile": {"$in": mobile_variants}}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number already registered",
        )

    # Check for existing email if provided
    if data.email:
        if db.users.find_one({"email": data.email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    now = datetime.now(timezone.utc)
    hashed_pwd = hash_password(data.password)

    user_doc = {
        "name": data.name,
        "mobile": clean_mobile,
        "email": data.email,
        "password_hash": hashed_pwd,
        "role": "customer",
        "account_status": "active",
        "kyc_status": "pending",
        "profile_completed": False,
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = db.users.insert_one(user_doc)
    except DuplicateKeyError as e:
        err_msg = str(e)
        if "email" in err_msg:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mobile number already registered")

    user_id = str(result.inserted_id)
    return UserResponse(
        id=user_id,
        name=user_doc["name"],
        mobile=user_doc["mobile"],
        email=user_doc["email"],
        role=user_doc["role"],
        account_status=user_doc["account_status"],
        kyc_status=user_doc["kyc_status"],
        profile_completed=False,
        created_at=user_doc["created_at"],
    )


def login_user(db: Database, data: UserLoginRequest) -> Tuple[UserResponse, str]:
    """Authenticate customer credentials and return user profile + JWT token."""
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    ensure_user_indexes(db)

    # Lookup user by mobile, mobile variants, email, or name
    raw_ident = (data.mobile or "").strip()
    clean_mobile, mobile_variants = _normalize_mobile(raw_ident)
    ident_variants = list(set([raw_ident, clean_mobile] + mobile_variants))

    query_conditions = [
        {"mobile": {"$in": ident_variants}},
        {"email": raw_ident.lower()},
        {"name": raw_ident},
    ]
    if raw_ident.lower() in ["admin", "administrator"]:
        query_conditions.append({"role": "admin"})

    query = {"$or": query_conditions}
    user_doc = db.users.find_one(query)
    
    # Generic error to prevent user enumeration
    if not user_doc or not verify_password(data.password, user_doc.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid mobile number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check account status
    account_status = user_doc.get("account_status", "active")
    if account_status == "banned":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been banned",
        )
    elif account_status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is currently suspended",
        )
    elif account_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is {account_status}. Please contact support.",
        )

    user_id = str(user_doc["_id"])
    token_payload = {
        "sub": user_id,
        "role": user_doc.get("role", "customer"),
        "mobile": user_doc.get("mobile"),
    }
    
    access_token = create_access_token(token_payload)

    # Check profile completion state
    profile_completed = user_doc.get("profile_completed", False)
    if not profile_completed:
        # Check if user profile is already populated with address and details
        prof = db.profiles.find_one({"user_id": user_id})
        if prof and prof.get("full_name") and prof.get("address"):
            profile_completed = True

    user_response = UserResponse(
        id=user_id,
        name=user_doc.get("name", ""),
        mobile=user_doc.get("mobile", ""),
        email=user_doc.get("email"),
        role=user_doc.get("role", "customer"),
        account_status=account_status,
        kyc_status=user_doc.get("kyc_status", "pending"),
        profile_completed=profile_completed,
        created_at=user_doc.get("created_at"),
    )

    return user_response, access_token


def format_user_response(user_doc: Dict[str, Any]) -> UserResponse:
    """Format raw MongoDB user document into a safe UserResponse schema."""
    return UserResponse(
        id=str(user_doc.get("_id", user_doc.get("id"))),
        name=user_doc.get("name", ""),
        mobile=user_doc.get("mobile", ""),
        email=user_doc.get("email"),
        role=user_doc.get("role", "customer"),
        account_status=user_doc.get("account_status", "active"),
        kyc_status=user_doc.get("kyc_status", "pending"),
        profile_completed=user_doc.get("profile_completed", False),
        created_at=user_doc.get("created_at"),
    )
