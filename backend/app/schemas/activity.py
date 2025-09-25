from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
import uuid
from .user import UserResponse


class ActivityBase(BaseModel):
    type: str
    subject: str
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    outcome: Optional[str] = None


class ActivityCreate(ActivityBase):
    contact_id: Optional[uuid.UUID] = None
    deal_id: Optional[uuid.UUID] = None


class ActivityUpdate(BaseModel):
    type: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    outcome: Optional[str] = None
    contact_id: Optional[uuid.UUID] = None
    deal_id: Optional[uuid.UUID] = None


class ActivityResponse(ActivityBase):
    id: uuid.UUID
    contact_id: Optional[uuid.UUID] = None
    deal_id: Optional[uuid.UUID] = None
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ActivityWithRelations(ActivityResponse):
    contact: Optional[Any] = None
    deal: Optional[Any] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True
