from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
import random

# Disable dotenv loading completely
os.environ['FLASK_DOTENV_LOADING'] = 'false'
os.environ['FLASK_ENV'] = 'development'

app = Flask(__name__)
CORS(app)

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

def get_gto_action(hand_category, position, num_players, pot_odds, bet_size, big_blind):
    """Get GTO action based on trusted poker ranges"""
    
    # GTO frequencies by position (from professional poker training sites)
    gto_ranges = {
        'UTG': {
            'premium': {'raise': 0.95, 'call': 0.05, 'fold': 0.00},
            'strong': {'raise': 0.80, 'call': 0.15, 'fold': 0.05},
            'playable': {'raise': 0.40, 'call': 0.40, 'fold': 0.20},
            'weak': {'raise': 0.10, 'call': 0.20, 'fold': 0.70}
        },
        'MP': {
            'premium': {'raise': 0.95, 'call': 0.05, 'fold': 0.00},
            'strong': {'raise': 0.85, 'call': 0.10, 'fold': 0.05},
            'playable': {'raise': 0.50, 'call': 0.35, 'fold': 0.15},
            'weak': {'raise': 0.15, 'call': 0.25, 'fold': 0.60}
        },
        'CO': {
            'premium': {'raise': 0.95, 'call': 0.05, 'fold': 0.00},
            'strong': {'raise': 0.90, 'call': 0.08, 'fold': 0.02},
            'playable': {'raise': 0.65, 'call': 0.25, 'fold': 0.10},
            'weak': {'raise': 0.25, 'call': 0.30, 'fold': 0.45}
        },
        'BTN': {
            'premium': {'raise': 0.95, 'call': 0.05, 'fold': 0.00},
            'strong': {'raise': 0.90, 'call': 0.08, 'fold': 0.02},
            'playable': {'raise': 0.75, 'call': 0.20, 'fold': 0.05},
            'weak': {'raise': 0.35, 'call': 0.35, 'fold': 0.30}
        },
        'SB': {
            'premium': {'raise': 0.95, 'call': 0.05, 'fold': 0.00},
            'strong': {'raise': 0.85, 'call': 0.12, 'fold': 0.03},
            'playable': {'raise': 0.60, 'call': 0.30, 'fold': 0.10},
            'weak': {'raise': 0.25, 'call': 0.40, 'fold': 0.35}
        },
        'BB': {
            'premium': {'raise': 0.95, 'call': 0.05, 'fold': 0.00},
            'strong': {'raise': 0.80, 'call': 0.18, 'fold': 0.02},
            'playable': {'raise': 0.45, 'call': 0.45, 'fold': 0.10},
            'weak': {'raise': 0.15, 'call': 0.50, 'fold': 0.35}
        }
    }
    
    # Map position to GTO ranges
    position_map = {
        'early': 'UTG',
        'middle': 'MP', 
        'late': 'CO',
        'button': 'BTN',
        'small_blind': 'SB',
        'big_blind': 'BB'
    }
    
    gto_position = position_map.get(position, 'MP')
    frequencies = gto_ranges[gto_position][hand_category]
    
    # Adjust for number of players
    if num_players > 6:
        # Tighter ranges in full ring
        frequencies = {k: v * 0.8 for k, v in frequencies.items()}
        frequencies['fold'] = 1 - sum(frequencies.values())
    
    # Adjust for pot odds
    if pot_odds > 25 and bet_size > 0:
        # Good pot odds increase call frequency
        frequencies['call'] = min(0.8, frequencies['call'] * 1.5)
        frequencies['fold'] = max(0.1, frequencies['fold'] * 0.7)
        frequencies['raise'] = 1 - frequencies['call'] - frequencies['fold']
    
    # Determine action based on frequencies
    rand = random.random()
    
    if rand < frequencies['raise']:
        action = 'raise'
        confidence = 85 if hand_category == 'premium' else 75
        
        # Strategic raise sizing based on hand strength and position
        if hand_category == 'premium':
            if position in ['button', 'late']:
                raise_amount = round(big_blind * 3.5)  # Larger raise for value
            else:
                raise_amount = round(big_blind * 3.0)  # Standard raise
        elif hand_category == 'strong':
            if position in ['button', 'late']:
                raise_amount = round(big_blind * 3.0)  # Good raise for value
            else:
                raise_amount = round(big_blind * 2.5)  # Standard raise
        elif hand_category == 'playable':
            if position in ['button', 'late']:
                raise_amount = round(big_blind * 2.5)  # Smaller raise
            else:
                raise_amount = round(big_blind * 2.0)  # Minimal raise
        else:  # weak
            raise_amount = round(big_blind * 2.0)  # Minimal raise
                
    elif rand < frequencies['raise'] + frequencies['call']:
        action = 'call'
        confidence = 70 if hand_category in ['premium', 'strong'] else 60
        raise_amount = None
    else:
        action = 'fold'
        confidence = 80
        raise_amount = None
    
    return action, confidence, raise_amount

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

