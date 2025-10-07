#!/usr/bin/env python3
"""
Test script to verify permissions are being loaded correctly
"""

from app.core.auth import get_user_permissions
from app.models.user import UserProfile
from app.models.role import Role, Permission
from app.core.database import SessionLocal
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def test_user_permissions():
    db = SessionLocal()
    try:
        print("=" * 60)
        print("Testing Permission Loading for Users")
        print("=" * 60)
        print()

        # Get the user with email tony@gmail.com
        user = db.query(UserProfile).filter(
            UserProfile.email == "tony@gmail.com").first()

        if not user:
            print("❌ User tony@gmail.com not found!")
            return

        print(f"✅ Found user: {user.email}")
        print(f"   Role: {user.role}")
        print()

        # Get their permissions using the same function the API uses
        permissions = get_user_permissions(db, user)

        print(
            f"📋 Permissions loaded by get_user_permissions(): {len(permissions)}")
        print()

        # Show all permissions
        print("Permissions list:")
        for i, perm in enumerate(permissions, 1):
            print(f"  {i}. {perm}")

        print()
        print("=" * 60)

        # Also check the role directly
        role = db.query(Role).filter(Role.name == user.role).first()
        if role:
            print(
                f"\n✅ Role '{role.display_name}' has {len(role.permissions)} permissions in database")
            print(f"   Active: {role.is_active}")

    finally:
        db.close()


if __name__ == "__main__":
    test_user_permissions()
