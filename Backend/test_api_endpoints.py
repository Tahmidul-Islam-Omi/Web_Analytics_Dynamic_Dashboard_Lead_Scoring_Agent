#!/usr/bin/env python3
"""
Test script for lead scoring API endpoints.
Make sure the server is running before executing this script.
"""

import requests
import json
from uuid import uuid4

BASE_URL = "http://127.0.0.1:8000/api"

def test_lead_scoring_endpoints():
    """Test the lead scoring API endpoints"""
    print("🧪 Testing Lead Scoring API Endpoints")
    print("=" * 50)
    
    # Test with a random session ID (should return 404)
    test_session_id = str(uuid4())
    print(f"\n📊 Testing with random session ID: {test_session_id}")
    
    try:
        # Test session score calculation
        response = requests.post(
            f"{BASE_URL}/lead-score/session",
            json={"sessionId": test_session_id},
            timeout=10
        )
        
        if response.status_code == 404:
            print("✅ Correctly returned 404 for non-existent session")
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            print(f"Response: {response.text}")
    
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        print("Make sure the server is running on http://127.0.0.1:8000")
        return
    
    # Test session analytics endpoint
    try:
        response = requests.get(
            f"{BASE_URL}/lead-score/session/{test_session_id}",
            timeout=10
        )
        
        if response.status_code == 404:
            print("✅ Analytics endpoint correctly returned 404 for non-existent session")
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            print(f"Response: {response.text}")
    
    except requests.exceptions.RequestException as e:
        print(f"❌ Analytics request failed: {e}")
    
    # Test user score calculation with random user ID
    test_user_id = str(uuid4())
    print(f"\n👤 Testing with random user ID: {test_user_id}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/lead-score/user",
            json={"userId": test_user_id},
            timeout=10
        )
        
        if response.status_code == 404:
            print("✅ Correctly returned 404 for non-existent user")
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            print(f"Response: {response.text}")
    
    except requests.exceptions.RequestException as e:
        print(f"❌ User score request failed: {e}")
    
    print("\n✅ API endpoint tests completed!")


def test_health_check():
    """Test if the server is running"""
    print("🏥 Testing Server Health")
    print("=" * 30)
    
    try:
        response = requests.get(f"http://127.0.0.1:8000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Server is running")
            print(f"Status: {data.get('status')}")
            print(f"Database: {data.get('database')}")
            return True
        else:
            print(f"❌ Server returned {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Server is not running: {e}")
        return False


if __name__ == "__main__":
    if test_health_check():
        test_lead_scoring_endpoints()
    else:
        print("\n❌ Cannot test API endpoints - server is not running")
        print("Start the server with: python main.py")