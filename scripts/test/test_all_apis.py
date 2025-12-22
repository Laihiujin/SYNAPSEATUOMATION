import requests
import json
import time

base_url = "http://localhost:5000"
apis = [
    ("GET", "/api/ai/status", None),
    ("GET", "/api/ai/models", None),
    ("POST", "/api/ai/health-check", {}),
    ("POST", "/api/ai/chat", {"message": "你好"}),
]

print("=" * 60)
print("Testing AI APIs")
print("=" * 60)

for method, endpoint, data in apis:
    url = base_url + endpoint
    try:
        if method == "GET":
            r = requests.get(url, timeout=5)
        else:
            r = requests.post(url, json=data, timeout=5)
        
        print(f"\n[{method}] {endpoint}")
        print(f"  Status: {r.status_code}")
        
        if r.status_code == 200:
            print(f"  ✓ SUCCESS")
            try:
                resp_json = r.json()
                print(f"  Response: {json.dumps(resp_json, indent=2, ensure_ascii=False)[:200]}")
            except:
                print(f"  Response: {r.text[:200]}")
        else:
            print(f"  ✗ FAILED")
            print(f"  Error: {r.text[:200]}")
    except Exception as e:
        print(f"\n[{method}] {endpoint}")
        print(f"  ✗ ERROR: {str(e)}")

print("\n" + "=" * 60)
