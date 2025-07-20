// Poker Logic for Texas Hold'em AI Advisor
// Note: Backend uses treys library for accurate hand evaluation
// This frontend logic provides real-time analysis while backend validates with treys

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['♠', '♥', '♦', '♣'];

// Texas Hold'em hand rankings from lowest to highest
const HAND_RANKINGS = [
  'High Card',
  'Pair',
  'Two Pair',
  'Three of a Kind',
  'Straight',
  'Flush',
  'Full House',
  'Four of a Kind',
  'Straight Flush',
  'Royal Flush'
];

// Parse card string to rank and suit
const parseCard = (cardStr) => {
  const suit = cardStr.slice(-1);
  const rank = cardStr.slice(0, -1);
  return { rank, suit };
};

// Get numeric value of rank
const getRankValue = (rank) => {
  return RANKS.indexOf(rank);
};

// Evaluate Texas Hold'em hand strength
const evaluateHand = (holeCards, communityCards) => {
  const allCards = [...holeCards, ...communityCards];
  if (allCards.length < 5) return { strength: 'Incomplete', value: 0 };

  // Convert cards to rank/suit objects
  const cards = allCards.map(parseCard);
  
  // Count ranks and suits
  const rankCounts = {};
  const suitCounts = {};
  
  cards.forEach(card => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  });

  // Check for flush
  const flushSuit = Object.keys(suitCounts).find(suit => suitCounts[suit] >= 5);
  
  // Check for straight
  const sortedRanks = Object.keys(rankCounts).sort((a, b) => getRankValue(a) - getRankValue(b));
  let isStraight = false;
  let straightHigh = 0;
  
  for (let i = 0; i <= sortedRanks.length - 5; i++) {
    const startRank = sortedRanks[i];
    const startValue = getRankValue(startRank);
    let consecutive = 1;
    
    for (let j = 1; j < 5; j++) {
      const expectedRank = RANKS[startValue + j];
      if (rankCounts[expectedRank]) {
        consecutive++;
      } else {
        break;
      }
    }
    
    if (consecutive === 5) {
      isStraight = true;
      straightHigh = startValue + 4;
      break;
    }
  }

  // Special case: Ace-low straight (A-2-3-4-5)
  if (!isStraight && rankCounts['A'] && rankCounts['2'] && rankCounts['3'] && rankCounts['4'] && rankCounts['5']) {
    isStraight = true;
    straightHigh = 3; // 5 is the high card
  }

  // Determine hand type
  const rankValues = Object.values(rankCounts).sort((a, b) => b - a);
  const uniqueRanks = Object.keys(rankCounts).length;

  let handType = 'High Card';
  let handValue = 0;

  if (flushSuit && isStraight) {
    handType = straightHigh === 12 ? 'Royal Flush' : 'Straight Flush';
    handValue = 8 + straightHigh / 13;
  } else if (rankValues[0] === 4) {
    handType = 'Four of a Kind';
    handValue = 7;
  } else if (rankValues[0] === 3 && rankValues[1] === 2) {
    handType = 'Full House';
    handValue = 6;
  } else if (flushSuit) {
    handType = 'Flush';
    handValue = 5;
  } else if (isStraight) {
    handType = 'Straight';
    handValue = 4;
  } else if (rankValues[0] === 3) {
    handType = 'Three of a Kind';
    handValue = 3;
  } else if (rankValues[0] === 2 && rankValues[1] === 2) {
    handType = 'Two Pair';
    handValue = 2;
  } else if (rankValues[0] === 2) {
    handType = 'Pair';
    handValue = 1;
  }

  return { strength: handType, value: handValue };
};

// Calculate pot odds for Texas Hold'em
const calculatePotOdds = (potSize, betSize) => {
  if (betSize === 0) return 0;
  return (potSize / betSize) * 100;
};

