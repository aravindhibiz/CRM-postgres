from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime
import uuid


class CompanyBase(BaseModel):
    name: str
    industry: Optional[str] = None
    size: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    description: Optional[str] = None
    revenue: Optional[int] = None


class CompanyCreate(CompanyBase):
    custom_fields: Optional[Dict[str, Any]] = None


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    description: Optional[str] = None
    revenue: Optional[int] = None
    custom_fields: Optional[Dict[str, Any]] = None


class CompanyResponse(CompanyBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    custom_fields: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
