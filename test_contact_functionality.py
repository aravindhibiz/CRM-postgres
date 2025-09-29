import requests
import json

# Test the contact search and filter functionality
base_url = "http://localhost:8000/api/v1/contacts"


def test_contacts_endpoints():
    print("Testing Contact Management Endpoints")
    print("=" * 50)

    # Test 1: Get all contacts
    try:
        response = requests.get(base_url)
        print(f"✓ GET /contacts - Status: {response.status_code}")
        if response.status_code == 200:
            contacts = response.json()
            print(f"  Found {len(contacts)} contacts")
        else:
            print(f"  Error: {response.text}")
    except Exception as e:
        print(f"✗ GET /contacts - Error: {e}")

    # Test 2: Search contacts
    try:
        search_term = "test"
        response = requests.get(f"{base_url}?search={search_term}")
        print(
            f"✓ GET /contacts?search={search_term} - Status: {response.status_code}")
        if response.status_code == 200:
            contacts = response.json()
            print(f"  Search results: {len(contacts)} contacts")
        else:
            print(f"  Error: {response.text}")
    except Exception as e:
        print(f"✗ Search contacts - Error: {e}")

    # Test 3: Filter by status
    try:
        response = requests.get(f"{base_url}?status=active")
        print(
            f"✓ GET /contacts?status=active - Status: {response.status_code}")
        if response.status_code == 200:
            contacts = response.json()
            print(f"  Active contacts: {len(contacts)} contacts")
        else:
            print(f"  Error: {response.text}")
    except Exception as e:
        print(f"✗ Filter by status - Error: {e}")

    # Test 4: Test import endpoint exists
    try:
        import_data = [
            {
                "first_name": "Test",
                "last_name": "User",
                "email": "test@example.com",
                "status": "active"
            }
        ]
        response = requests.post(f"{base_url}/import", json=import_data)
        print(f"✓ POST /contacts/import - Status: {response.status_code}")
        if response.status_code in [200, 201]:
            result = response.json()
            print(f"  Import result: {result.get('message', 'Success')}")
        else:
            print(f"  Note: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"✗ Import endpoint - Error: {e}")


if __name__ == "__main__":
    test_contacts_endpoints()
