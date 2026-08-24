from datetime import datetime, date
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, model_validator, field_validator


class AddressProfileSchema(BaseModel):
    """Address subdocument for user profile."""
    address_line: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

    @field_validator("address_line", "city", "state", "pincode", mode="before")
    @classmethod
    def strip_str(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            v = v.strip()
            return v if v else None
        return v


class UserProfileData(BaseModel):
    """Complete profile subdocument structure."""
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    relationship: Optional[str] = None
    relationship_other: Optional[str] = None
    address: Optional[AddressProfileSchema] = None
    profile_image_url: Optional[str] = None


class UserProfileResponse(BaseModel):
    """Full user profile response for customer and admin."""
    user_id: str = Field(..., description="Unique user identifier")
    name: str
    mobile: str
    email: Optional[str] = None
    role: str
    account_status: str
    kyc_status: str
    profile: UserProfileData
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UpdateProfileRequest(BaseModel):
    """Payload for updating user profile fields partially."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    date_of_birth: Optional[str] = Field(None, description="Date of birth in YYYY-MM-DD format")
    gender: Optional[str] = Field(None, description="Gender: male, female, or other")
    relationship: Optional[str] = Field(None, description="Relationship: son, daughter, or other")
    relationship_other: Optional[str] = Field(None, description="Custom relationship name if relationship is 'other'")
    address: Optional[AddressProfileSchema] = None
    profile_image_url: Optional[str] = None

    @field_validator("full_name", "profile_image_url", mode="before")
    @classmethod
    def strip_text(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            v = v.strip()
            return v if v else None
        return v

    @field_validator("gender", mode="before")
    @classmethod
    def validate_gender(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            v = v.strip().lower()
            if not v:
                return None
            if v not in ["male", "female", "other"]:
                raise ValueError("Gender must be one of: male, female, other")
        return v

    @field_validator("relationship", mode="before")
    @classmethod
    def validate_relationship(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            v = v.strip().lower()
            if not v:
                return None
            if v not in ["son", "daughter", "other"]:
                raise ValueError("Relationship must be one of: son, daughter, other")
        return v

    @field_validator("date_of_birth", mode="before")
    @classmethod
    def validate_dob(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return None
            try:
                parsed_date = datetime.strptime(v, "%Y-%m-%d").date()
            except ValueError:
                raise ValueError("date_of_birth must follow YYYY-MM-DD format")
            
            if parsed_date > date.today():
                raise ValueError("date_of_birth cannot be in the future")
            return v
        return v

    @model_validator(mode="after")
    def validate_relationship_other(self):
        if self.relationship == "other":
            if not self.relationship_other or not self.relationship_other.strip():
                raise ValueError("relationship_other is required when relationship is 'other'")
            self.relationship_other = self.relationship_other.strip()
        elif self.relationship in ["son", "daughter"]:
            self.relationship_other = None
        return self
