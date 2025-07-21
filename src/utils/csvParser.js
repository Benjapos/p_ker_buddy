// CSV Parser and Hand Data Lookup Utility
import Papa from 'papaparse';

// Cache for loaded CSV data
let preflopData = null;
let postflopData = null;

/**
 * Load and parse CSV data
 * @param {string} csvContent - Raw CSV content
 * @returns {Array} Parsed data array
 */
export const parseCSV = (csvContent) => {
  try {
    const result = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });
    return result.data;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
};

/**
 * Load preflop hand data
 * @param {string} csvContent - Raw CSV content
 */
export const loadPreflopData = (csvContent) => {
  preflopData = parseCSV(csvContent);
  console.log(`Loaded ${preflopData.length} preflop hands`);
  return preflopData;
};

/**
 * Load postflop hand data
 * @param {string} csvContent - Raw CSV content
 */
export const loadPostflopData = (csvContent) => {
  postflopData = parseCSV(csvContent);
  console.log(`Loaded ${postflopData.length} postflop hands`);
  return postflopData;
};

/**
 * Convert hole cards to notation for lookup
 * @param {Array} holeCards - Array of card strings like ['A♣', 'K♥']
 * @returns {string} Hand notation like 'AKo' or 'AKs'
 */
export const cardsToNotation = (holeCards) => {
  if (!holeCards || holeCards.length !== 2) return null;
  
  const card1 = holeCards[0];
  const card2 = holeCards[1];
  
  // Extract rank and suit
  const rank1 = card1.replace(/[♠♥♦♣]/g, '');
  const rank2 = card2.replace(/[♠♥♦♣]/g, '');
  const suit1 = card1.match(/[♠♥♦♣]/)?.[0];
  const suit2 = card2.match(/[♠♥♦♣]/)?.[0];
  
  // Convert 10 to T
  const rank1Str = rank1 === '10' ? 'T' : rank1;
  const rank2Str = rank2 === '10' ? 'T' : rank2;
  
  // Sort ranks (higher first)
  const ranks = [rank1Str, rank2Str].sort((a, b) => {
    const values = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
    return values[b] - values[a];
  });
  
  // Check if suited
  const isSuited = suit1 === suit2;
  
  // For pairs, return just the rank twice
  if (ranks[0] === ranks[1]) {
    return ranks[0] + ranks[0];
  }
  
  // For non-pairs, add suited/offsuit suffix
  return ranks[0] + ranks[1] + (isSuited ? 's' : 'o');
};

/**
 * Find similar hands in the preflop dataset
 * @param {Array} holeCards - Array of card strings
 * @param {string} position - Position (UTG, MP, CO, BTN, SB, BB)
 * @param {number} numPlayers - Number of players
 * @returns {Object} Hand statistics and recommendations
 */
export const findPreflopHands = (holeCards, position, numPlayers = 6) => {
  if (!preflopData) return null;
  
  const handNotation = cardsToNotation(holeCards);
  if (!handNotation) return null;
  
  // Find hands with similar characteristics
  const similarHands = preflopData.filter(hand => {
    // Match hand notation
    const handMatch = hand.Hand === handNotation || 
                     hand.hand === handNotation || 
                     hand.hand_notation === handNotation ||
                     hand.cards === handNotation;
    
    // Match position (if available)
    const positionMatch = !hand.Position || 
                         hand.Position === position ||
                         hand.position === position ||
                         hand.pos === position;
    
    // Match player count (if available)
    const playerMatch = !hand.num_players || 
                       hand.num_players === numPlayers ||
                       hand.players === numPlayers;
    
    return handMatch && positionMatch && playerMatch;
  });
  
  if (similarHands.length === 0) return null;
  
  // Calculate statistics
  const totalHands = similarHands.length;
  const actions = similarHands.map(hand => hand['Recommended Action'] || hand.action || hand.decision || hand.play);
  
  const stats = {
    totalHands,
    handNotation,
    position,
    numPlayers,
    actions: {
      fold: actions.filter(a => a?.toLowerCase().includes('fold')).length,
      call: actions.filter(a => a?.toLowerCase().includes('call')).length,
      raise: actions.filter(a => a?.toLowerCase().includes('raise')).length,
      allIn: actions.filter(a => a?.toLowerCase().includes('all') || a?.toLowerCase().includes('jam')).length
    },
    avgProfit: similarHands.reduce((sum, hand) => sum + (hand.profit || hand.result || 0), 0) / totalHands,
    winRate: similarHands.filter(hand => (hand.profit || hand.result || 0) > 0).length / totalHands,
    sampleHands: similarHands.slice(0, 5) // First 5 examples
  };
  
  // Calculate percentages
  stats.actionPercentages = {
    fold: (stats.actions.fold / totalHands * 100).toFixed(1),
    call: (stats.actions.call / totalHands * 100).toFixed(1),
    raise: (stats.actions.raise / totalHands * 100).toFixed(1),
    allIn: (stats.actions.allIn / totalHands * 100).toFixed(1)
  };
  
  return stats;
};

