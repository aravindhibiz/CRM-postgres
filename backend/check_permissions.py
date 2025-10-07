#!/usr/bin/env python3
"""
Quick script to check permissions in database
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.role import Role, Permission
from app.models.user import UserProfile

def check_permissions():
    db = SessionLocal()
    try:
        print("=" * 60)
        print("Database Permission Check")
        print("=" * 60)
        print()

        # Check all roles
        roles = db.query(Role).all()
        print(f"📋 Found {len(roles)} roles in database:")
        for role in roles:
            perm_count = len(role.permissions)
            print(f"  - {role.display_name} ({role.name}): {perm_count} permissions")
            if perm_count < 5:
                for perm in role.permissions:
                    print(f"    • {perm.name}")
        print()

        # Check all permissions
        permissions = db.query(Permission).all()
        print(f"🔐 Found {len(permissions)} permissions in database")
        print()

        # Check users
        users = db.query(UserProfile).all()
        print(f"👥 Found {len(users)} users in database:")
        for user in users:
            print(f"  - {user.email} (role: {user.role})")

            # Try to find their role and permissions
            role = db.query(Role).filter(Role.name == user.role).first()
            if role:
                print(f"    ✅ Role '{user.role}' exists with {len(role.permissions)} permissions")
                # Show first 5 permissions
                for perm in role.permissions[:5]:
                    print(f"       • {perm.name}")
                if len(role.permissions) > 5:
                    print(f"       ... and {len(role.permissions) - 5} more")
            else:
                print(f"    ❌ Role '{user.role}' NOT FOUND in roles table!")

        print()
        print("=" * 60)

    finally:
        db.close()

if __name__ == "__main__":
    check_permissions()
