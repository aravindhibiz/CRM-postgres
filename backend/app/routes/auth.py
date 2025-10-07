from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List, Dict
from ..core.database import get_db
from ..core.security import create_access_token, verify_password, get_password_hash
from ..core.config import settings
from ..core.auth import get_current_user, get_user_permissions
from ..models.user import UserProfile
from ..schemas.user import UserCreate, UserLogin, Token, UserResponse

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(UserProfile).filter(
        UserProfile.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = UserProfile(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        phone=user.phone,
        hashed_password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create access token
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id)}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(db_user)
    }


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    # Find user
    user = db.query(UserProfile).filter(
        UserProfile.email == user_credentials.email).first()
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact your administrator.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)
    }


@router.get("/me/permissions")
async def get_my_permissions(
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's permissions based on their role"""
    permissions = get_user_permissions(db, current_user)

    # Organize permissions by category for easier frontend consumption
    permissions_by_category = {}
    for perm in permissions:
        parts = perm.split('.')
        if len(parts) == 2:
            category, action = parts
            if category not in permissions_by_category:
                permissions_by_category[category] = []
            permissions_by_category[category].append(action)

    return {
        "permissions": permissions,
        "permissions_by_category": permissions_by_category,
        "role": current_user.role
    }
