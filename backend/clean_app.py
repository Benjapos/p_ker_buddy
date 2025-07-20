from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
import random

# Create Flask app without any dotenv loading
app = Flask(__name__)
CORS(app)

# Copy the core functions from app.py
def get_rank_value(rank):
    """Get rank value for comparison"""
    ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    return ranks.index(rank) if rank in ranks else -1

def evaluate_poker_hand(hole_cards, community_cards):
    """Evaluate poker hand strength (simplified without treys)"""
    try:
        if len(hole_cards) != 2:
            return {"strength": "Invalid Hole Cards", "value": 0}
        
        # Pre-flop evaluation
        if len(community_cards) == 0:
            return {"strength": "Pre-flop", "value": 0}
        
        # Post-flop evaluation (simplified)
        all_cards = hole_cards + community_cards
        if len(all_cards) < 5:
            return {"strength": "Incomplete", "value": 0}
        
        # Simple hand strength calculation
        ranks = [card[:-1] for card in all_cards]
        suits = [card[-1] for card in all_cards]
        
        # Count ranks
        rank_counts = {}
        for rank in ranks:
            rank_counts[rank] = rank_counts.get(rank, 0) + 1
        
        # Count suits
        suit_counts = {}
        for suit in suits:
            suit_counts[suit] = suit_counts.get(suit, 0) + 1
        
        # Determine hand type
        max_rank_count = max(rank_counts.values()) if rank_counts else 0
        max_suit_count = max(suit_counts.values()) if suit_counts else 0
        
        # Check for flush
        is_flush = max_suit_count >= 5
        
        # Check for straight (simplified)
        rank_values = [get_rank_value(rank) for rank in ranks]
        rank_values.sort()
        is_straight = False
        for i in range(len(rank_values) - 4):
            if rank_values[i+4] - rank_values[i] == 4:
                is_straight = True
                break
        
        # Determine hand strength
        if is_flush and is_straight:
            return {"strength": "Straight Flush", "value": 8}
        elif max_rank_count >= 4:
            return {"strength": "Four of a Kind", "value": 7}
        elif max_rank_count >= 3 and len([v for v in rank_counts.values() if v >= 2]) >= 2:
            return {"strength": "Full House", "value": 6}
        elif is_flush:
            return {"strength": "Flush", "value": 5}
        elif is_straight:
            return {"strength": "Straight", "value": 4}
        elif max_rank_count >= 3:
            return {"strength": "Three of a Kind", "value": 3}
        elif len([v for v in rank_counts.values() if v >= 2]) >= 2:
            return {"strength": "Two Pair", "value": 2}
        elif max_rank_count >= 2:
            return {"strength": "Pair", "value": 1}
        else:
            return {"strength": "High Card", "value": 0}
            
    except Exception as e:
        print(f"Error evaluating hand: {e}")
        return {"strength": "Evaluation Error", "value": 0}

def calculate_pot_odds(pot_size, bet_size):
    """Calculate pot odds percentage"""
    if bet_size == 0:
        return 0
    return (pot_size / bet_size) * 100

def monte_carlo_equity(hole_cards, community_cards, num_simulations=5000):
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
    playable_hands = [
        '77', '66', '55', '44', '33', '22',
        'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o',
        'KTo', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
        'QTs', 'QTo', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s',
        'JTs', 'JTo', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s',
        'T9s', 'T8s', 'T7s', 'T6s', 'T5s', 'T4s', 'T3s', 'T2s',
        '98s', '97s', '96s', '95s', '94s', '93s', '92s',
        '87s', '86s', '85s', '84s', '83s', '82s',
        '76s', '75s', '74s', '73s', '72s',
        '65s', '64s', '63s', '62s',
        '54s', '53s', '52s',
        '43s', '42s',
        '32s'
    ]
    
    if hand_str in top_5_percent:
        return 'premium'
    elif hand_str in top_10_percent:
        return 'strong'
    elif hand_str in playable_hands:
        return 'playable'
    else:
        return 'weak'

