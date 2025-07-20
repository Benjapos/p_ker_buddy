// Mock backend for local testing
export const mockAnalyzeHand = async (data) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { holeCards, position, potSize, betSize, numPlayers } = data;
  
  // Simple mock logic
  const card1 = holeCards[0];
  const card2 = holeCards[1];
  const rank1 = card1.slice(0, -1);
  const rank2 = card2.slice(0, -1);
  
  // Mock equity calculation
  let equity = 50;
  if (rank1 === rank2) {
    equity = 80; // Pairs are strong
  } else if (rank1 === 'A' || rank2 === 'A') {
    equity = 65; // Ace hands are strong
  } else if (['K', 'Q', 'J'].includes(rank1) && ['K', 'Q', 'J'].includes(rank2)) {
    equity = 55; // Broadway cards
  }
  
  // Mock action logic
  let action = 'fold';
  let confidence = 60;
  let raiseAmount = null;
  let reasoning = '';
  
  if (equity > 70) {
    action = 'raise';
    confidence = 85;
    raiseAmount = 6;
    reasoning = `Strong hand ${rank1}${rank2} with ${equity}% equity. Raise for value.`;
  } else if (equity > 50) {
    if (position === 'button' || position === 'late') {
      action = 'raise';
      confidence = 70;
      raiseAmount = 4;
      reasoning = `Decent hand ${rank1}${rank2} with ${equity}% equity. Raise from late position.`;
    } else {
      action = 'call';
      confidence = 65;
      reasoning = `Decent hand ${rank1}${rank2} with ${equity}% equity. Call from ${position} position.`;
    }
  } else {
    action = 'fold';
    confidence = 75;
    reasoning = `Weak hand ${rank1}${rank2} with ${equity}% equity. Fold from ${position} position.`;
  }
  
  return {
    action,
    confidence,
    raiseAmount,
    bigBlind: 2,
    handStrength: 'Pre-flop',
    equity: equity.toFixed(1),
    potOdds: betSize > 0 ? Math.round((potSize / betSize) * 100) : 0,
    ev: action === 'fold' ? 0 : Math.round((potSize + (raiseAmount || betSize)) * (equity / 100) - (raiseAmount || betSize)),
    reasoning,
    timestamp: new Date().toISOString()
  };
}; 