from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Callable
from .database import get_db
from .security import verify_token
from ..models.user import UserProfile

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = verify_token(credentials.credentials)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user

# Role-based access control functions
def require_role(allowed_roles: List[str]) -> Callable:
    """Decorator factory to require specific roles for endpoint access"""
    def role_checker(current_user: UserProfile = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

def require_admin():
    """Require admin role"""
    return require_role(['admin'])

def require_manager_or_admin():
    """Require sales_manager or admin role"""
    return require_role(['admin', 'sales_manager'])

def require_sales_user():
    """Require any sales role (sales_rep, sales_manager, admin)"""
    return require_role(['admin', 'sales_manager', 'sales_rep'])

def require_any_authenticated():
    """Require any authenticated user"""
    return require_role(['admin', 'sales_manager', 'sales_rep', 'user'])

# Data ownership validation
def can_access_user_data(current_user: UserProfile, target_user_id: str) -> bool:
    """Check if current user can access another user's data"""
    if current_user.role == 'admin':
        return True
    if current_user.role == 'sales_manager':
        # TODO: Implement team membership check
        return True  # For now, allow managers to access all data
    return str(current_user.id) == target_user_id

def can_modify_user_data(current_user: UserProfile, target_user_id: str) -> bool:
    """Check if current user can modify another user's data"""
    if current_user.role == 'admin':
        return True
    if current_user.role == 'sales_manager':
        # TODO: Implement team membership check
        return True  # For now, allow managers to modify team data
    return str(current_user.id) == target_user_id

def validate_data_access(target_user_id: str):
    """Dependency to validate data access permissions"""
    def access_validator(current_user: UserProfile = Depends(get_current_user)):
        if not can_access_user_data(current_user, target_user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this resource"
            )
        return current_user
    return access_validator