def generate_ai_recommendation(data):
    """Generate AI recommendation based on trusted poker logic with Monte Carlo simulation"""
    
    hole_cards = data.get('holeCards', [])
    flop = data.get('flop', [])
    turn = data.get('turn')
    river = data.get('river')
    num_players = data.get('numPlayers', 6)
    position = data.get('position', 'middle')
    pot_size = data.get('potSize', 100)
    bet_size = data.get('betSize', 0)
    small_blind = data.get('smallBlind', 1)
    big_blind = data.get('bigBlind', 2)
    stack_size = data.get('stackSize', 1000)
    
    # Combine community cards
    community_cards = flop.copy()
    if turn:
        community_cards.append(turn)
    if river:
        community_cards.append(river)
    
    # Calculate equity using Monte Carlo simulation
    equity = monte_carlo_equity(hole_cards, community_cards, num_simulations=5000)
    
    # Pre-flop logic using trusted ranges
    if len(community_cards) == 0:
        hand_category = get_hand_category(hole_cards)
        pot_odds = calculate_pot_odds(pot_size, bet_size)
        
        # Simple GTO logic
        if hand_category == 'premium':
            action = 'raise'
            confidence = 85
            raise_amount = round(big_blind * 3.0)
            reasoning = f"Premium hand {hole_cards[0][:-1]}{hole_cards[1][:-1]} with {equity:.1f}% equity. Always raise from any position."
        elif hand_category == 'strong':
            action = 'raise'
            confidence = 75
            raise_amount = round(big_blind * 2.5)
            reasoning = f"Strong hand {hole_cards[0][:-1]}{hole_cards[1][:-1]} with {equity:.1f}% equity. Usually raise from {position} position."
        elif hand_category == 'playable':
            if position in ['button', 'late']:
                action = 'raise'
                confidence = 60
                raise_amount = round(big_blind * 2.0)
                reasoning = f"Playable hand {hole_cards[0][:-1]}{hole_cards[1][:-1]} with {equity:.1f}% equity. Raise from late position."
            else:
                action = 'fold'
                confidence = 70
                raise_amount = None
                reasoning = f"Playable hand {hole_cards[0][:-1]}{hole_cards[1][:-1]} with {equity:.1f}% equity. Fold from early position."
        else:
            action = 'fold'
            confidence = 80
            raise_amount = None
            reasoning = f"Weak hand {hole_cards[0][:-1]}{hole_cards[1][:-1]} with {equity:.1f}% equity. Fold from {position} position."
    
    else:
        # Post-flop logic with Monte Carlo equity
        hand_evaluation = evaluate_poker_hand(hole_cards, community_cards)
        pot_odds = calculate_pot_odds(pot_size, bet_size)
        
        # Enhanced post-flop logic using equity
        if equity > 80:
            action = 'raise'
            confidence = 90
            raise_amount = round(big_blind * 3.5)
            reasoning = f"Very strong hand with {equity:.1f}% equity. Value betting aggressively."
        elif equity > 65:
            action = 'raise'
            confidence = 80
            raise_amount = round(big_blind * 3.0)
            reasoning = f"Strong hand with {equity:.1f}% equity. Value betting."
        elif equity > 50:
            if pot_odds > 15:
                action = 'call'
                confidence = 70
                raise_amount = None
                reasoning = f"Decent hand with {equity:.1f}% equity and good pot odds ({pot_odds:.1f}%). Calling for value."
            else:
                action = 'fold'
                confidence = 65
                raise_amount = None
                reasoning = f"Decent hand with {equity:.1f}% equity but poor pot odds. Folding."
        elif equity > 35:
            action = 'fold'
            confidence = 70
            raise_amount = None
            reasoning = f"Weak hand with {equity:.1f}% equity. Folding."
        else:
            action = 'fold'
            confidence = 80
            raise_amount = None
            reasoning = f"Very weak hand with {equity:.1f}% equity. Folding."
    
    # Calculate expected value using equity
    if action == 'fold':
        ev = 0
    elif action == 'call':
        ev = round((pot_size + bet_size) * (equity / 100) - bet_size)
    else:  # raise
        raise_amt = raise_amount if raise_amount else big_blind * 2.5
        ev = round((pot_size + raise_amt) * (equity / 100) - raise_amt)
    
    # Determine hand strength for return value
    if len(community_cards) > 0:
        hand_strength = hand_evaluation['strength']
    else:
        hand_strength = 'Pre-flop'
    
    return {
        'action': action,
        'confidence': round(confidence),
        'raiseAmount': raise_amount,
        'bigBlind': big_blind,
        'handStrength': hand_strength,
        'equity': round(equity, 1),
        'potOdds': round(calculate_pot_odds(pot_size, bet_size)),
        'ev': ev,
        'reasoning': reasoning,
        'timestamp': datetime.now().isoformat()
    }

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting P_Ker Buddy backend on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False) 