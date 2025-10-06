from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from uuid import UUID
from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import UserProfile
from ..models.activity import Activity
from ..models.custom_field import EntityType
from ..schemas.activity import ActivityCreate, ActivityUpdate, ActivityResponse, ActivityWithRelations
from ..services.custom_field_service import CustomFieldService

router = APIRouter()


@router.get("/", response_model=List[ActivityResponse])
async def get_user_activities(
    limit: int = Query(50, description="Limit number of activities returned"),
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    activities = db.query(Activity).options(
        joinedload(Activity.contact),
        joinedload(Activity.deal),
        joinedload(Activity.user)
    ).order_by(Activity.created_at.desc()).limit(limit).all()

    return activities


@router.get("/{activity_id}", response_model=ActivityWithRelations)
async def get_activity_by_id(
    activity_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    activity = db.query(Activity).options(
        joinedload(Activity.contact),
        joinedload(Activity.deal),
        joinedload(Activity.user)
    ).filter(Activity.id == activity_id).first()

    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )

    # Get custom fields for the activity
    custom_fields_dict = CustomFieldService.get_entity_custom_fields_dict(
        db=db,
        entity_id=str(activity.id),
        entity_type=EntityType.ACTIVITY
    )

    # Build response with custom fields
    response_data = {
        "id": activity.id,
        "type": activity.type,
        "subject": activity.subject,
        "description": activity.description,
        "duration_minutes": activity.duration_minutes,
        "outcome": activity.outcome,
        "contact_id": activity.contact_id,
        "deal_id": activity.deal_id,
        "user_id": activity.user_id,
        "created_at": activity.created_at,
        "updated_at": activity.updated_at,
        "custom_fields": custom_fields_dict if custom_fields_dict else None,
        "contact": activity.contact,
        "deal": activity.deal,
        "user": activity.user
    }

    return response_data


@router.post("/", response_model=ActivityResponse)
async def create_activity(
    activity_data: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    try:
        # Extract custom fields before creating activity
        custom_fields_data = activity_data.custom_fields or {}

        # Create activity
        activity_dict = activity_data.dict(exclude={'custom_fields'})
        db_activity = Activity(
            **activity_dict,
            user_id=current_user.id
        )

        db.add(db_activity)
        db.commit()
        db.refresh(db_activity)

        # Save custom field values if provided
        if custom_fields_data:
            CustomFieldService.save_custom_field_values(
                db=db,
                entity_id=str(db_activity.id),
                entity_type=EntityType.ACTIVITY,
                field_values=custom_fields_data
            )
            db.commit()

        # Get custom fields for response
        custom_fields_dict = CustomFieldService.get_entity_custom_fields_dict(
            db=db,
            entity_id=str(db_activity.id),
            entity_type=EntityType.ACTIVITY
        )

        # Build response with custom fields
        response_data = {
            "id": db_activity.id,
            "type": db_activity.type,
            "subject": db_activity.subject,
            "description": db_activity.description,
            "duration_minutes": db_activity.duration_minutes,
            "outcome": db_activity.outcome,
            "contact_id": db_activity.contact_id,
            "deal_id": db_activity.deal_id,
            "user_id": db_activity.user_id,
            "created_at": db_activity.created_at,
            "updated_at": db_activity.updated_at,
            "custom_fields": custom_fields_dict if custom_fields_dict else None
        }

        return response_data
    except Exception as e:
        db.rollback()
        raise e


@router.put("/{activity_id}", response_model=ActivityResponse)
async def update_activity(
    activity_id: UUID,
    activity_data: ActivityUpdate,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    activity = db.query(Activity).filter(
        Activity.id == activity_id
    ).first()

    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )

    try:
        # Extract custom fields
        custom_fields_data = activity_data.custom_fields

        # Update activity fields
        update_data = activity_data.dict(
            exclude_unset=True, exclude={'custom_fields'})
        for field, value in update_data.items():
            setattr(activity, field, value)

        db.commit()
        db.refresh(activity)

        # Update custom field values if provided
        if custom_fields_data is not None:
            CustomFieldService.save_custom_field_values(
                db=db,
                entity_id=str(activity.id),
                entity_type=EntityType.ACTIVITY,
                field_values=custom_fields_data
            )
            db.commit()

        # Get custom fields for response
        custom_fields_dict = CustomFieldService.get_entity_custom_fields_dict(
            db=db,
            entity_id=str(activity.id),
            entity_type=EntityType.ACTIVITY
        )

        # Build response with custom fields
        response_data = {
            "id": activity.id,
            "type": activity.type,
            "subject": activity.subject,
            "description": activity.description,
            "duration_minutes": activity.duration_minutes,
            "outcome": activity.outcome,
            "contact_id": activity.contact_id,
            "deal_id": activity.deal_id,
            "user_id": activity.user_id,
            "created_at": activity.created_at,
            "updated_at": activity.updated_at,
            "custom_fields": custom_fields_dict if custom_fields_dict else None
        }

        return response_data
    except Exception as e:
        db.rollback()
        raise e


@router.delete("/{activity_id}")
async def delete_activity(
    activity_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    activity = db.query(Activity).filter(
        Activity.id == activity_id
    ).first()

    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )

    db.delete(activity)
    db.commit()

    return {"message": "Activity deleted successfully"}
