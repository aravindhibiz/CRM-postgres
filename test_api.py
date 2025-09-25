#!/usr/bin/env python3
import requests
import json

# Backend URL
BASE_URL = "http://localhost:8000"


def test_register():
    """Test user registration"""
    url = f"{BASE_URL}/api/v1/auth/register"
    data = {
        "email": "test@example.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User",
        "role": "sales_rep"
    }

    try:
        response = requests.post(url, json=data)
        print(f"Register Status: {response.status_code}")
        print(f"Register Response: {response.text}")

        if response.status_code == 200:
            return response.json()
        else:
            print("Registration failed, trying login...")
            return test_login()
    except Exception as e:
        print(f"Register Error: {e}")
        return None


def test_login():
    """Test user login"""
    url = f"{BASE_URL}/api/v1/auth/login"
    data = {
        "email": "test@example.com",
        "password": "testpass123"
    }

    try:
        response = requests.post(url, json=data)
        print(f"Login Status: {response.status_code}")
        print(f"Login Response: {response.text}")

        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Login Error: {e}")
        return None


def test_create_deal(token):
    """Test deal creation"""
    url = f"{BASE_URL}/api/v1/deals"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    data = {
        "name": "Test Deal",
        "value": 10000,
        "stage": "lead",
        "probability": 25,
        "description": "This is a test deal",
        "source": "website"
    }

    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"Create Deal Status: {response.status_code}")
        print(f"Create Deal Response: {response.text}")
        return response.json() if response.status_code == 200 else None
    except Exception as e:
        print(f"Create Deal Error: {e}")
        return None


def test_get_deals(token):
    """Test getting deals"""
    url = f"{BASE_URL}/api/v1/deals"
    headers = {
        "Authorization": f"Bearer {token}"
    }

    try:
        response = requests.get(url, headers=headers)
        print(f"Get Deals Status: {response.status_code}")
        print(f"Get Deals Response: {response.text}")
        return response.json() if response.status_code == 200 else None
    except Exception as e:
        print(f"Get Deals Error: {e}")
        return None


if __name__ == "__main__":
    print("Testing CRM Backend API...")

    # Test registration or login
    auth_response = test_register()

    if auth_response and "access_token" in auth_response:
        token = auth_response["access_token"]
        print(f"Got token: {token[:20]}...")

        # Test deal creation
        deal = test_create_deal(token)
        if deal:
            print("Deal created successfully!")

        # Test getting deals
        deals = test_get_deals(token)
        if deals:
            print(f"Found {len(deals)} deals")
    else:
        print("Authentication failed")