// GTO-based position strength multipliers
const getPositionMultiplier = (position) => {
  const multipliers = {
    'early': 0.75,     // UTG, UTG+1 - GTO: tight range, value-heavy
    'middle': 0.95,    // MP, MP+1 - GTO: balanced range
    'late': 1.15,      // CO, HJ - GTO: wider range, more bluffs
    'button': 1.25,    // BTN - GTO: widest range, aggressive
    'small_blind': 0.85, // SB - GTO: polarized range
    'big_blind': 1.05  // BB - GTO: wider defending range
  };
  return multipliers[position] || 1.0;
};

// Player count adjustment for Texas Hold'em
const getPlayerCountAdjustment = (numPlayers) => {
  return Math.max(0.5, 1 - (numPlayers - 2) * 0.1);
};

// GTO-based hand strength adjustments
const getHandStrengthAdjustment = (holeCards, communityCards) => {
  if (communityCards.length === 0) {
    // Pre-flop GTO hand strength
    const card1 = parseCard(holeCards[0]);
    const card2 = parseCard(holeCards[1]);
    const rank1 = getRankValue(card1.rank);
    const rank2 = getRankValue(card2.rank);
    const isSuited = card1.suit === card2.suit;
    const isConnected = Math.abs(rank1 - rank2) <= 2;
    
    // GTO Premium hands (always play)
    if (rank1 === 12 && rank2 === 12) return 1.0; // AA
    if (rank1 === 11 && rank2 === 11) return 0.98; // KK
    if (rank1 === 10 && rank2 === 10) return 0.95; // QQ
    if (rank1 === 9 && rank2 === 9) return 0.92; // JJ
    if (rank1 === 8 && rank2 === 8) return 0.88; // TT
    
    // GTO Broadway hands
    if ((rank1 === 12 && rank2 === 11) || (rank1 === 11 && rank2 === 12)) return 0.93; // AK
    if ((rank1 === 12 && rank2 === 10) || (rank1 === 10 && rank2 === 12)) return 0.90; // AQ
    if ((rank1 === 12 && rank2 === 9) || (rank1 === 9 && rank2 === 12)) return 0.87; // AJ
    if ((rank1 === 11 && rank2 === 10) || (rank1 === 10 && rank2 === 11)) return 0.85; // KQ
    
    // GTO Suited connectors (position dependent) - Much more realistic
    if (isSuited && isConnected) {
      if (Math.max(rank1, rank2) >= 9) return 0.85; // Premium suited connectors (JT, QT, KT, J9, Q9, etc.)
      if (Math.max(rank1, rank2) >= 8) return 0.80; // High suited connectors (T9, J8, Q8, etc.)
      if (Math.max(rank1, rank2) >= 7) return 0.75; // Medium-high suited connectors (98, T8, J7, etc.)
      if (Math.max(rank1, rank2) >= 6) return 0.70; // Medium suited connectors (87, 97, T7, etc.)
      return 0.65; // Low suited connectors (increased significantly)
    }
    
    // GTO Pairs
    if (rank1 === rank2) {
      if (rank1 >= 7) return 0.82; // High pairs
      if (rank1 >= 5) return 0.75; // Medium pairs
      return 0.65; // Low pairs
    }
    
    // GTO Offsuit broadway - Much more realistic
    if (rank1 >= 12 && rank2 >= 9) return 0.80; // A9+, A8+, etc.
    if (rank1 >= 11 && rank2 >= 10) return 0.75; // KQ, KJ, etc.
    if (rank1 >= 10 && rank2 >= 10) return 0.70; // QJ, QT, etc.
    if (rank1 >= 9 && rank2 >= 9) return 0.65; // JT, J9, etc.
    
    return 0.45; // GTO: fold most other hands
  }
  
  // Post-flop hand strength adjustments
  const handEvaluation = evaluateHand(holeCards, communityCards);
  
  // Boost top pair with good kicker significantly
  if (handEvaluation.strength === 'Pair') {
    const card1 = parseCard(holeCards[0]);
    const card2 = parseCard(holeCards[1]);
    const rank1 = getRankValue(card1.rank);
    const rank2 = getRankValue(card2.rank);
    
    // Check if we have top pair with good kicker
    const communityRanks = communityCards.map(card => getRankValue(parseCard(card).rank));
    const maxCommunityRank = Math.max(...communityRanks);
    
    // If we have top pair (one of our cards matches the highest community card)
    if (rank1 === maxCommunityRank || rank2 === maxCommunityRank) {
      const kickerRank = rank1 === maxCommunityRank ? rank2 : rank1;
      
      // Top pair with good kicker (J or better)
      if (kickerRank >= 9) return 1.3; // Strong top pair
      // Top pair with medium kicker (8-10)
      if (kickerRank >= 8) return 1.2; // Decent top pair
      // Top pair with weak kicker
      return 1.1; // Weak top pair but still playable
    }
    
    // Second pair or worse
    return 0.8;
  }
  
  // Boost other strong hands
  if (handEvaluation.strength === 'Two Pair') return 1.4;
  if (handEvaluation.strength === 'Three of a Kind') return 1.5;
  if (handEvaluation.strength === 'Straight') return 1.6;
  if (handEvaluation.strength === 'Flush') return 1.7;
  if (handEvaluation.strength === 'Full House') return 1.8;
  if (handEvaluation.strength === 'Four of a Kind') return 1.9;
  if (handEvaluation.strength === 'Straight Flush') return 2.0;
  
  return 1.0; // Default adjustment
};

