from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import UserProfile
from ..models.system_config import SystemConfiguration
from ..schemas.system_config import SystemConfigResponse, SystemConfigBulkUpdate

router = APIRouter()


@router.get("/", response_model=List[SystemConfigResponse])
async def get_all_configurations(
    category: str = None,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    # Only admin users can access system configuration
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    query = db.query(SystemConfiguration).filter(
        SystemConfiguration.is_active == True)

    if category:
        query = query.filter(SystemConfiguration.category == category)

    configurations = query.all()
    return configurations


@router.get("/grouped", response_model=Dict[str, Dict[str, Any]])
async def get_configurations_grouped(
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    # Only admin users can access system configuration
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    configurations = db.query(SystemConfiguration).filter(
        SystemConfiguration.is_active == True
    ).all()

    grouped = {}
    for config in configurations:
        if config.category not in grouped:
            grouped[config.category] = {}
        grouped[config.category][config.key] = config.value

    return grouped


@router.put("/bulk", response_model=Dict[str, str])
async def update_configurations_bulk(
    updates: SystemConfigBulkUpdate,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    # Only admin users can update system configuration
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    for key, value in updates.configurations.items():
        config = db.query(SystemConfiguration).filter(
            SystemConfiguration.key == key,
            SystemConfiguration.is_active == True
        ).first()

        if config:
            config.value = value
        else:
            # Create new configuration if it doesn't exist
            # Determine category from key prefix
            category = "general"
            if key.startswith("sales_"):
                category = "sales"
            elif key.startswith("notification_"):
                category = "notifications"
            elif key.startswith("security_"):
                category = "security"
            elif key.startswith("backup_"):
                category = "backup"

            new_config = SystemConfiguration(
                key=key,
                value=value,
                category=category,
                description=f"Configuration for {key}"
            )
            db.add(new_config)

    db.commit()
    return {"message": "Configuration updated successfully"}


@router.get("/export", response_model=Dict[str, Any])
async def export_configuration(
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    # Only admin users can export configuration
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    configurations = db.query(SystemConfiguration).filter(
        SystemConfiguration.is_active == True
    ).all()

    export_data = {
        "export_timestamp": "2024-01-15T10:30:00Z",
        "version": "1.0",
        "configurations": {}
    }

    for config in configurations:
        if config.category not in export_data["configurations"]:
            export_data["configurations"][config.category] = {}
        export_data["configurations"][config.category][config.key] = config.value

    return export_data
