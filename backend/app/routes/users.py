from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import UserProfile
from ..schemas.user import UserResponse, UserUpdate

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    # Only admin users can get all users
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    users = db.query(UserProfile).all()
    return users


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: UserProfile = Depends(get_current_user)
):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    updates: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    # Update user fields
    update_data = updates.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    # Only admin users can get other users
    if current_user.role != 'admin' and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    updates: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    # Only admin users can update other users
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update user fields
    update_data = updates.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(user, field):
            setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
async def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user)
):
    # Only admin users can delete other users
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    # Don't allow deleting self
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
