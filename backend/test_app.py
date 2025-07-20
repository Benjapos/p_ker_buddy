import pytest
import json
from app import app

@pytest.fixture
def client():
    """Create a test client for the Flask app"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

class TestPokerAPI:
    """Test cases for the poker analysis API"""

    def test_health_check(self, client):
        """Test the health check endpoint"""
        response = client.get('/api/health')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['status'] == 'healthy'
        assert 'timestamp' in data

    def test_analyze_hand_success(self, client):
        """Test successful hand analysis"""
        hand_data = {
            'holeCards': ['A♠', 'A♥'],
            'flop': ['K♦', 'Q♣', 'J♠'],
            'turn': None,
            'river': None,
            'numPlayers': 6,
            'position': 'button',
            'potSize': 100,
            'betSize': 0
        }
        
        response = client.post('/api/analyze',
                             data=json.dumps(hand_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Check required fields
        assert 'action' in data
        assert 'confidence' in data
        assert 'handStrength' in data
        assert 'potOdds' in data
        assert 'ev' in data
        assert 'reasoning' in data
        assert 'timestamp' in data
        
        # Check data types
        assert isinstance(data['action'], str)
        assert isinstance(data['confidence'], int)
        assert isinstance(data['handStrength'], str)
        assert isinstance(data['potOdds'], int)
        assert isinstance(data['ev'], int)
        assert isinstance(data['reasoning'], str)

    def test_analyze_hand_missing_hole_cards(self, client):
        """Test analysis with missing hole cards"""
        hand_data = {
            'flop': ['K♦', 'Q♣', 'J♠'],
            'numPlayers': 6,
            'position': 'button',
            'potSize': 100,
            'betSize': 0
        }
        
        response = client.post('/api/analyze',
                             data=json.dumps(hand_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Missing hole cards' in data['error']

    def test_analyze_hand_wrong_hole_cards_count(self, client):
        """Test analysis with wrong number of hole cards"""
        hand_data = {
            'holeCards': ['A♠'],  # Only one card
            'flop': ['K♦', 'Q♣', 'J♠'],
            'numPlayers': 6,
            'position': 'button',
            'potSize': 100,
            'betSize': 0
        }
        
        response = client.post('/api/analyze',
                             data=json.dumps(hand_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Must provide exactly 2 hole cards' in data['error']

    def test_analyze_hand_strong_hand(self, client):
        """Test analysis of a strong hand (should recommend raise)"""
        hand_data = {
            'holeCards': ['A♠', 'A♥'],
            'flop': ['A♦', 'K♣', 'Q♠'],
            'turn': None,
            'river': None,
            'numPlayers': 6,
            'position': 'button',
            'potSize': 100,
            'betSize': 0
        }
        
        response = client.post('/api/analyze',
                             data=json.dumps(hand_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Three aces should recommend raise
        assert data['action'] == 'raise'
        assert data['confidence'] > 70
        assert data['handStrength'] == 'Three of a Kind'
        assert data['raiseAmount'] is not None

    def test_analyze_hand_weak_hand(self, client):
        """Test analysis of a weak hand (should recommend fold)"""
        hand_data = {
            'holeCards': ['2♠', '7♥'],
            'flop': ['K♦', 'Q♣', 'J♠'],
            'turn': None,
            'river': None,
            'numPlayers': 6,
            'position': 'early',
            'potSize': 100,
            'betSize': 50
        }
        
        response = client.post('/api/analyze',
                             data=json.dumps(hand_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Weak hand should recommend fold
        assert data['action'] == 'fold'
        assert data['handStrength'] == 'High Card'

    def test_analyze_hand_with_pot_odds(self, client):
        """Test analysis considering pot odds"""
        hand_data = {
            'holeCards': ['2♠', '7♥'],
            'flop': ['K♦', 'Q♣', 'J♠'],
            'turn': None,
            'river': None,
            'numPlayers': 6,
            'position': 'middle',
            'potSize': 200,
            'betSize': 10  # Very good pot odds
        }
        
        response = client.post('/api/analyze',
                             data=json.dumps(hand_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Should calculate pot odds correctly
        assert data['potOdds'] == 2000  # 200/10 * 100

    def test_analyze_hand_different_positions(self, client):
        """Test analysis with different positions"""
        hand_data = {
            'holeCards': ['A♠', 'K♥'],
            'flop': ['Q♦', 'J♣', '10♠'],
            'turn': None,
            'river': None,
            'numPlayers': 6,
            'potSize': 100,
            'betSize': 0
        }
        
        positions = ['early', 'middle', 'late', 'button']
        
        for position in positions:
            hand_data['position'] = position
            response = client.post('/api/analyze',
                                 data=json.dumps(hand_data),
                                 content_type='application/json')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert 'action' in data
            assert 'confidence' in data

    def test_analyze_hand_different_player_counts(self, client):
        """Test analysis with different player counts"""
        hand_data = {
            'holeCards': ['A♠', 'K♥'],
            'flop': ['Q♦', 'J♣', '10♠'],
            'turn': None,
            'river': None,
            'position': 'middle',
            'potSize': 100,
            'betSize': 0
        }
        
        player_counts = [2, 4, 6, 8, 10]
        
        for num_players in player_counts:
            hand_data['numPlayers'] = num_players
            response = client.post('/api/analyze',
                                 data=json.dumps(hand_data),
                                 content_type='application/json')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert 'action' in data
            assert 'confidence' in data

    def test_analyze_hand_with_turn_and_river(self, client):
        """Test analysis with complete board"""
        hand_data = {
            'holeCards': ['A♠', 'A♥'],
            'flop': ['K♦', 'Q♣', 'J♠'],
            'turn': '10♠',
            'river': '9♠',
            'numPlayers': 6,
            'position': 'button',
            'potSize': 100,
            'betSize': 0
        }
        
        response = client.post('/api/analyze',
                             data=json.dumps(hand_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'action' in data
        assert 'handStrength' in data

    def test_invalid_json(self, client):
        """Test with invalid JSON"""
        response = client.post('/api/analyze',
                             data='invalid json',
                             content_type='application/json')
        
        assert response.status_code == 400

    def test_missing_content_type(self, client):
        """Test without content-type header"""
        hand_data = {
            'holeCards': ['A♠', 'A♥'],
            'numPlayers': 6,
            'position': 'button',
            'potSize': 100,
            'betSize': 0
        }
        
        response = client.post('/api/analyze',
                             data=json.dumps(hand_data))
        
        assert response.status_code == 400

if __name__ == '__main__':
    pytest.main([__file__]) 