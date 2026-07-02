#!/usr/bin/env python3
import requests
import json

BASE_URL = "https://resident-hub-demo.preview.emergentagent.com/api"

# Login as resident
session = requests.Session()
resp = session.post(f"{BASE_URL}/auth/sso", json={"role": "RESIDENT"}, timeout=10)
print("Login response:", resp.status_code)
print(json.dumps(resp.json(), indent=2))

# Check session
resp = session.get(f"{BASE_URL}/auth/session", timeout=10)
print("\nSession response:", resp.status_code)
data = resp.json()
print(json.dumps(data, indent=2))

# Check property structure
if 'property' in data:
    print("\nProperty keys:", list(data['property'].keys()) if data['property'] else "property is null")
