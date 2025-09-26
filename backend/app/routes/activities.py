from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from uuid import UUID
from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import UserProfile
from ..models.activity import Activity
from ..schemas.activity import ActivityCreate, ActivityUpdate, ActivityResponse, ActivityWithRelations

router = APIRouter()


@router.get("/", response_model=List[ActivityResponse])
async def get_user_activities(
    limit: int = Query(50, description="Limit number of activities returned"),
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    activities = db.query(Activity).order_by(
        Activity.created_at.desc()).limit(limit).all()

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

    return activity


@router.post("/", response_model=ActivityResponse)
async def create_activity(
    activity_data: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    db_activity = Activity(
        **activity_data.dict(),
        user_id=current_user.id
    )

    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)

    return db_activity


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

    # Update activity fields
    update_data = activity_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(activity, field, value)

    db.commit()
    db.refresh(activity)

    return activity


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
