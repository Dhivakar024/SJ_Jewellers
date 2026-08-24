from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


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


class UserLoginRequest(BaseModel):
    """Schema for user login using mobile and password."""
    mobile: str = Field(..., min_length=1, description="Registered mobile number")
    password: str = Field(..., min_length=1, description="Account password")

    @field_validator("mobile", mode="before")
    @classmethod
    def clean_mobile(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v


class UserResponse(BaseModel):
    """Safe user profile response (password/hash never returned)."""
    id: str = Field(..., description="Unique user identifier")
    name: str
    mobile: str
    email: Optional[str] = None
    role: str
    account_status: str
    kyc_status: str
    created_at: Optional[datetime] = None


class RegisterResponse(BaseModel):
    """Response returned upon successful registration."""
    message: str = "Registration successful"
    user: UserResponse


class TokenResponse(BaseModel):
    """Response returned upon successful login containing JWT access token."""
    message: str = "Login successful"
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
