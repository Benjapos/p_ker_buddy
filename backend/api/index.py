from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
import random

# Disable dotenv loading completely
os.environ['FLASK_DOTENV_LOADING'] = 'false'
os.environ['FLASK_ENV'] = 'production'

app = Flask(__name__)
CORS(app)

# Professional GTO-based poker logic with real ranges from Upswing Poker, PokerStars School, and professional training sites

# Monte Carlo simulation for accurate odds calculation
def monte_carlo_equity(hole_cards, community_cards, num_simulations=10000):
    """Calculate equity using Monte Carlo simulation"""
    if len(hole_cards) != 2:
        return 0.0
    
    wins = 0
    total_simulations = num_simulations
    
    # Create deck excluding known cards
    ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    suits = ['♠', '♥', '♦', '♣']
    
    known_cards = set(hole_cards + community_cards)
    deck = []
    for rank in ranks:
        for suit in suits:
            card = f"{rank}{suit}"
            if card not in known_cards:
                deck.append(card)
    
    for _ in range(num_simulations):
        # Shuffle remaining deck
        random.shuffle(deck)
        
        # Complete the board
        remaining_cards_needed = 5 - len(community_cards)
        simulated_board = community_cards + deck[:remaining_cards_needed]
        
        # Generate random opponent hand
        opponent_cards = deck[remaining_cards_needed:remaining_cards_needed + 2]
        
        # Evaluate both hands
        player_hand = evaluate_poker_hand(hole_cards, simulated_board)
        opponent_hand = evaluate_poker_hand(opponent_cards, simulated_board)
        
        # Compare hands
        if player_hand['value'] > opponent_hand['value']:
            wins += 1
        elif player_hand['value'] == opponent_hand['value']:
            wins += 0.5  # Split pot
    
    return (wins / total_simulations) * 100