/**
 * Find similar hands in the postflop dataset
 * @param {Array} holeCards - Array of card strings
 * @param {Array} communityCards - Array of community card strings
 * @param {string} position - Position
 * @param {number} potSize - Pot size
 * @returns {Object} Postflop hand statistics
 */
export const findPostflopHands = (holeCards, communityCards, position, potSize) => {
  if (!postflopData) return null;
  
  const handNotation = cardsToNotation(holeCards);
  if (!handNotation) return null;
  
  // Find hands with similar characteristics
  const similarHands = postflopData.filter(hand => {
    const handMatch = hand.Hand === handNotation || 
                     hand.hand === handNotation || 
                     hand.hand_notation === handNotation ||
                     hand.cards === handNotation;
    
    const positionMatch = !hand.Position || 
                         hand.Position === position ||
                         hand.position === position ||
                         hand.pos === position;
    
    // Match pot size range (within 50% if available)
    const potMatch = !hand.pot_size || 
                    Math.abs(hand.pot_size - potSize) / potSize < 0.5;
    
    return handMatch && positionMatch && potMatch;
  });
  
  if (similarHands.length === 0) return null;
  
  // Calculate statistics similar to preflop
  const totalHands = similarHands.length;
  const actions = similarHands.map(hand => hand['Recommended Action'] || hand.action || hand.decision || hand.play);
  
  const stats = {
    totalHands,
    handNotation,
    position,
    potSize,
    actions: {
      fold: actions.filter(a => a?.toLowerCase().includes('fold')).length,
      call: actions.filter(a => a?.toLowerCase().includes('call')).length,
      raise: actions.filter(a => a?.toLowerCase().includes('raise')).length,
      allIn: actions.filter(a => a?.toLowerCase().includes('all') || a?.toLowerCase().includes('jam')).length
    },
    avgProfit: similarHands.reduce((sum, hand) => sum + (hand.profit || hand.result || 0), 0) / totalHands,
    winRate: similarHands.filter(hand => (hand.profit || hand.result || 0) > 0).length / totalHands,
    sampleHands: similarHands.slice(0, 5)
  };
  
  stats.actionPercentages = {
    fold: (stats.actions.fold / totalHands * 100).toFixed(1),
    call: (stats.actions.call / totalHands * 100).toFixed(1),
    raise: (stats.actions.raise / totalHands * 100).toFixed(1),
    allIn: (stats.actions.allIn / totalHands * 100).toFixed(1)
  };
  
  return stats;
};

/**
 * Get data summary
 * @returns {Object} Summary of loaded data
 */
export const getDataSummary = () => {
  return {
    preflopHands: preflopData ? preflopData.length : 0,
    postflopHands: postflopData ? postflopData.length : 0,
    totalHands: (preflopData ? preflopData.length : 0) + (postflopData ? postflopData.length : 0)
  };
};

/**
 * Clear loaded data
 */
export const clearData = () => {
  preflopData = null;
  postflopData = null;
}; 