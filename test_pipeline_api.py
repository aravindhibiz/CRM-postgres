#!/usr/bin/env python3
import requests
import json


def test_pipeline_api():
    # Login first as sales manager
    login_url = "http://localhost:8000/api/v1/auth/login"
    login_data = {
        "email": "simple@test.com",  # Assuming this is a sales manager account
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

        # Test pipeline endpoint
        pipeline_response = requests.get(
            "http://localhost:8000/api/v1/deals/pipeline", headers=headers)
        print(f"Pipeline API status: {pipeline_response.status_code}")

        if pipeline_response.status_code == 200:
            pipeline_data = pipeline_response.json()
            print(
                f"Pipeline data: {json.dumps(pipeline_data, indent=2, default=str)}")

            # Count total deals in pipeline
            total_deals = 0
            for stage_name, stage_data in pipeline_data.items():
                stage_deals = len(stage_data.get('deals', []))
                total_deals += stage_deals
                print(f"{stage_name}: {stage_deals} deals")

            print(f"Total deals in pipeline: {total_deals}")
        else:
            print(f"Pipeline API failed: {pipeline_response.text}")

        # Also test regular deals endpoint for comparison
        deals_response = requests.get(
            "http://localhost:8000/api/v1/deals", headers=headers)
        print(f"\nRegular deals API status: {deals_response.status_code}")

        if deals_response.status_code == 200:
            deals_data = deals_response.json()
            print(f"Regular deals count: {len(deals_data)}")
        else:
            print(f"Regular deals API failed: {deals_response.text}")

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    test_pipeline_api()
