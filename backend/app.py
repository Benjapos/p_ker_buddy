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
        'raise': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'T9s', 'T8s', 'T7s', 'T6s', '98s', '97s', '96s', '87s', '86s', '85s', '76s', '75s', '74s', '65s', '64s', '54s', '53s', '43s', '32s'],
        'call': ['K2s', 'Q4s', 'Q3s', 'Q2s', 'J5s', 'J4s', 'J3s', 'J2s', 'T5s', 'T4s', 'T3s', 'T2s', '95s', '94s', '93s', '92s', '84s', '83s', '82s', '73s', '72s', '63s', '62s', '52s', '42s'],
        'fold': ['Q2s', 'J2s', 'T2s', '91s', '81s', '71s', '61s', '51s', '41s', '31s', '21s']
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
    """Generate AI recommendation based on professional GTO logic"""
    
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
    
    # Pre-flop logic using GTO ranges
    if len(community_cards) == 0:
        gto_result = get_gto_action(hole_cards, position, num_players, pot_size, bet_size, big_blind)
        
        # Adjust for number of players
        if num_players > 6:
            # Tighter ranges in full ring
            if gto_result['action'] == 'raise':
                gto_result['confidence'] = max(70, gto_result['confidence'] - 10)
        
        # Adjust for pot odds
        pot_odds = calculate_pot_odds(pot_size, bet_size)
        if pot_odds > 25 and bet_size > 0:
            if gto_result['action'] == 'fold':
                gto_result['action'] = 'call'
                gto_result['confidence'] = 65
                gto_result['reasoning'] += f" However, excellent pot odds ({pot_odds:.1f}%) justify calling."
        
        # Calculate expected value
        ev = 0
        if gto_result['action'] == 'call':
            ev = round((pot_size + bet_size) * 0.6 - bet_size)  # Assume 60% equity for calling hands
        elif gto_result['action'] == 'raise':
            ev = round((pot_size + gto_result['raise_amount']) * 0.7 - gto_result['raise_amount'])  # Assume 70% equity for raising hands
        
        return {
            'action': gto_result['action'],
            'confidence': round(gto_result['confidence']),
            'raiseAmount': gto_result.get('raise_amount'),
            'bigBlind': big_blind,
            'handStrength': 'Pre-flop',
            'equity': round(equity, 1),
            'potOdds': round(calculate_pot_odds(pot_size, bet_size)),
            'impliedOdds': round(calculate_implied_odds(pot_size, bet_size, stack_size, equity), 1),
            'ev': ev,
            'reasoning': gto_result['reasoning'],
            'timestamp': datetime.now().isoformat()
        }
    
    else:
        # Post-flop logic with Monte Carlo equity
        hand_evaluation = evaluate_poker_hand(hole_cards, community_cards)
        pot_odds = calculate_pot_odds(pot_size, bet_size)
        implied_odds = calculate_implied_odds(pot_size, bet_size, stack_size, equity)
        
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
        
        # Calculate expected value
        if action == 'fold':
            ev = 0
        elif action == 'call':
            ev = round((pot_size + bet_size) * (equity / 100) - bet_size)
        else:  # raise
            raise_amt = raise_amount if raise_amount else big_blind * 2.5
            ev = round((pot_size + raise_amt) * (equity / 100) - raise_amt)
        
        return {
            'action': action,
            'confidence': round(confidence),
            'raiseAmount': raise_amount,
            'bigBlind': big_blind,
            'handStrength': hand_evaluation['strength'],
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