// Generate Texas Hold'em specific AI recommendation
const generateRecommendation = (handData) => {
  const {
    holeCards,
    flop,
    turn,
    river,
    numPlayers,
    position,
    potSize,
    betSize,
    smallBlind,
    bigBlind
  } = handData;

  const communityCards = [...flop, ...(turn ? [turn] : []), ...(river ? [river] : [])];
  const handEvaluation = evaluateHand(holeCards, communityCards);
  
  // Base hand strength (0-1)
  let baseStrength = handEvaluation.value / 8;
  
  // Apply Texas Hold'em specific adjustments
  const positionMultiplier = getPositionMultiplier(position);
  const playerAdjustment = getPlayerCountAdjustment(numPlayers);
  const handStrengthAdjustment = getHandStrengthAdjustment(holeCards, communityCards);
  
  // Calculate pot odds
  const potOdds = calculatePotOdds(potSize, betSize);
  
  // Calculate effective stack sizes and blind-based adjustments
  const effectiveStack = Math.min(potSize * 2, 100); // Simplified stack estimation
  const blindRatio = bigBlind > 0 ? smallBlind / bigBlind : 0.5;
  
  // Blind-based position adjustments
  let blindAdjustment = 1.0;
  if (position === 'small_blind') {
    blindAdjustment = 0.9; // SB is slightly weaker due to forced bet
  } else if (position === 'big_blind') {
    blindAdjustment = 1.1; // BB can defend with better odds
  }
  
  // Final adjusted strength
  const adjustedStrength = baseStrength * positionMultiplier * playerAdjustment * handStrengthAdjustment * blindAdjustment;
  
  // Completely rewritten decision logic - Much more realistic
  let action = 'fold';
  let confidence = 0;
  let raiseAmount = 0;
  let reasoning = '';
  
  // Pre-flop specific logic (when no community cards)
  if (communityCards.length === 0) {
    const card1 = parseCard(holeCards[0]);
    const card2 = parseCard(holeCards[1]);
    const rank1 = getRankValue(card1.rank);
    const rank2 = getRankValue(card2.rank);
    const isSuited = card1.suit === card2.suit;
    const isConnected = Math.abs(rank1 - rank2) <= 2;
    const maxRank = Math.max(rank1, rank2);
    const minRank = Math.min(rank1, rank2);
    
    // Premium hands - Always raise
    if (rank1 === rank2 && rank1 >= 10) { // TT+
      action = 'raise';
      confidence = 95;
      raiseAmount = Math.round(bigBlind * 3);
      reasoning = `Premium pair ${card1.rank}${card2.rank}. Always raising for value.`;
    }
    // Strong pairs
    else if (rank1 === rank2 && rank1 >= 7) { // 77-99
      action = 'raise';
      confidence = 85;
      raiseAmount = Math.round(bigBlind * 2.5);
      reasoning = `Strong pair ${card1.rank}${card2.rank}. Raising for value.`;
    }
    // Medium pairs
    else if (rank1 === rank2 && rank1 >= 5) { // 55-66
      if (position === 'button' || position === 'late') {
        action = 'raise';
        confidence = 75;
        raiseAmount = Math.round(bigBlind * 2.5);
        reasoning = `Medium pair ${card1.rank}${card2.rank} in good position. Raising.`;
      } else {
        action = 'call';
        confidence = 70;
        reasoning = `Medium pair ${card1.rank}${card2.rank}. Calling to see flop.`;
      }
    }
    // Premium suited connectors
    else if (isSuited && isConnected && maxRank >= 9) { // JTs, QTs, KTs, etc.
      if (position === 'button' || position === 'late') {
        action = 'raise';
        confidence = 80;
        raiseAmount = Math.round(bigBlind * 2.5);
        reasoning = `Premium suited connector ${card1.rank}${card2.rank}s in good position. Raising.`;
      } else {
        action = 'call';
        confidence = 75;
        reasoning = `Premium suited connector ${card1.rank}${card2.rank}s. Calling to see flop.`;
      }
    }
    // High suited connectors
    else if (isSuited && isConnected && maxRank >= 8) { // T9s, J9s, etc.
      if (position === 'button' || position === 'late') {
        action = 'raise';
        confidence = 70;
        raiseAmount = Math.round(bigBlind * 2.5);
        reasoning = `High suited connector ${card1.rank}${card2.rank}s in good position. Raising.`;
      } else {
        action = 'call';
        confidence = 65;
        reasoning = `High suited connector ${card1.rank}${card2.rank}s. Calling to see flop.`;
      }
    }
    // Broadway hands
    else if (maxRank >= 12 && minRank >= 9) { // AK, AQ, AJ, KQ, etc.
      if (position === 'button' || position === 'late') {
        action = 'raise';
        confidence = 85;
        raiseAmount = Math.round(bigBlind * 2.5);
        reasoning = `Broadway hand ${card1.rank}${card2.rank} in good position. Raising.`;
      } else {
        action = 'call';
        confidence = 80;
        reasoning = `Broadway hand ${card1.rank}${card2.rank}. Calling to see flop.`;
      }
    }
    // Medium suited connectors
    else if (isSuited && isConnected && maxRank >= 7) { // 98s, 87s, etc.
      if (position === 'button' || position === 'late') {
        action = 'call';
        confidence = 60;
        reasoning = `Medium suited connector ${card1.rank}${card2.rank}s in good position. Calling.`;
      } else {
        action = 'fold';
        confidence = 70;
        reasoning = `Medium suited connector ${card1.rank}${card2.rank}s in bad position. Folding.`;
      }
    }
    // Small pairs
    else if (rank1 === rank2 && rank1 < 5) { // 22-44
      if (position === 'button' || position === 'late') {
        action = 'call';
        confidence = 55;
        reasoning = `Small pair ${card1.rank}${card2.rank} in good position. Calling.`;
      } else {
        action = 'fold';
        confidence = 75;
        reasoning = `Small pair ${card1.rank}${card2.rank} in bad position. Folding.`;
      }
    }
    // Everything else - fold
    else {
      action = 'fold';
      confidence = 80;
      reasoning = `Weak hand ${card1.rank}${card2.rank}. Folding.`;
    }
  }
  // Post-flop logic (when community cards exist)
  else {
    // Special handling for top pair with good kicker
    if (handEvaluation.strength === 'Pair') {
      const card1 = parseCard(holeCards[0]);
      const card2 = parseCard(holeCards[1]);
      const rank1 = getRankValue(card1.rank);
      const rank2 = getRankValue(card2.rank);
      
      // Check if we have top pair with good kicker
      const communityRanks = communityCards.map(card => getRankValue(parseCard(card).rank));
      const maxCommunityRank = Math.max(...communityRanks);
      
      if (rank1 === maxCommunityRank || rank2 === maxCommunityRank) {
        const kickerRank = rank1 === maxCommunityRank ? rank2 : rank1;
        
        // Top pair with good kicker (J or better) - should almost always continue
        if (kickerRank >= 9) {
          if (adjustedStrength > 0.6) {
            action = 'raise';
            confidence = 85;
            raiseAmount = Math.round(bigBlind * 2.5);
            reasoning = `GTO: Raising with top pair (${card1.rank}${card2.rank}) and good kicker. Strong hand that should value bet.`;
          } else {
            action = 'call';
            confidence = 80;
            reasoning = `GTO: Calling with top pair (${card1.rank}${card2.rank}) and good kicker. Strong hand that should continue.`;
          }
        }
        // Top pair with medium kicker (8-10) - usually call, sometimes raise
        else if (kickerRank >= 8) {
          if (adjustedStrength > 0.7) {
            action = 'raise';
            confidence = 75;
            raiseAmount = Math.round(bigBlind * 2.5);
            reasoning = `GTO: Raising with top pair (${card1.rank}${card2.rank}) and decent kicker. Good hand for value betting.`;
          } else {
            action = 'call';
            confidence = 70;
            reasoning = `GTO: Calling with top pair (${card1.rank}${card2.rank}) and decent kicker. Should continue with this hand.`;
          }
        }
        // Top pair with weak kicker - call in most situations
        else {
          action = 'call';
          confidence = 65;
          reasoning = `GTO: Calling with top pair (${card1.rank}${card2.rank}). Even weak top pair is usually worth continuing.`;
        }
      }
    }
    
    // If not top pair, use adjusted strength logic
    if (action === 'fold') {
      if (adjustedStrength > 0.6) {
        action = 'raise';
        confidence = Math.min(95, 70 + adjustedStrength * 25);
        raiseAmount = Math.round(bigBlind * 2.5);
        reasoning = `Strong ${handEvaluation.strength}. Raising for value.`;
      } else if (adjustedStrength > 0.3) {
        action = 'call';
        confidence = Math.min(85, 55 + adjustedStrength * 30);
        reasoning = `Decent ${handEvaluation.strength}. Calling to continue.`;
      } else if (potOdds > 20) {
        action = 'call';
        confidence = Math.min(75, 40 + potOdds * 0.5);
        reasoning = `Weak hand but good pot odds (${potOdds.toFixed(1)}%). Calling for implied odds.`;
      } else {
        action = 'fold';
        confidence = Math.min(85, 60 + (1 - adjustedStrength) * 25);
        reasoning = `Weak ${handEvaluation.strength} with poor position and pot odds. Folding.`;
      }
    }
  }
  
  // Calculate expected value (simplified)
  const ev = action === 'fold' ? 0 : 
             action === 'call' ? (potSize * adjustedStrength - betSize) :
             (potSize * adjustedStrength - raiseAmount);
  
  // Add blind-specific reasoning
  if (smallBlind > 0 && bigBlind > 0) {
    if (position === 'small_blind' && betSize <= bigBlind) {
      reasoning += ` Small blind position with ${smallBlind}/${bigBlind} blinds.`;
    } else if (position === 'big_blind' && betSize <= bigBlind) {
      reasoning += ` Big blind position with ${smallBlind}/${bigBlind} blinds.`;
    }
  }
  
  return {
    action,
    confidence: Math.round(confidence),
    raiseAmount: action === 'raise' ? raiseAmount : null,
    handStrength: handEvaluation.strength,
    potOdds: Math.round(potOdds),
    ev: Math.round(ev),
    reasoning
  };
};

