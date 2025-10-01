"""
Test system configuration API endpoints
"""
import requests
import json

# Test the API endpoints
base_url = "http://localhost:8000/api/v1"

def test_grouped_endpoint():
    try:
        response = requests.get(f"{base_url}/system-config/grouped")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Sample data structure:")
            for category, fields in list(data.items())[:2]:  # Show first 2 categories
                print(f"  {category}:")
                for field, value in list(fields.items())[:3]:  # Show first 3 fields
                    print(f"    {field}: {value}")
                print("    ...")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_bulk_update_format():
    # Test what format the bulk update expects
    sample_data = {
        "configurations": [
            {"key": "general.company_name", "value": "Test Company"},
            {"key": "general.timezone", "value": "America/New_York"}
        ]
    }
    print("Expected bulk update format:")
    print(json.dumps(sample_data, indent=2))

if __name__ == "__main__":
    print("Testing system configuration endpoints...")
    print("=" * 50)
    test_grouped_endpoint()
    print("\n" + "=" * 50)
    test_bulk_update_format()