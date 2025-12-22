import requests
import json

try:
    r = requests.get('http://localhost:5000/api/ai/status')
    print("Status:", r.status_code)
    if r.status_code == 200:
        print(json.dumps(r.json(), indent=2, ensure_ascii=False))
    else:
        print("Error:", r.text[:200])
except Exception as e:
    print(f"Request failed: {e}")
