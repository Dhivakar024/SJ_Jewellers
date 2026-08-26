from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class UserRegisterRequest(BaseModel):
    """Schema for user registration."""
    name: str = Field(..., min_length=1, max_length=100, description="Full name of the user")
    mobile: str = Field(..., min_length=7, max_length=20, description="Unique mobile number with country code")
    email: Optional[EmailStr] = Field(None, description="Optional email address")
    password: str = Field(..., min_length=8, description="Password (minimum 8 characters)")

    @field_validator("name", mode="before")
    @classmethod
    def clean_name(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Name cannot be empty")
        return v

    @field_validator("mobile", mode="before")
    @classmethod
    def clean_mobile(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Mobile cannot be empty")
        return v

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            v = v.strip().lower()
            if not v:
                return None
        return v


class SendOtpRequest(BaseModel):
    """Schema for requesting an OTP."""
    mobile: str = Field(..., min_length=7, max_length=20, description="Mobile number to receive OTP")

    @field_validator("mobile", mode="before")
    @classmethod
    def clean_mobile(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Mobile cannot be empty")
        return v


class SendOtpResponse(BaseModel):
    """Schema for OTP dispatch response."""
    message: str = "OTP sent successfully"
    mobile: str
    otp_length: int = 6


class VerifyOtpRequest(BaseModel):
    """Schema for verifying an OTP."""
    mobile: str = Field(..., min_length=7, max_length=20, description="Mobile number")
    otp: str = Field(..., min_length=4, max_length=10, description="One-time password")


class VerifyOtpResponse(BaseModel):
    """Schema for OTP verification response."""
    message: str = "OTP verified successfully"
    verified: bool = True


class UserLoginRequest(BaseModel):
    """Schema for user login using mobile/identifier and password."""
    mobile: Optional[str] = Field(None, description="Registered mobile number or username")
    identifier: Optional[str] = Field(None, description="Registered mobile number or username")
    password: str = Field(..., min_length=1, description="Account password")

    @model_validator(mode="before")
    @classmethod
    def validate_identifier(cls, values: Any) -> Any:
        if isinstance(values, dict):
            ident = values.get("mobile") or values.get("identifier") or values.get("username")
            if not ident or not str(ident).strip():
                raise ValueError("Mobile number or username is required")
            clean_ident = str(ident).strip()
            values["mobile"] = clean_ident
            values["identifier"] = clean_ident
        return values


class UserResponse(BaseModel):
    """Safe user profile response (password/hash never returned)."""
    id: str = Field(..., description="Unique user identifier")
    name: str
    mobile: str
    email: Optional[str] = None
    role: str
    account_status: str
    kyc_status: str
    profile_completed: bool = False
    created_at: Optional[datetime] = None


class RegisterResponse(BaseModel):
    """Response returned upon successful registration."""
    message: str = "Registration successful"
    access_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserResponse


class TokenResponse(BaseModel):
    """Response returned upon successful login containing JWT access token."""
    message: str = "Login successful"
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
