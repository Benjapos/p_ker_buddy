import json
from app import app

def test_analyze_endpoint():
    client = app.test_client()
    
    # Test data
    hand_data = {
        'holeCards': ['A♠', 'A♥'],
        'numPlayers': 6,
        'position': 'button',
        'potSize': 100,
        'betSize': 0
    }
    
    try:
        response = client.post('/api/analyze',
                             data=json.dumps(hand_data),
                             content_type='application/json')
        
        print(f'Status Code: {response.status_code}')
        print(f'Response Data: {response.data.decode()}')
        
        if response.status_code == 500:
            print("500 Error occurred - checking for exceptions...")
            
    except Exception as e:
        print(f"Exception occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_analyze_endpoint() 