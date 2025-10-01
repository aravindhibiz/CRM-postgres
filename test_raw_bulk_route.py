#!/usr/bin/env python3
"""
Test the raw bulk route
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

# Login credentials
login_payload = {
    "email": "aravind@hibizsolutions.com",
    "password": "12345"
}

try:
    # Login to get token
    print("1. Logging in...")
    login_response = requests.post(
        "http://localhost:8000/api/v1/auth/login",
        json=login_payload
    )
    
    if login_response.status_code != 200:
        print(f"Login failed: {login_response.status_code} - {login_response.text}")
        exit(1)
    
    login_data = login_response.json()
    token = login_data.get('access_token')
    print(f"Login successful, got token")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test the raw bulk route
    print("\n2. Testing /bulk-raw route...")
    response = requests.put(
        "http://localhost:8000/api/v1/system-config/bulk-raw",
        headers=headers,
        json=payload
    )
    
    print(f"Raw Route Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Raw Route Response: {response.json()}")
    else:
        try:
            error_data = response.json()
            print(f"Raw Route Error: {json.dumps(error_data, indent=2)}")
        except:
            print(f"Raw Route Error Text: {response.text}")
        
except Exception as e:
    print(f"Error occurred: {e}")