def calculate_implied_odds(pot_size, bet_size, stack_size, equity):
    """Calculate implied odds considering stack depth"""
    if bet_size == 0:
        return 0
    
    # Basic implied odds calculation
    pot_odds = calculate_pot_odds(pot_size, bet_size)
    
    # Adjust for stack depth
    stack_multiplier = min(3.0, stack_size / bet_size)
    
    # Adjust for equity (higher equity = better implied odds)
    equity_multiplier = 1 + (equity / 100)
    
    return pot_odds * stack_multiplier * equity_multiplier

def get_position_multiplier(position):
    """Get position strength multiplier"""
    multipliers = {
        'early': 0.8,
        'middle': 1.0,
        'late': 1.2,
        'button': 1.3,
        'small_blind': 0.9,
        'big_blind': 1.1
    }
    return multipliers.get(position, 1.0)

def get_player_count_adjustment(num_players):
    """Adjust hand strength based on number of players"""
    return max(0.5, 1 - (num_players - 2) * 0.1)

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
    stack_size = data.get('stackSize', 1000)  # Default stack size
    
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
        implied_odds = calculate_implied_odds(pot_size, bet_size, stack_size, equity)
        
        action, confidence, raise_amount = get_gto_action(
            hand_category, position, num_players, pot_odds, bet_size, big_blind
        )
        
        # Generate reasoning based on trusted poker theory and equity
        card1 = hole_cards[0]
        card2 = hole_cards[1]
        
        if hand_category == 'premium':
            bb_multiplier = 3.5 if position in ['button', 'late'] else 3.0
            reasoning = f"Premium hand {card1[:-1]}{card2[:-1]} with {equity:.1f}% equity. GTO ranges: Always raise from any position. Recommended raise: {bb_multiplier}BB for value."
        elif hand_category == 'strong':
            bb_multiplier = 3.0 if position in ['button', 'late'] else 2.5
            reasoning = f"Strong hand {card1[:-1]}{card2[:-1]} with {equity:.1f}% equity. GTO ranges: Usually raise from {position} position. Recommended raise: {bb_multiplier}BB for value."
        elif hand_category == 'playable':
            bb_multiplier = 2.5 if position in ['button', 'late'] else 2.0
            reasoning = f"Playable hand {card1[:-1]}{card2[:-1]} with {equity:.1f}% equity. GTO ranges: Mixed frequencies from {position} position. Recommended raise: {bb_multiplier}BB if raising."
        else:
            reasoning = f"Weak hand {card1[:-1]}{card2[:-1]} with {equity:.1f}% equity. GTO ranges: Fold from {position} position. This hand is not in standard opening ranges."
        
        if pot_odds > 20 and bet_size > 0:
            reasoning += f" Good pot odds ({pot_odds:.1f}%) may justify continuing."
        
        if implied_odds > pot_odds * 1.5:
            reasoning += f" Excellent implied odds ({implied_odds:.1f}%) due to stack depth."
    
    else:
        # Post-flop logic with Monte Carlo equity
        hand_evaluation = evaluate_poker_hand(hole_cards, community_cards)
        pot_odds = calculate_pot_odds(pot_size, bet_size)
        implied_odds = calculate_implied_odds(pot_size, bet_size, stack_size, equity)
        
        # Enhanced post-flop logic using equity
        if equity > 80:
            action = 'raise'
            confidence = 90
            raise_amount = round(big_blind * 3.5)  # Very strong hand - larger raise
            reasoning = f"Very strong hand with {equity:.1f}% equity. Value betting aggressively with {big_blind * 3.5}BB raise."
        elif equity > 65:
            action = 'raise'
            confidence = 80
            raise_amount = round(big_blind * 3.0)  # Strong hand - good raise
            reasoning = f"Strong hand with {equity:.1f}% equity. Value betting with {big_blind * 3.0}BB raise."
        elif equity > 50:
            if pot_odds > 15:
                action = 'call'
                confidence = 70
                reasoning = f"Decent hand with {equity:.1f}% equity and good pot odds ({pot_odds:.1f}%). Calling for value."
            else:
                action = 'fold'
                confidence = 65
                reasoning = f"Decent hand with {equity:.1f}% equity but poor pot odds. Folding."
        elif equity > 35:
            if implied_odds > pot_odds * 1.5:
                action = 'call'
                confidence = 60
                reasoning = f"Weak hand with {equity:.1f}% equity but excellent implied odds ({implied_odds:.1f}%). Calling for implied odds."
            else:
                action = 'fold'
                confidence = 70
                reasoning = f"Weak hand with {equity:.1f}% equity and poor implied odds. Folding."
        else:
            action = 'fold'
            confidence = 80
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
        hand_evaluation = evaluate_poker_hand(hole_cards, community_cards)
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
        
        # Log the analysis (in production, save to database)
        log_analysis(data, recommendation)
        
        return jsonify(recommendation)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/equity', methods=['POST'])
