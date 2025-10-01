"""
Test SystemConfigBulkUpdateRequest schema directly
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.schemas.system_config import SystemConfigBulkUpdateRequest, SystemConfigBulkUpdateItem
from pydantic import ValidationError
import json

# Test data that matches what the frontend is sending
test_data = {
    "configurations": [
        {"key": "general.time_format", "value": "24"},
        {"key": "general.company_name", "value": "Test Company"}
    ]
}

def test_schema():
    print("Testing SystemConfigBulkUpdateRequest schema...")
    print(f"Test data: {json.dumps(test_data, indent=2)}")
    
    try:
        # Test the individual item schema first
        item_data = {"key": "general.time_format", "value": "24"}
        item = SystemConfigBulkUpdateItem(**item_data)
        print(f"✅ SystemConfigBulkUpdateItem validation successful: {item}")
        
        # Test the full request schema
        request = SystemConfigBulkUpdateRequest(**test_data)
        print(f"✅ SystemConfigBulkUpdateRequest validation successful: {request}")
        print(f"Configurations count: {len(request.configurations)}")
        
        # Test access to individual fields
        for config in request.configurations:
            print(f"  - {config.key} = {config.value} (type: {type(config.value)})")
            
    except ValidationError as e:
        print(f"❌ Validation error: {e}")
        print(f"Error details: {json.dumps(e.errors(), indent=2)}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_schema()