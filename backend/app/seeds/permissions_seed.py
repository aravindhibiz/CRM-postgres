"""
Permission Seeder Script
This script populates the permissions and roles tables with all application permissions
Run this script to initialize or reset the permission system
"""

from sqlalchemy.orm import Session
from ..core.database import SessionLocal

# Import all models to ensure they're registered with SQLAlchemy
# This prevents the "failed to locate a name" error
import app.models  # This imports all models from __init__.py
from ..models.role import Role, Permission


def get_all_permissions():
    """Define all application permissions organized by category"""
    return [
        # Dashboard & Analytics Permissions
        {"name": "dashboard.view_stats", "display_name": "View Dashboard Statistics",
            "description": "View dashboard overview and statistics", "category": "Dashboard"},
        {"name": "dashboard.filter", "display_name": "Filter Dashboard Data",
            "description": "Apply filters to dashboard data", "category": "Dashboard"},
        {"name": "dashboard.pipeline_drag_drop", "display_name": "Drag & Drop Pipeline",
            "description": "Drag and drop deals in sales pipeline", "category": "Dashboard"},
        {"name": "dashboard.pipeline_view", "display_name": "View Pipeline",
            "description": "View sales pipeline Kanban board", "category": "Dashboard"},

        {"name": "analytics.view_personal", "display_name": "View Personal Analytics",
            "description": "View own analytics and reports", "category": "Analytics"},
        {"name": "analytics.view_team", "display_name": "View Team Analytics",
            "description": "View team analytics and reports", "category": "Analytics"},
        {"name": "analytics.view_company", "display_name": "View Company Analytics",
            "description": "View company-wide analytics", "category": "Analytics"},
        {"name": "analytics.export", "display_name": "Export Analytics Reports",
            "description": "Export analytics reports and data", "category": "Analytics"},

        # Deal Permissions
        {"name": "deals.view_all", "display_name": "View All Deals",
            "description": "View all deals in the system", "category": "Deals"},
        {"name": "deals.view_own", "display_name": "View Own Deals",
            "description": "View only own deals", "category": "Deals"},
        {"name": "deals.create", "display_name": "Create Deals",
            "description": "Create new deals", "category": "Deals"},
        {"name": "deals.edit_all", "display_name": "Edit All Deals",
            "description": "Edit any deal in the system", "category": "Deals"},
        {"name": "deals.edit_own", "display_name": "Edit Own Deals",
            "description": "Edit only own deals", "category": "Deals"},
        {"name": "deals.delete_all", "display_name": "Delete All Deals",
            "description": "Delete any deal", "category": "Deals"},
        {"name": "deals.delete_own", "display_name": "Delete Own Deals",
            "description": "Delete only own deals", "category": "Deals"},
        {"name": "deals.move_stages", "display_name": "Move Pipeline Stages",
            "description": "Move deals between pipeline stages", "category": "Deals"},

        # Contact Permissions
        {"name": "contacts.view_all", "display_name": "View All Contacts",
            "description": "View all contacts in the system", "category": "Contacts"},
        {"name": "contacts.view_own", "display_name": "View Own Contacts",
            "description": "View only own contacts", "category": "Contacts"},
        {"name": "contacts.create", "display_name": "Create Contacts",
            "description": "Create new contacts", "category": "Contacts"},
        {"name": "contacts.edit_all", "display_name": "Edit All Contacts",
            "description": "Edit any contact", "category": "Contacts"},
        {"name": "contacts.edit_own", "display_name": "Edit Own Contacts",
            "description": "Edit only own contacts", "category": "Contacts"},
        {"name": "contacts.delete_all", "display_name": "Delete All Contacts",
            "description": "Delete any contact", "category": "Contacts"},
        {"name": "contacts.delete_own", "display_name": "Delete Own Contacts",
            "description": "Delete only own contacts", "category": "Contacts"},
        {"name": "contacts.import", "display_name": "Import Contacts",
            "description": "Import contacts from CSV/Excel", "category": "Contacts"},
        {"name": "contacts.export", "display_name": "Export Contacts",
            "description": "Export contacts to CSV/Excel", "category": "Contacts"},

        # Activity Permissions
        {"name": "activities.view_all", "display_name": "View All Activities",
            "description": "View all activities in the system", "category": "Activities"},
        {"name": "activities.view_own", "display_name": "View Own Activities",
            "description": "View only activities for own contacts", "category": "Activities"},
        {"name": "activities.create_all", "display_name": "Create Activity for Any Contact",
            "description": "Create activities for any contact", "category": "Activities"},
        {"name": "activities.create_own", "display_name": "Create Activity for Own Contacts",
            "description": "Create activities for own contacts only", "category": "Activities"},
        {"name": "activities.edit_all", "display_name": "Edit All Activities",
            "description": "Edit any activity", "category": "Activities"},
        {"name": "activities.edit_own", "display_name": "Edit Own Activities",
            "description": "Edit activities for own contacts only", "category": "Activities"},
        {"name": "activities.delete_all", "display_name": "Delete All Activities",
            "description": "Delete any activity", "category": "Activities"},
        {"name": "activities.delete_own", "display_name": "Delete Own Activities",
            "description": "Delete activities for own contacts only", "category": "Activities"},
        {"name": "activities.export", "display_name": "Export Activities",
            "description": "Export activity data", "category": "Activities"},

        # Settings Permissions
        {"name": "settings.user_management", "display_name": "User Management",
            "description": "Manage users, roles and status", "category": "Settings"},
        {"name": "settings.permissions", "display_name": "Manage Permissions",
            "description": "Configure role-based permissions", "category": "Settings"},
        {"name": "settings.integrations", "display_name": "Manage Integrations",
            "description": "Configure API connections and services", "category": "Settings"},
        {"name": "settings.custom_fields", "display_name": "Manage Custom Fields",
            "description": "Create and configure custom fields", "category": "Settings"},
        {"name": "settings.email_templates", "display_name": "Manage Email Templates",
            "description": "Create and edit email templates", "category": "Settings"},
        {"name": "settings.system_config", "display_name": "System Configuration",
            "description": "Access general system settings", "category": "Settings"},
        {"name": "settings.view_profile", "display_name": "View Own Profile",
            "description": "View own profile settings", "category": "Settings"},
        {"name": "settings.edit_profile", "display_name": "Edit Own Profile",
            "description": "Edit own profile settings", "category": "Settings"},
    ]


