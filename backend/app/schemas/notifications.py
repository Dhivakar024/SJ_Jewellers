from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class NotificationItem(BaseModel):
    """Normalized notification item."""
    notification_id: str
    recipient_type: str = Field(..., description="Recipient classification: 'customer' or 'admin'")
    recipient_id: str = Field(..., description="User ID of recipient")
    type: str = Field(..., description="Notification event type")
    title: str = Field(..., description="Headline title")
    message: str = Field(..., description="Notification body content")
    data: Dict[str, Any] = Field(default_factory=dict, description="Metadata and transaction payload")
    is_read: bool = False
    created_at: datetime
    read_at: Optional[datetime] = None


class NotificationListResponse(BaseModel):
    """Paginated list of notifications."""
    items: List[NotificationItem]
    page: int
    limit: int
    total: int
    total_pages: int


class UnreadCountResponse(BaseModel):
    """Unread notifications count summary."""
    unread_count: int


class MarkReadActionResponse(BaseModel):
    """Response returned when marking a single notification as read."""
    message: str = "Notification marked as read"
    notification_id: str
    is_read: bool = True
    read_at: Optional[datetime] = None


class MarkAllReadActionResponse(BaseModel):
    """Response returned when marking all notifications as read."""
    message: str = "All notifications marked as read"
    updated_count: int
