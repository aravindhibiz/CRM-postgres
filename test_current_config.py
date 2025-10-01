#!/usr/bin/env python3
"""
Test the current configuration endpoint
"""
import requests
import json

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
    
    # Test the current configuration endpoint
    print("\n2. Getting current configuration...")
    response = requests.get(
        "http://localhost:8000/api/v1/system-config/current",
        headers=headers
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        config_data = response.json()
        print("Current Configuration:")
        print(f"  Currency: {config_data.get('general', {}).get('currency', 'N/A')}")
        print(f"  Time Format: {config_data.get('general', {}).get('time_format', 'N/A')}")
        print(f"  Date Format: {config_data.get('general', {}).get('date_format', 'N/A')}")
        print(f"  Company Name: {config_data.get('general', {}).get('company_name', 'N/A')}")
    else:
        try:
            error_data = response.json()
            print(f"Error: {json.dumps(error_data, indent=2)}")
        except:
            print(f"Error Text: {response.text}")
        
except Exception as e:
    print(f"Error occurred: {e}")