def get_default_role_permissions():
    """Define default permissions for each role"""
    # Get ALL permission names for admin
    all_permission_names = [p["name"] for p in get_all_permissions()]

    return {
        "admin": all_permission_names,  # Admin gets EVERY permission
        "sales_manager": [
            # Sales Manager gets most permissions except system config and permissions management
            "dashboard.view_stats", "dashboard.filter", "dashboard.pipeline_drag_drop", "dashboard.pipeline_view",
            "analytics.view_personal", "analytics.view_team", "analytics.export",
            "deals.view_all", "deals.view_own", "deals.create", "deals.edit_all", "deals.edit_own", "deals.delete_all", "deals.delete_own", "deals.move_stages",
            "contacts.view_all", "contacts.view_own", "contacts.create", "contacts.edit_all", "contacts.edit_own", "contacts.delete_all", "contacts.delete_own", "contacts.import", "contacts.export",
            "activities.view_all", "activities.view_own", "activities.create_all", "activities.create_own", "activities.edit_all", "activities.edit_own", "activities.delete_all", "activities.delete_own", "activities.export",
            "settings.user_management", "settings.integrations", "settings.custom_fields", "settings.email_templates",
            "settings.view_profile", "settings.edit_profile"
        ],
        "sales_rep": [
            # Sales Rep can work with own data and create/edit
            "dashboard.view_stats", "dashboard.filter", "dashboard.pipeline_view",
            "analytics.view_personal",
            "deals.view_own", "deals.create", "deals.edit_own", "deals.move_stages",
            "contacts.view_own", "contacts.create", "contacts.edit_own",
            "activities.view_own", "activities.create_own", "activities.edit_own", "activities.delete_own",
            "settings.email_templates", "settings.view_profile", "settings.edit_profile"
        ],
        "user": [
            # User has minimal permissions - view only
            "dashboard.view_stats", "dashboard.pipeline_view",
            "deals.view_own",
            "contacts.view_own",
            "activities.view_own",
            "settings.view_profile", "settings.edit_profile"
        ]
    }


def seed_permissions(db: Session):
    """Seed all permissions into the database"""
    print("Seeding permissions...")

    permissions_data = get_all_permissions()
    created_count = 0
    updated_count = 0

    for perm_data in permissions_data:
        # Check if permission already exists
        existing_perm = db.query(Permission).filter(
            Permission.name == perm_data["name"]).first()

        if existing_perm:
            # Update existing permission
            existing_perm.display_name = perm_data["display_name"]
            existing_perm.description = perm_data["description"]
            existing_perm.category = perm_data["category"]
            existing_perm.is_active = True
            updated_count += 1
        else:
            # Create new permission
            new_perm = Permission(**perm_data, is_active=True)
            db.add(new_perm)
            created_count += 1

    db.commit()
    print(
        f"Permissions seeded: {created_count} created, {updated_count} updated")


def seed_roles(db: Session):
    """Seed default roles and assign permissions"""
    print("Seeding roles...")

    roles_data = [
        {"name": "admin", "display_name": "Admin",
            "description": "Full system access"},
        {"name": "sales_manager", "display_name": "Sales Manager",
            "description": "Manage team and sales operations"},
        {"name": "sales_rep", "display_name": "Sales Rep",
            "description": "Sales representative with limited access"},
        {"name": "user", "display_name": "User",
            "description": "Basic user with view-only access"}
    ]

    role_permissions = get_default_role_permissions()

    for role_data in roles_data:
        # Check if role already exists
        existing_role = db.query(Role).filter(
            Role.name == role_data["name"]).first()

        if existing_role:
            role = existing_role
            role.display_name = role_data["display_name"]
            role.description = role_data["description"]
            print(f"Updated role: {role.name}")
        else:
            role = Role(**role_data, is_active=True)
            db.add(role)
            db.flush()  # Flush to get the role ID
            print(f"Created role: {role.name}")

        # Assign permissions to role
        permission_names = role_permissions.get(role_data["name"], [])
        permissions = db.query(Permission).filter(
            Permission.name.in_(permission_names)).all()

        # Clear existing permissions and add new ones
        role.permissions.clear()
        role.permissions.extend(permissions)

        print(
            f"Assigned {len(permissions)} permissions to {role.display_name}")

    db.commit()
    print("Roles seeded successfully")


def run_seed():
    """Run the complete seeding process"""
    db = SessionLocal()
    try:
        print("Starting permission and role seeding...")
        seed_permissions(db)
        seed_roles(db)
        print("Seeding completed successfully!")
    except Exception as e:
        print(f"Error during seeding: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
