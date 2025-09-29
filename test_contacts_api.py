#!/usr/bin/env python3
import requests
import json


def test_contacts_api():
    # Login first
    login_url = "http://localhost:8000/api/v1/auth/login"
    login_data = {
        "email": "simple@test.com",
        "password": "password123"
    }

    try:
        login_response = requests.post(login_url, json=login_data)
        if login_response.status_code != 200:
            print(f"Login failed: {login_response.text}")
            return

        token_data = login_response.json()
        headers = {
            "Authorization": f"Bearer {token_data.get('access_token')}",
            "Content-Type": "application/json"
        }

        # Get contacts
        contacts_response = requests.get(
            "http://localhost:8000/api/v1/contacts", headers=headers)
        print(f"Contacts API status: {contacts_response.status_code}")

        if contacts_response.status_code == 200:
            contacts = contacts_response.json()
            print(f"Number of contacts returned: {len(contacts)}")
            print(
                f"Raw contacts data: {json.dumps(contacts, indent=2, default=str)}")
        else:
            print(f"Contacts API failed: {contacts_response.text}")

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    test_contacts_api()
