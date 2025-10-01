#!/usr/bin/env python3
"""
Test simple debug route
"""
import requests

try:
    # Test the simple debug route
    print("Testing /debug-test route...")
    response = requests.get("http://localhost:8000/api/v1/system-config/debug-test")
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {response.json()}")
    else:
        print(f"Error: {response.text}")
        
except Exception as e:
    print(f"Error occurred: {e}")