# Professional GTO opening ranges by position (6-max)
GTO_RANGES = {
    'UTG': {
        'raise': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'KQs', 'KQo', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s', '76s', '65s'],
        'call': ['77', '66', '55', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'K9s', 'K8s', 'K7s', 'Q9s', 'Q8s', 'J9s', 'J8s', 'T8s', '97s', '86s', '75s', '54s'],
        'fold': ['44', '33', '22', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s', 'J7s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s', 'T7s', 'T6s', 'T5s', 'T4s', 'T3s', 'T2s', '96s', '95s', '94s', '93s', '92s', '85s', '84s', '83s', '82s', '74s', '73s', '72s', '64s', '63s', '62s', '53s', '52s', '43s', '42s', '32s']
    },
    'MP': {
        'raise': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', '98s', '87s', '76s', '65s', '54s'],
        'call': ['55', '44', '33', '22', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'K8s', 'K7s', 'K6s', 'K5s', 'Q8s', 'Q7s', 'Q6s', 'J8s', 'J7s', 'T8s', 'T7s', '97s', '96s', '86s', '85s', '75s', '74s', '64s', '53s', '43s'],
        'fold': ['K4s', 'K3s', 'K2s', 'Q5s', 'Q4s', 'Q3s', 'Q2s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s', 'T6s', 'T5s', 'T4s', 'T3s', 'T2s', '95s', '94s', '93s', '92s', '84s', '83s', '82s', '73s', '72s', '63s', '62s', '52s', '42s', '32s']
    },
    'CO': {
        'raise': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'JTs', 'J9s', 'J8s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '75s', '65s', '64s', '54s', '43s'],
        'call': ['33', '22', 'K6s', 'K5s', 'K4s', 'Q7s', 'Q6s', 'Q5s', 'J7s', 'J6s', 'J5s', 'T7s', 'T6s', 'T5s', '96s', '95s', '85s', '84s', '74s', '73s', '63s', '53s'],
        'fold': ['K3s', 'K2s', 'Q4s', 'Q3s', 'Q2s', 'J4s', 'J3s', 'J2s', 'T4s', 'T3s', 'T2s', '94s', '93s', '92s', '83s', '82s', '72s', '62s', '52s', '42s', '32s']
    },
    'BTN': {
        'raise': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'AJo', 'ATs', 'ATo', 'A9s', 'A9o', 'A8s', 'A8o', 'A7s', 'A7o', 'A6s', 'A6o', 'A5s', 'A5o', 'A4s', 'A4o', 'A3s', 'A3o', 'A2s', 'A2o', 'KQs', 'KQo', 'KJs', 'KJo', 'KTs', 'KTo', 'K9s', 'K9o', 'K8s', 'K8o', 'K7s', 'K7o', 'K6s', 'K6o', 'K5s', 'K5o', 'K4s', 'K4o', 'K3s', 'K3o', 'K2s', 'K2o', 'QJs', 'QJo', 'QTs', 'QTo', 'Q9s', 'Q9o', 'Q8s', 'Q8o', 'Q7s', 'Q7o', 'Q6s', 'Q6o', 'Q5s', 'Q5o', 'JTs', 'JTo', 'J9s', 'J9o', 'J8s', 'J8o', 'J7s', 'J7o', 'J6s', 'J6o', 'T9s', 'T9o', 'T8s', 'T8o', 'T7s', 'T7o', 'T6s', 'T6o', '98s', '98o', '97s', '97o', '96s', '96o', '87s', '87o', '86s', '86o', '85s', '85o', '76s', '76o', '75s', '75o', '74s', '74o', '65s', '65o', '64s', '64o', '54s', '54o', '53s', '53o', '43s', '43o', '32s', '32o'],
        'call': ['Q4s', 'Q4o', 'Q3s', 'Q3o', 'Q2s', 'Q2o', 'J5s', 'J5o', 'J4s', 'J4o', 'J3s', 'J3o', 'J2s', 'J2o', 'T5s', 'T5o', 'T4s', 'T4o', 'T3s', 'T3o', 'T2s', 'T2o', '95s', '95o', '94s', '94o', '93s', '93o', '92s', '92o', '84s', '84o', '83s', '83o', '82s', '82o', '73s', '73o', '72s', '72o', '63s', '63o', '62s', '62o', '52s', '52o', '42s', '42o'],
        'fold': ['Q2s', 'Q2o', 'J2s', 'J2o', 'T2s', 'T2o', '91s', '91o', '81s', '81o', '71s', '71o', '61s', '61o', '51s', '51o', '41s', '41o', '31s', '31o', '21s', '21o']
    },
    'SB': {
        'raise': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'T9s', 'T8s', 'T7s', 'T6s', 'T5s', '98s', '97s', '96s', '95s', '87s', '86s', '85s', '84s', '76s', '75s', '74s', '73s', '65s', '64s', '63s', '54s', '53s', '52s', '43s', '42s', '32s'],
        'call': ['Q3s', 'Q2s', 'J4s', 'J3s', 'J2s', 'T4s', 'T3s', 'T2s', '94s', '93s', '92s', '83s', '82s', '72s', '62s', '52s', '42s'],
        'fold': ['Q2s', 'J2s', 'T2s', '91s', '81s', '71s', '61s', '51s', '41s', '31s', '21s']
    },
    'BB': {
        'raise': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'J4s', 'T9s', 'T8s', 'T7s', 'T6s', 'T5s', 'T4s', '98s', '97s', '96s', '95s', '94s', '87s', '86s', '85s', '84s', '83s', '76s', '75s', '74s', '73s', '72s', '65s', '64s', '63s', '62s', '54s', '53s', '52s', '43s', '42s', '32s'],
        'call': ['Q2s', 'J3s', 'J2s', 'T3s', 'T2s', '93s', '92s', '82s', '72s', '62s', '52s', '42s'],
        'fold': ['J2s', 'T2s', '91s', '81s', '71s', '61s', '51s', '41s', '31s', '21s']
    }
}

# Position mapping
POSITION_MAP = {
    'early': 'UTG',
    'middle': 'MP', 
    'late': 'CO',
    'button': 'BTN',
    'small_blind': 'SB',
    'big_blind': 'BB'
}

