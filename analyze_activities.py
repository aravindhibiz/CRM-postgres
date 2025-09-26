#!/usr/bin/env python3
import requests
import json

def analyze_activities_and_contacts():
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
        
        print("=== ANALYZING ACTIVITIES ===")
        # Get activities
        activities_response = requests.get("http://localhost:8000/api/v1/activities", headers=headers)
        if activities_response.status_code == 200:
            activities = activities_response.json()
            print(f"Number of activities: {len(activities)}")
            for i, activity in enumerate(activities):
                print(f"{i+1}. Activity: {activity.get('subject')} | Type: {activity.get('type')} | Contact ID: {activity.get('contact_id')}")
        else:
            print(f"Failed to get activities: {activities_response.text}")
            
        print("\n=== ANALYZING CONTACTS ===")
        # Get contacts
        contacts_response = requests.get("http://localhost:8000/api/v1/contacts", headers=headers)
        if contacts_response.status_code == 200:
            contacts = contacts_response.json()
            print(f"Number of contacts: {len(contacts)}")
            for i, contact in enumerate(contacts):
                contact_name = f"{contact.get('first_name')} {contact.get('last_name')}"
                company_name = contact.get('company', {}).get('name', 'No Company') if contact.get('company') else 'No Company'
                print(f"{i+1}. Contact: {contact_name} | ID: {contact.get('id')} | Company: {company_name}")
        else:
            print(f"Failed to get contacts: {contacts_response.text}")
            
        print("\n=== CHECKING ACTIVITY-CONTACT RELATIONSHIPS ===")
        if activities_response.status_code == 200 and contacts_response.status_code == 200:
            activities = activities_response.json()
            contacts = contacts_response.json()
            
            # Create a map of contact IDs to names
            contact_map = {}
            for contact in contacts:
                contact_map[contact.get('id')] = f"{contact.get('first_name')} {contact.get('last_name')}"
            
            print("Activities and their associated contacts:")
            for activity in activities:
                contact_id = activity.get('contact_id')
                contact_name = contact_map.get(contact_id, 'UNLINKED - No contact found')
                print(f"- '{activity.get('subject')}' -> Contact: {contact_name} (ID: {contact_id})")
                
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    analyze_activities_and_contacts()