from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Path, Query, status
from pymongo.database import Database

from app.database.connection import get_database
from app.schemas.notifications import (
    NotificationItem,
    NotificationListResponse,
    UnreadCountResponse,
    MarkReadActionResponse,
    MarkAllReadActionResponse,
)
from app.services.notification_service import (
    get_user_notifications,
    get_unread_notification_count,
    get_single_notification,
    mark_notification_as_read,
    mark_all_notifications_as_read,
)
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=NotificationListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get customer notifications list",
    description="Retrieves a paginated list of notifications belonging strictly to the authenticated customer, sorted newest first. Supports filtering by type, read state, and date range.",
)
async def list_customer_notifications(
    type: Optional[str] = Query(None, description="Filter by notification type"),
    is_read: Optional[bool] = Query(None, description="Filter by read state (true/false)"),
    from_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to view notifications."""
    return get_user_notifications(
        db=db,
        user_id=current_user["id"],
        recipient_type="customer",
        notif_type=type,
        is_read=is_read,
        from_date=from_date,
        to_date=to_date,
        page=page,
        limit=limit,
    )


@router.get(
    "/unread-count",
    response_model=UnreadCountResponse,
    status_code=status.HTTP_200_OK,
    summary="Get customer unread notification count",
    description="Returns the total number of unread notifications for badge indicators.",
)
async def get_customer_unread_count(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to get unread notification count."""
    count = get_unread_notification_count(
        db=db,
        user_id=current_user["id"],
        recipient_type="customer",
    )
    return UnreadCountResponse(unread_count=count)


@router.get(
    "/{notification_id}",
    response_model=NotificationItem,
    status_code=status.HTTP_200_OK,
    summary="Get single notification details",
    description="Retrieves full details of a specific notification belonging to the authenticated customer.",
)
async def get_notification_detail(
    notification_id: str = Path(..., description="Notification ID to inspect"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to inspect a single notification."""
    return get_single_notification(
        db=db,
        notification_id=notification_id,
        user_id=current_user["id"],
        recipient_type="customer",
    )


@router.patch(
    "/{notification_id}/read",
    response_model=MarkReadActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Mark single notification as read",
    description="Updates the notification read status to true and stamps the read timestamp.",
)
async def mark_single_notification_read(
    notification_id: str = Path(..., description="Notification ID to mark as read"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to mark single notification as read."""
    return mark_notification_as_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user["id"],
        recipient_type="customer",
    )


@router.patch(
    "/read-all",
    response_model=MarkAllReadActionResponse,
    status_code=status.HTTP_200_OK,
    summary="Mark all customer notifications as read",
    description="Marks all unread notifications belonging to the authenticated customer as read.",
)
async def mark_all_customer_notifications_read(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Database = Depends(get_database),
):
    """Customer endpoint to mark all notifications as read."""
    updated = mark_all_notifications_as_read(
        db=db,
        user_id=current_user["id"],
        recipient_type="customer",
    )
    return MarkAllReadActionResponse(
        message="All notifications marked as read",
        updated_count=updated,
    )