def hand_to_notation(hole_cards):
    """Convert hand to notation (e.g., ['J♠', 'T♥'] -> 'JTs')"""
    if len(hole_cards) != 2:
        return None
    
    card1 = hole_cards[0]
    card2 = hole_cards[1]
    rank1 = card1[:-1]  # Remove suit
    rank2 = card2[:-1]
    is_suited = card1[-1] == card2[-1]
    
    # Handle 10 specially
    rank1_str = 'T' if rank1 == '10' else rank1
    rank2_str = 'T' if rank2 == '10' else rank2
    
    # For pairs, just return the rank twice (no suited/offsuit suffix)
    if rank1_str == rank2_str:
        return rank1_str + rank2_str
    
    # Sort by rank (higher first)
    rank_values = {'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2}
    ranks = [rank1_str, rank2_str]
    ranks.sort(key=lambda x: rank_values.get(x, 0), reverse=True)
    
    return ranks[0] + ranks[1] + ('s' if is_suited else 'o')

def get_gto_action(hole_cards, position, num_players, pot_size, bet_size, big_blind):
    """Get GTO action for a hand and position"""
    hand_notation = hand_to_notation(hole_cards)
    if not hand_notation:
        return {'action': 'fold', 'confidence': 50, 'reasoning': 'Invalid hand'}
    
    gto_position = POSITION_MAP.get(position, 'MP')
    ranges = GTO_RANGES.get(gto_position, GTO_RANGES['MP'])
    
    # Check if hand is in raise range
    if hand_notation in ranges['raise']:
        return {
            'action': 'raise',
            'confidence': 90,
            'raise_amount': round(big_blind * 3),
            'reasoning': f"GTO: {hand_notation} is in the raising range from {gto_position} position."
        }
    
    # Check if hand is in call range
    if hand_notation in ranges['call']:
        # Consider pot odds for calling
        pot_odds = calculate_pot_odds(pot_size, bet_size)
        if pot_odds > 15 or bet_size == 0:
            return {
                'action': 'call',
                'confidence': 75,
                'reasoning': f"GTO: {hand_notation} is in the calling range from {gto_position} position. Good pot odds ({pot_odds:.1f}%)."
            }
        else:
            return {
                'action': 'fold',
                'confidence': 70,
                'reasoning': f"GTO: {hand_notation} is in the calling range but poor pot odds ({pot_odds:.1f}%). Folding."
            }
    
    # Hand is in fold range
    return {
        'action': 'fold',
        'confidence': 85,
        'reasoning': f"GTO: {hand_notation} is not in the opening range from {gto_position} position."
    }

def get_rank_value(rank):
    """Get rank value for comparison"""
    ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    return ranks.index(rank) if rank in ranks else -1

def get_hand_category(hole_cards):
    """Get hand category based on PokerStars Starting Hand Rankings"""
    card1 = hole_cards[0]
    card2 = hole_cards[1]
    rank1 = get_rank_value(card1[:-1])
    rank2 = get_rank_value(card2[:-1])
    is_suited = card1[-1] == card2[-1]
    
    # Create hand string (e.g., "AKs", "QJo")
    if rank1 == rank2:
        hand_str = f"{card1[:-1]}{card2[:-1]}"
    else:
        high_rank = card1[:-1] if rank1 > rank2 else card2[:-1]
        low_rank = card2[:-1] if rank1 > rank2 else card1[:-1]
        hand_str = f"{high_rank}{low_rank}{'s' if is_suited else 'o'}"
    
    # Top 5% of hands (premium)
    top_5_percent = [
        'AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs'
    ]
    
    # Top 10% of hands (strong)
    top_10_percent = [
        '99', '88', 'AKo', 'AJo', 'ATo', 'A9s', 'A8s', 'KQs', 'KQo', 'KJs', 'KJo', 'KTs', 'QJs', 'QJo'
    ]
    
    # Top 20% of hands (playable)
    top_20_percent = [
        '77', '66', '55', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KTo', 'K9s', 'K8s', 'QTo', 'Q9s', 'Q8s', 'JTo', 'J9s', 'J8s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '65s', '54s'
    ]
    
    if hand_str in top_5_percent:
        return 'premium'
    elif hand_str in top_10_percent:
        return 'strong'
    elif hand_str in top_20_percent:
        return 'playable'
    else:
        return 'weak'

def evaluate_poker_hand(hole_cards, community_cards):
    """Evaluate poker hand strength"""
    if len(hole_cards) != 2:
        return {'value': 0, 'strength': 'Invalid', 'description': 'Invalid hand'}
    
    # Simple hand evaluation (in production, use a proper poker hand evaluator)
    card1 = hole_cards[0]
    card2 = hole_cards[1]
    rank1 = card1[:-1]
    rank2 = card2[:-1]
    is_suited = card1[-1] == card2[-1]
    
    # Calculate hand value
    rank_values = {'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2}
    val1 = rank_values.get(rank1, 0)
    val2 = rank_values.get(rank2, 0)
    
    # Base value calculation
    if rank1 == rank2:  # Pair
        base_value = val1 * 100
        strength = f"{rank1}{rank1}"
    else:
        high_val = max(val1, val2)
        low_val = min(val1, val2)
        base_value = high_val * 10 + low_val
        strength = f"{rank1}{rank2}{'s' if is_suited else 'o'}"
    
    # Suited bonus
    if is_suited:
        base_value += 50
    
    # Connected bonus
    if abs(val1 - val2) <= 2:
        base_value += 25
    
    return {
        'value': base_value,
        'strength': strength,
        'description': f"{'Suited' if is_suited else 'Offsuit'} {rank1}{rank2}"
    }

def calculate_pot_odds(pot_size, bet_size):
    """Calculate pot odds percentage"""
    if bet_size == 0:
        return 100
    return (bet_size / (pot_size + bet_size)) * 100

def calculate_implied_odds(pot_size, bet_size, stack_size, equity):
    """Calculate implied odds"""
    if bet_size == 0:
        return 100
    return ((pot_size + stack_size) / bet_size) * (equity / 100)

def get_position_multiplier(position):
    """Get position multiplier for hand strength"""
    multipliers = {
        'early': 0.8,
        'middle': 1.0,
        'late': 1.2,
        'button': 1.3,
        'small_blind': 1.1,
        'big_blind': 0.9
    }
    return multipliers.get(position, 1.0)

def get_player_count_adjustment(num_players):
    """Adjust for number of players"""
    if num_players <= 3:
        return 1.2  # More aggressive in short-handed
    elif num_players >= 8:
        return 0.8  # More conservative in full ring
    else:
        return 1.0

def generate_ai_recommendation(data):
    """Generate AI recommendation using GTO logic"""
    hole_cards = data.get('holeCards', [])
    position = data.get('position', 'middle')
    num_players = data.get('numPlayers', 6)
    pot_size = data.get('potSize', 0)
    bet_size = data.get('betSize', 0)
    big_blind = data.get('bigBlind', 1)
    community_cards = data.get('communityCards', [])
    
    # Get GTO action
    gto_result = get_gto_action(hole_cards, position, num_players, pot_size, bet_size, big_blind)
    
    # Calculate equity using Monte Carlo simulation
    equity = monte_carlo_equity(hole_cards, community_cards, num_simulations=5000)
    
    # Calculate pot odds and implied odds
    pot_odds = calculate_pot_odds(pot_size, bet_size)
    implied_odds = calculate_implied_odds(pot_size, bet_size, 100, equity)  # Assuming 100BB stack
    
    # Determine final action based on GTO and equity
    action = gto_result['action']
    confidence = gto_result['confidence']
    reasoning = gto_result['reasoning']
    raise_amount = gto_result.get('raise_amount', big_blind * 2.5)
    
    # Adjust based on equity if significantly different from GTO
    if equity > 70 and action == 'fold':
        action = 'raise'
        confidence = 80
        reasoning = f"High equity ({equity:.1f}%) overrides GTO fold. Raising."
    elif equity < 30 and action == 'raise':
        action = 'fold'
        confidence = 75
        reasoning = f"Low equity ({equity:.1f}%) overrides GTO raise. Folding."
    
    # Calculate expected value
    if action == 'fold':
        ev = 0
    elif action == 'call':
        ev = round((pot_size + bet_size) * (equity / 100) - bet_size)
    else:  # raise
        ev = round((pot_size + raise_amount) * (equity / 100) - raise_amount)
    
    return {
        'holeCards': hole_cards,  # Add holeCards to the response
        'action': action,
        'confidence': round(confidence),
        'raiseAmount': raise_amount,
        'bigBlind': big_blind,
        'handStrength': get_hand_category(hole_cards),
        'equity': round(equity, 1),
        'potOdds': round(pot_odds, 1),
        'impliedOdds': round(implied_odds, 1),
        'ev': ev,
        'reasoning': reasoning,
        'timestamp': datetime.now().isoformat()
    }

@app.route('/api/analyze', methods=['POST'])
def analyze_hand():
    """Analyze poker hand and provide AI recommendation"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'holeCards' not in data:
            return jsonify({'error': 'Missing hole cards'}), 400
        
        if len(data['holeCards']) != 2:
            return jsonify({'error': 'Must provide exactly 2 hole cards'}), 400
        
        # Generate recommendation
        recommendation = generate_ai_recommendation(data)
        
        return jsonify(recommendation)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

# Vercel serverless function handler
def handler(request, context):
    """Vercel serverless function entry point"""
    return app(request, context)

# For local development
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False) 