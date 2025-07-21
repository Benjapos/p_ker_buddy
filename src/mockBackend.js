// Mock backend for local testing
import { getGTOAction, calculatePotOdds, calculateImpliedOdds, evaluateHand } from './utils/pokerLogic.js';

export const mockAnalyzeHand = async (data) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { holeCards, position, potSize, betSize, numPlayers, bigBlind = 2, smallBlind = 1, stackSize = 1000, flop = [] } = data;
  
  // Use proper GTO logic from pokerLogic.js
  const gtoResult = getGTOAction(holeCards, position, numPlayers, potSize, betSize, bigBlind, smallBlind);
  
  // Determine if this is preflop or postflop
  const isPreflop = flop.length === 0;
  
  // Calculate pot odds only for postflop situations
  let potOdds = 0;
  let impliedOdds = 0;
  if (!isPreflop) {
    potOdds = calculatePotOdds(potSize, betSize);
    impliedOdds = calculateImpliedOdds(potSize, betSize, stackSize, 65); // Assume 65% equity for GTO hands
  }
  
  // Evaluate hand strength
  const handEvaluation = evaluateHand(holeCards, flop);
  
  // Calculate expected value
  let ev = 0;
  if (gtoResult.action === 'call') {
    ev = Math.round((potSize + betSize) * 0.6 - betSize); // Assume 60% equity for calling hands
  } else if (gtoResult.action === 'raise') {
    ev = Math.round((potSize + gtoResult.raiseAmount) * 0.7 - gtoResult.raiseAmount); // Assume 70% equity for raising hands
  }
  
  return {
    holeCards: holeCards, // Add holeCards to the result
    action: gtoResult.action,
    confidence: gtoResult.confidence,
    raiseAmount: gtoResult.raiseAmount,
    bigBlind: bigBlind,
    handStrength: handEvaluation.strength,
    equity: 65, // Mock equity for GTO hands
    potOdds: isPreflop ? null : Math.round(potOdds),
    impliedOdds: isPreflop ? null : Math.round(impliedOdds),
    ev: ev,
    reasoning: gtoResult.reasoning,
    timestamp: new Date().toISOString()
  };
}; 