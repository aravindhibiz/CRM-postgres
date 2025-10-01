#!/usr/bin/env python3
"""
Test the SystemConfigBulkUpdateRequest schema directly with FastAPI
"""
from pydantic import ValidationError
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.schemas.system_config import SystemConfigBulkUpdateRequest, SystemConfigBulkUpdateItem

# Test data that matches what we're sending
test_data = {
    "configurations": [
        {"key": "general.company_name", "value": "Test Company Updated"},
        {"key": "general.time_format", "value": "24"},
        {"key": "general.default_currency", "value": "USD"}
    ]
}

print("Testing SystemConfigBulkUpdateRequest schema with actual request data...")
print(f"Test data: {test_data}")

try:
    # This should work if our schema is correct
    request = SystemConfigBulkUpdateRequest(**test_data)
    print("✅ Schema validation successful!")
    print(f"Parsed request: {request}")
    print(f"Configurations count: {len(request.configurations)}")
    for i, config in enumerate(request.configurations):
        print(f"  {i+1}. {config.key} = {config.value} (type: {type(config.value)})")
        
except ValidationError as e:
    print("❌ Schema validation failed!")
    print(f"Validation errors: {e.errors()}")
    
except Exception as e:
    print(f"❌ Unexpected error: {e}")