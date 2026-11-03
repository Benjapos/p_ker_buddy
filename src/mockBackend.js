// Offline analysis engine: GTO range lookup plus a simulated equity estimate
import { calculateEquity, cardToInt } from './utils/equity.js';
import { getGTOAction, calculatePotOdds, calculateImpliedOdds, evaluateHand } from './utils/pokerLogic.js';

export const mockAnalyzeHand = async (data) => {
  const { holeCards, position, potSize, betSize, numPlayers, bigBlind = 2, smallBlind = 1, stackSize = 1000, flop = [], turn = null, river = null } = data;
  
  // Use proper GTO logic from pokerLogic.js
  const gtoResult = getGTOAction(holeCards, position, numPlayers, potSize, betSize, bigBlind, smallBlind);
  
  // Determine if this is preflop or postflop
  const isPreflop = flop.length === 0;
  
  // Simulate equity against random hands for every other player still at the table
  const board = [...flop, turn, river].filter(Boolean).map(cardToInt);
  const { equity: equityPct } = calculateEquity({
    heroCombos: [holeCards.map(cardToInt)],
    board,
    opponents: Array.from({ length: Math.min(Math.max(numPlayers - 1, 1), 8) }, () => null),
    iterations: 4000
  });
  const equity = Math.round(equityPct);

  // Calculate pot odds only for postflop situations
  let potOdds = 0;
  let impliedOdds = 0;
  if (!isPreflop) {
    potOdds = calculatePotOdds(potSize, betSize);
    impliedOdds = calculateImpliedOdds(potSize, betSize, stackSize, equity);
  }
  
  // Evaluate hand strength
  const handEvaluation = evaluateHand(holeCards, flop);
  
  // Calculate expected value
  let ev = 0;
  if (gtoResult.action === 'call') {
    ev = Math.round((potSize + betSize) * (equity / 100) - betSize);
  } else if (gtoResult.action === 'raise') {
    ev = Math.round((potSize + gtoResult.raiseAmount) * (equity / 100) - gtoResult.raiseAmount);
  }
  
  return {
    holeCards: holeCards, // Add holeCards to the result
    action: gtoResult.action,
    confidence: gtoResult.confidence,
    raiseAmount: gtoResult.raiseAmount,
    bigBlind: bigBlind,
    handStrength: handEvaluation.strength,
    equity,
    potOdds: isPreflop ? null : Math.round(potOdds),
    impliedOdds: isPreflop ? null : Math.round(impliedOdds),
    ev: ev,
    reasoning: gtoResult.reasoning,
    timestamp: new Date().toISOString()
  };
}; 