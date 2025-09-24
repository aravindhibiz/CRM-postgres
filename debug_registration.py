#!/usr/bin/env python3
import requests
import json


def test_registration():
    url = "http://localhost:8000/api/v1/auth/register"

    data = {
        "email": "simple@test.com",
        "password": "password123",
        "first_name": "Test",
        "last_name": "User",
        "role": "sales_rep"
    }

    headers = {
        "Content-Type": "application/json",
        "Origin": "http://localhost:3001"
    }

    try:
        print(f"Testing: {url}")
        print(f"Data: {json.dumps(data, indent=2)}")

        response = requests.post(url, json=data, headers=headers)

        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")

        if response.status_code == 200:
            print("SUCCESS!")
            print(response.json())
        else:
            print("FAILED!")
            print(f"Response: {response.text}")

    except Exception as e:
        print(f"Exception: {e}")


if __name__ == "__main__":
    test_registration()