// GTO range analysis
const analyzeGTORange = (holeCards, position) => {
  const card1 = parseCard(holeCards[0]);
  const card2 = parseCard(holeCards[1]);
  const rank1 = getRankValue(card1.rank);
  const rank2 = getRankValue(card2.rank);
  const isSuited = card1.suit === card2.suit;
  
  // GTO opening ranges by position (more realistic)
  const ranges = {
    'early': {
      'premium': ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs', 'AQo'],
      'strong': ['99', '88', '77', 'AJs', 'ATs', 'A9s', 'KQs', 'KQo', 'KJs'],
      'medium': ['66', '55', 'A8s', 'A7s', 'A6s', 'KTs', 'K9s', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s', '76s']
    },
    'middle': {
      'premium': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs'],
      'strong': ['77', '66', '55', 'A9s', 'A8s', 'A7s', 'A6s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'Q9s', 'JTs'],
      'medium': ['44', '33', 'A5s', 'A4s', 'A3s', 'A2s', 'K8s', 'K7s', 'Q8s', 'J9s', 'J8s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '65s', '54s', '43s']
    },
    'late': {
      'premium': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s'],
      'strong': ['66', '55', '44', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s'],
      'medium': ['33', '22', 'A3s', 'A2s', 'K7s', 'K6s', 'Q8s', 'Q7s', 'J8s', 'J7s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '75s', '65s', '54s', '43s', '32s']
    },
    'button': {
      'premium': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s'],
      'strong': ['55', '44', '33', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'JTs', 'J9s', 'T9s'],
      'medium': ['22', 'A2s', 'K6s', 'K5s', 'Q7s', 'Q6s', 'J8s', 'J7s', 'T8s', 'T7s', '98s', '97s', '87s', '86s', '76s', '75s', '65s', '64s', '54s', '53s', '43s', '32s']
    }
  };
  
  const handStr = `${card1.rank}${card2.rank}${isSuited ? 's' : 'o'}`;
  const positionRange = ranges[position] || ranges['middle'];
  
  if (positionRange.premium.includes(handStr)) return 'premium';
  if (positionRange.strong.includes(handStr)) return 'strong';
  if (positionRange.medium.includes(handStr)) return 'medium';
  return 'weak';
};

// Main analysis function with GTO principles
export const analyzeHand = async (handData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Add GTO range analysis
  const gtoRange = analyzeGTORange(handData.holeCards, handData.position);
  
  // Get base recommendation
  const recommendation = generateRecommendation(handData);
  
  // Add GTO range information
  recommendation.gtoRange = gtoRange;
  recommendation.gtoAdvice = getGTOAdvice(gtoRange, handData.position, handData.isPreflop);
  
  return recommendation;
};

// GTO advice based on range and position
const getGTOAdvice = (range, position, isPreflop) => {
  if (!isPreflop) return '';
  
  const advice = {
    'premium': {
      'early': 'GTO: Always raise. Premium hands play themselves.',
      'middle': 'GTO: Raise for value. Strong hand in good position.',
      'late': 'GTO: Raise aggressively. Extract maximum value.',
      'button': 'GTO: Raise to isolate. Premium hand in best position.'
    },
    'strong': {
      'early': 'GTO: Usually raise, sometimes call. Strong but not premium.',
      'middle': 'GTO: Raise most of the time. Good hand in decent position.',
      'late': 'GTO: Raise frequently. Strong hand in good position.',
      'button': 'GTO: Raise often. Strong hand in best position.'
    },
    'medium': {
      'early': 'GTO: Mix of raise/call/fold. Position dependent.',
      'middle': 'GTO: Usually call, sometimes raise. Decent hand.',
      'late': 'GTO: Call or raise. Playable hand in good position.',
      'button': 'GTO: Call or raise. Playable hand in best position.'
    },
    'weak': {
      'early': 'GTO: Usually fold. Weak hand in bad position.',
      'middle': 'GTO: Usually fold, sometimes call. Weak hand.',
      'late': 'GTO: Mix of call/fold. Position helps weak hands.',
      'button': 'GTO: Call or fold. Position makes weak hands playable.'
    }
  };
  
  return advice[range]?.[position] || 'GTO: Standard play for this hand and position.';
};

// Export utility functions for testing
export {
  parseCard,
  getRankValue,
  evaluateHand,
  calculatePotOdds,
  getPositionMultiplier,
  getPlayerCountAdjustment,
  getHandStrengthAdjustment,
  analyzeGTORange,
  getGTOAdvice
}; 