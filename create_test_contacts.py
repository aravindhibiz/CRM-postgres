#!/usr/bin/env python3
import requests
import json


def create_test_contacts():
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

        # Create a company first
        company_data = {
            "name": "Acme Corp",
            "industry": "Technology",
            "website": "https://acme.com",
            "phone": "555-0123"
        }

        company_response = requests.post(
            "http://localhost:8000/api/v1/companies", json=company_data, headers=headers)
        print(f"Company creation status: {company_response.status_code}")

        company_id = None
        if company_response.status_code == 200:
            company_result = company_response.json()
            company_id = company_result.get('id')
            print(
                f"Created company: {company_result.get('name')} with ID: {company_id}")

        # Create another company
        company_data2 = {
            "name": "Tech Solutions Inc",
            "industry": "Software",
            "website": "https://techsolutions.com",
            "phone": "555-0456"
        }

        company_response2 = requests.post(
            "http://localhost:8000/api/v1/companies", json=company_data2, headers=headers)
        company_id2 = None
        if company_response2.status_code == 200:
            company_result2 = company_response2.json()
            company_id2 = company_result2.get('id')
            print(
                f"Created company: {company_result2.get('name')} with ID: {company_id2}")

        # Create contacts
        contacts_data = [
            {
                "first_name": "John",
                "last_name": "Doe",
                "email": "john.doe@acme.com",
                "phone": "555-0124",
                "position": "Sales Manager",
                "company_id": company_id
            },
            {
                "first_name": "Jane",
                "last_name": "Smith",
                "email": "jane.smith@acme.com",
                "phone": "555-0125",
                "position": "Marketing Director",
                "company_id": company_id
            },
            {
                "first_name": "Bob",
                "last_name": "Johnson",
                "email": "bob.johnson@techsolutions.com",
                "phone": "555-0126",
                "position": "CTO",
                "company_id": company_id2
            },
            {
                "first_name": "Alice",
                "last_name": "Brown",
                "email": "alice.brown@freelance.com",
                "phone": "555-0127",
                "position": "Consultant",
                "company_id": None  # No company
            }
        ]

        for contact_data in contacts_data:
            contact_response = requests.post(
                "http://localhost:8000/api/v1/contacts", json=contact_data, headers=headers)
            print(f"Contact creation status: {contact_response.status_code}")

            if contact_response.status_code == 200:
                contact_result = contact_response.json()
                print(
                    f"Created contact: {contact_result.get('first_name')} {contact_result.get('last_name')} with ID: {contact_result.get('id')}")
            else:
                print(f"Contact creation failed: {contact_response.text}")

        print("Test contacts creation completed!")

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    create_test_contacts()
