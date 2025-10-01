#!/usr/bin/env python3
"""
Test route without authentication
"""
import requests
import json

# Test configuration data
test_configurations = [
    {"key": "general.company_name", "value": "Test Company Updated"},
    {"key": "general.time_format", "value": "24"},
    {"key": "general.default_currency", "value": "USD"}
]

# Request payload
payload = {
    "configurations": test_configurations
}

try:
    # Test the no-auth route
    print("Testing /bulk-test-no-auth route (no authentication)...")
    response = requests.put(
        "http://localhost:8000/api/v1/system-config/bulk-test-no-auth",
        headers={"Content-Type": "application/json"},
        json=payload
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {response.json()}")
    else:
        try:
            error_data = response.json()
            print(f"Error: {json.dumps(error_data, indent=2)}")
        except:
            print(f"Error Text: {response.text}")
        
except Exception as e:
    print(f"Error occurred: {e}")