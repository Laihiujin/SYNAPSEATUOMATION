"""
Test script for analytics collection API
"""
import httpx
import asyncio
import json

async def test_collect_api():
    """Test the /api/analytics/collect endpoint"""
    url = "http://localhost:7000/api/v1/analytics/collect"

    # Test payload: collect douyin accounts only (API-based, no Playwright)
    payload = {
        "mode": "accounts",
        "platform": "douyin"  # Only douyin, which uses API instead of Playwright
    }

    print(f"Testing {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print("-" * 60)

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload)

            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            print("-" * 60)

            if response.status_code == 200:
                data = response.json()
                print("Response Data:")
                print(json.dumps(data, indent=2, ensure_ascii=False))
            else:
                print(f"Error Response: {response.text}")

    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_collect_api())
