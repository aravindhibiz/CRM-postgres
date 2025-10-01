#!/usr/bin/env python3
"""
Test the bulk update request directly against the API
"""
import requests
import json

# Test configuration data (matches frontend format)
test_configurations = [
    {"key": "general.company_name", "value": "Test Company Updated"},
    {"key": "general.time_format", "value": "24"},
    {"key": "general.currency", "value": "EUR"},
    {"key": "integrations.email_service_provider", "value": "sendgrid"}
]

# Request payload
payload = {
    "configurations": test_configurations
}

print("Test Payload:")
print(json.dumps(payload, indent=2))
print(f"\nNumber of configurations: {len(test_configurations)}")

# First, let's get a token by logging in
login_payload = {
    "email": "aravind@hibizsolutions.com",
    "password": "12345"
}

try:
    # Login to get token
    print("\n1. Logging in...")
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
    
    # Test the bulk update
    print("\n2. Testing bulk update...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.put(
        "http://localhost:8000/api/v1/system-config/bulk",
        headers=headers,
        json=payload
    )
    
    print(f"Response Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    try:
        response_data = response.json()
        print(f"Response Body: {json.dumps(response_data, indent=2)}")
    except:
        print(f"Response Text: {response.text}")
        
except Exception as e:
    print(f"Error occurred: {e}")