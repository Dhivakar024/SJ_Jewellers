from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from pymongo.database import Database

from app.database.connection import get_database
from app.schemas.profile import UserProfileResponse, UpdateProfileRequest
from app.services.user_service import get_my_profile, update_my_profile
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/profile", tags=["User Profile"])


@router.get(
    "/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user's profile",
    description="Retrieves the complete profile for the authenticated customer including personal details, address, and KYC status.",
)
async def get_profile(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to view personal profile."""
    return get_my_profile(db, current_user)


@router.patch(
    "/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Update current user's profile",
    description="Updates personal profile fields partially (full name, date of birth, gender, relationship, address, image URL). Rejects mobile, email, or role modifications.",
)
async def update_profile(
    data: UpdateProfileRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to partially update profile."""
    return update_my_profile(db, current_user, data)
