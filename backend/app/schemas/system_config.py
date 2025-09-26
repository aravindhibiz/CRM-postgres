from pydantic import BaseModel
from typing import Any, Dict, Optional
from datetime import datetime
import uuid


class SystemConfigBase(BaseModel):
    key: str
    value: Any
    category: str
    description: Optional[str] = None


class SystemConfigCreate(SystemConfigBase):
    pass


class SystemConfigUpdate(BaseModel):
    value: Any
    description: Optional[str] = None


class SystemConfigResponse(SystemConfigBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SystemConfigBulkUpdate(BaseModel):
    configurations: Dict[str, Any]
