import requests
import json

# Test configuration
BASE_URL = "http://localhost:5001"  # Local server
AUTH_TOKEN = "toasty1"  # Default token

def test_add_winner():
    """Test adding a winner to the results"""
    url = f"{BASE_URL}/api/winner"
    headers = {
        "Authorization": f"Bearer {AUTH_TOKEN}",
        "Content-Type": "application/json"
    }
    
    data = {
        "winners": ["Alex", "Maya"],
        "split": True,
        "notes": "50/50 split pot",
        "other_players": "John, Sarah, Mike"
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Add Winner Response: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_get_results():
    """Test getting results"""
    url = f"{BASE_URL}/api/results"
    
    try:
        response = requests.get(url)
        print(f"Get Results Response: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_unauthorized():
    """Test unauthorized access"""
    url = f"{BASE_URL}/api/winner"
    headers = {
        "Content-Type": "application/json"
    }
    
    data = {
        "winners": ["Test"],
        "split": False,
        "notes": "Should fail"
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Unauthorized Response: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 403
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Poker Results API")
    print("=" * 40)
    
    # Test unauthorized access
    print("\n1. Testing unauthorized access...")
    test_unauthorized()
    
    # Test adding winner
    print("\n2. Testing add winner...")
    test_add_winner()
    
    # Test getting results
    print("\n3. Testing get results...")
    test_get_results()
    
    print("\n✅ Tests completed!")
    print(f"📊 View results at: {BASE_URL}/reveal") 