#!/usr/bin/env python3
import requests
import json


def create_test_activities():
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

        # First, get the contacts we created
        contacts_response = requests.get(
            "http://localhost:8000/api/v1/contacts", headers=headers)
        if contacts_response.status_code != 200:
            print(f"Failed to get contacts: {contacts_response.text}")
            return

        contacts = contacts_response.json()
        print(f"Found {len(contacts)} contacts")

        # Create activities for each contact
        if len(contacts) >= 2:
            contact1_id = contacts[0]['id']
            contact2_id = contacts[1]['id']

            activities_data = [
                {
                    "type": "call",
                    "subject": "Initial sales call with " + contacts[0]['first_name'],
                    "description": "Discussed product requirements and timeline",
                    "duration_minutes": 30,
                    "outcome": "positive",
                    "contact_id": contact1_id
                },
                {
                    "type": "email",
                    "subject": "Follow-up email to " + contacts[0]['first_name'],
                    "description": "Sent product brochure and pricing information",
                    "contact_id": contact1_id
                },
                {
                    "type": "meeting",
                    "subject": "Product demo with " + contacts[1]['first_name'],
                    "description": "Demonstrated key features of our platform",
                    "duration_minutes": 60,
                    "outcome": "very_positive",
                    "contact_id": contact2_id
                },
                {
                    "type": "call",
                    "subject": "Closing call with " + contacts[1]['first_name'],
                    "description": "Discussed pricing and next steps",
                    "duration_minutes": 45,
                    "outcome": "positive",
                    "contact_id": contact2_id
                }
            ]

            for activity_data in activities_data:
                activity_response = requests.post(
                    "http://localhost:8000/api/v1/activities", json=activity_data, headers=headers)
                print(
                    f"Activity creation status: {activity_response.status_code}")

                if activity_response.status_code == 200:
                    activity_result = activity_response.json()
                    print(
                        f"Created activity: {activity_result.get('subject')} with ID: {activity_result.get('id')}")
                else:
                    print(
                        f"Activity creation failed: {activity_response.text}")

        print("Test activities creation completed!")

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    create_test_activities()
