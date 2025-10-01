"""
Test the exact API call that's failing
"""
import requests
import json

# Test data that matches what the frontend is sending
test_data = {
    "configurations": [
        {"key": "general.time_format", "value": "24"},
        {"key": "general.company_name", "value": "Test Company"}
    ]
}

def test_bulk_update():
    url = "http://localhost:8000/api/v1/system-config/bulk"
    
    print("Testing bulk update endpoint...")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.put(url, json=test_data)
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 422:
            print("Validation Error Details:")
            error_data = response.json()
            print(json.dumps(error_data, indent=2))
        elif response.ok:
            print("Success Response:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Error Response: {response.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_bulk_update()