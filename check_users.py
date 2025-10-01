#!/usr/bin/env python3
"""
Check what users exist in the database
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.core.database import get_db
from backend.app.models.user import UserProfile
from sqlalchemy.orm import Session

def check_users():
    db = next(get_db())
    users = db.query(UserProfile).all()
    
    print("Users in database:")
    for user in users:
        print(f"- Email: {user.email}, Role: {user.role}, Active: {user.is_active}")
    
    db.close()

if __name__ == "__main__":
    check_users()