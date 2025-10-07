#!/usr/bin/env python3
"""
Script to fix all role-based filtering to use permission-based filtering
"""

import re

deals_file = r"D:\CRM-postgres\backend\app\routes\deals.py"

# Read the file
with open(deals_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match the role-based filtering blocks
role_based_pattern = r'''    # Role-based filtering.*?
    if current_user\.role == 'admin':
        # Admin can see all deals
        pass
    elif current_user\.role == 'sales_manager':
        # Manager can see all deals.*?
        pass
    else:
        # Sales reps and users can only see their own deals
        query = query\.filter\(Deal\.owner_id == current_user\.id\)'''

# Replacement text
replacement = '''    # Permission-based filtering using helper function
    from ..core.auth_helpers import get_deals_query_filter
    query = get_deals_query_filter(db, current_user, query)'''

# Replace all occurrences
content_fixed = re.sub(role_based_pattern, replacement,
                       content, flags=re.DOTALL)

# Also fix the individual deal access pattern
individual_pattern = r'''    # Role-based filtering for individual deal access
    if current_user\.role == 'admin':
        # Admin can see any deal
        pass
    elif current_user\.role == 'sales_manager':
        # Manager can see any deal.*?
        pass
    else:
        # Sales reps and users can only see their own deals
        query = query\.filter\(Deal\.owner_id == current_user\.id\)'''

replacement_individual = '''    # Permission-based filtering using helper function
    from ..core.auth_helpers import get_deals_query_filter
    query = get_deals_query_filter(db, current_user, query)'''

content_fixed = re.sub(
    individual_pattern, replacement_individual, content_fixed, flags=re.DOTALL)

# Fix owner_id filter condition
owner_filter_pattern = r"if owner_id and current_user\.role in \['admin', 'sales_manager'\]:"
owner_filter_replacement = r"from ..core.auth import has_permission\n    if owner_id and has_permission(db, current_user, \"deals.view_all\"):"

# Count how many times this pattern appears
import_added = False
lines = content_fixed.split('\n')
fixed_lines = []

for line in lines:
    if "if owner_id and current_user.role in ['admin', 'sales_manager']:" in line:
        if not import_added:
            fixed_lines.append("    from ..core.auth import has_permission")
            import_added = True
        fixed_lines.append(line.replace(
            "if owner_id and current_user.role in ['admin', 'sales_manager']:",
            "if owner_id and has_permission(db, current_user, \"deals.view_all\"):"
        ))
    else:
        fixed_lines.append(line)

content_fixed = '\n'.join(fixed_lines)

# Write back
with open(deals_file, 'w', encoding='utf-8') as f:
    f.write(content_fixed)

print("✅ Fixed deals.py - replaced role-based filtering with permission-based filtering")
print(f"   Total lines: {len(fixed_lines)}")