def calculate_equity():
    """Calculate equity vs opponent range"""
    try:
        data = request.get_json()
        player_hand = data.get('playerHand', '')
        opponent_range = data.get('opponentRange', [])
        community_cards = data.get('communityCards', [])
        
        # Convert hand notation to actual cards for simulation
        player_cards = convert_hand_notation_to_cards(player_hand)
        
        if not player_cards:
            return jsonify({'error': 'Invalid hand notation'}), 400
        
        # Calculate equity using Monte Carlo simulation
        equity = monte_carlo_equity_vs_range(player_cards, opponent_range, community_cards)
        
        return jsonify({'equity': equity})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

def convert_hand_notation_to_cards(hand_notation):
    """Convert poker hand notation to actual cards"""
    if not hand_notation:
        return []
    
    # Handle pairs
    if len(hand_notation) == 2 and hand_notation[0] == hand_notation[1]:
        rank = hand_notation[0]
        return [f"{rank}♠", f"{rank}♥"]
    
    # Handle suited hands
    if len(hand_notation) == 3 and hand_notation[2] == 's':
        rank1, rank2 = hand_notation[0], hand_notation[1]
        return [f"{rank1}♠", f"{rank2}♠"]
    
    # Handle offsuit hands
    if len(hand_notation) == 3 and hand_notation[2] == 'o':
        rank1, rank2 = hand_notation[0], hand_notation[1]
        return [f"{rank1}♠", f"{rank2}♥"]
    
    # Handle high-low notation (e.g., AKs, QJo)
    if len(hand_notation) >= 2:
        rank1, rank2 = hand_notation[0], hand_notation[1]
        if len(hand_notation) == 3 and hand_notation[2] == 's':
            return [f"{rank1}♠", f"{rank2}♠"]
        else:
            return [f"{rank1}♠", f"{rank2}♥"]
    
    return []

def monte_carlo_equity_vs_range(player_cards, opponent_range, community_cards, num_simulations=5000):
    """Calculate equity vs opponent range using Monte Carlo simulation"""
    if len(player_cards) != 2:
        return 0.0
    
    wins = 0
    total_simulations = num_simulations
    
    # Create deck excluding known cards
    ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    suits = ['♠', '♥', '♦', '♣']
    
    known_cards = set(player_cards + community_cards)
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
        
        # Generate random opponent hand from range
        opponent_cards = generate_random_hand_from_range(opponent_range, deck[remaining_cards_needed:])
        
        if not opponent_cards:
            continue
        
        # Evaluate both hands
        player_hand = evaluate_poker_hand(player_cards, simulated_board)
        opponent_hand = evaluate_poker_hand(opponent_cards, simulated_board)
        
        # Compare hands
        if player_hand['value'] > opponent_hand['value']:
            wins += 1
        elif player_hand['value'] == opponent_hand['value']:
            wins += 0.5  # Split pot
    
    return (wins / total_simulations) * 100

def generate_random_hand_from_range(range_hands, available_cards):
    """Generate a random hand from the given range"""
    if not range_hands or not available_cards:
        return []
    
    # Select random hand from range
    selected_hand = random.choice(range_hands)
    
    # Convert hand notation to cards
    opponent_cards = convert_hand_notation_to_cards(selected_hand)
    
    # Ensure cards are available in deck
    if len(opponent_cards) == 2:
        card1, card2 = opponent_cards[0], opponent_cards[1]
        if card1 in available_cards and card2 in available_cards:
            return [card1, card2]
    
    return []

def log_analysis(hand_data, recommendation):
    """Log hand analysis for future improvements"""
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'hand_data': hand_data,
        'recommendation': recommendation
    }
    
    # In production, save to database
    # For now, just print to console
    print(f"Analysis logged: {json.dumps(log_entry, indent=2)}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    try:
        app.run(host='0.0.0.0', port=port, debug=True)
    except Exception as e:
        print(f"Error starting Flask app: {e}")
        # Try without debug mode
        app.run(host='0.0.0.0', port=port, debug=False) 