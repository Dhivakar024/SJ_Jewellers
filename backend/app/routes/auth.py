from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from pymongo.database import Database

from app.database.connection import get_database
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    UserResponse,
    RegisterResponse,
    TokenResponse,
)
from app.services.auth_service import (
    register_user,
    login_user,
    send_otp,
    verify_otp,
    format_user_response,
)
from app.utils.security import get_current_user, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/send-otp",
    response_model=SendOtpResponse,
    status_code=status.HTTP_200_OK,
    summary="Send OTP to mobile number",
    description="Validates mobile number existence for signup/login purposes and sends/generates OTP.",
)
async def send_otp_endpoint(data: SendOtpRequest, db: Database = Depends(get_database)):
    """Send OTP code for signup, login, or password recovery."""
    return send_otp(db, data)


@router.post(
    "/verify-otp",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify OTP and obtain JWT token",
    description="Validates OTP code, creates new customer user account if signing up, and returns signed JWT access token.",
)
async def verify_otp_endpoint(data: VerifyOtpRequest, db: Database = Depends(get_database)):
    """Verify OTP and authenticate user session."""
    user, access_token = verify_otp(db, data)
    return TokenResponse(
        message="OTP verification successful",
        access_token=access_token,
        token_type="bearer",
        user=user,
    )


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new customer",
    description="Creates a new customer account in the users collection with password securely hashed via Argon2.",
)
async def register(data: UserRegisterRequest, db: Database = Depends(get_database)):
    """Register a new customer account."""
    user = register_user(db, data)
    token_payload = {
        "sub": user.id,
        "role": user.role,
        "mobile": user.mobile,
    }
    access_token = create_access_token(token_payload)
    return RegisterResponse(
        message="Registration successful",
        access_token=access_token,
        token_type="bearer",
        user=user,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with mobile and password",
    description="Authenticates customer credentials and returns a signed JWT Bearer access token.",
)
async def login(data: UserLoginRequest, db: Database = Depends(get_database)):
    """Authenticate and obtain JWT access token."""
    user, access_token = login_user(db, data)
    return TokenResponse(
        message="Login successful",
        access_token=access_token,
        token_type="bearer",
        user=user,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user profile",
    description="Retrieves the profile of the currently logged-in user using the Bearer access token.",
)
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve profile of authenticated user."""
    return format_user_response(current_user)
