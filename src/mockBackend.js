// Offline analysis engine: GTO range lookup preflop; postflop uses a simulated equity estimate
// against realistic opponent ranges, draw counting and a position/stack aware decision.
import { calculateEquity, cardToInt } from './utils/equity.js';
import { getGTOAction, calculatePotOdds, calculateImpliedOdds, evaluateHand } from './utils/pokerLogic.js';
import { topRangeCombos, villainRangePercent, countDraws, boardTexture, decidePostflop } from './utils/postflop.js';

const streetName = (boardLength) => (boardLength <= 3 ? 'flop' : boardLength === 4 ? 'turn' : 'river');

export const mockAnalyzeHand = async (data) => {
  const {
    holeCards, position, potSize, betSize, numPlayers,
    bigBlind = 2, smallBlind = 1, stackSize = 1000,
    flop = [], turn = null, river = null,
    preflopAction = null
  } = data;

  const isPreflop = flop.length === 0;
  const communityCards = [...flop, turn, river].filter(Boolean);
  const board = communityCards.map(cardToInt);
  const heroInts = holeCards.map(cardToInt);
  const numOpponents = Math.min(Math.max(numPlayers - 1, 1), 8);
  const facingBet = betSize > 0;

  // Opponents: after a bet, the bettor holds a stronger-than-random range whose width depends on the bet size.
  const villainPct = !isPreflop && facingBet ? villainRangePercent(betSize, potSize) : null;
  const buildOpponents = (useRange) =>
    Array.from({ length: numOpponents }, (_, i) => (useRange && i === 0 ? topRangeCombos(villainPct) : null));

  let equityPct;
  let usedRange = !!villainPct;
  const simulate = (useRange) => calculateEquity({
    heroCombos: [heroInts],
    board,
    opponents: buildOpponents(useRange),
    iterations: 5000
  }).equity;
  try {
    equityPct = simulate(usedRange);
  } catch (e) {
    usedRange = false; // range emptied by the board: fall back to random hands
    equityPct = simulate(false);
  }
  const equity = Math.round(equityPct);

  const handEvaluation = evaluateHand(holeCards, communityCards);

  let decision;
  let draws = null;
  if (isPreflop) {
    // Preflop: GTO range tables, told explicitly what happened before the hero acts.
    decision = getGTOAction(holeCards, position, numPlayers, potSize, betSize, bigBlind, smallBlind, preflopAction);
    if (decision.action === 'raise' && decision.raiseAmount) {
      decision.raiseAmount = Math.min(decision.raiseAmount, stackSize);
    }
  } else {
    draws = countDraws(heroInts, board);
    decision = decidePostflop({
      handStrength: handEvaluation.strength,
      equity,
      potSize,
      betSize,
      bigBlind,
      stackSize,
      numOpponents,
      position,
      draws,
      texture: boardTexture(board),
      villainPct: usedRange ? villainPct : null
    });
  }

  // Pot odds fields, kept for the hand history
  let potOdds = 0;
  let impliedOdds = 0;
  if (!isPreflop) {
    potOdds = calculatePotOdds(potSize, betSize);
    impliedOdds = calculateImpliedOdds(potSize, betSize, stackSize, equity);
  }

  // Rough expected value. It assumes the bet or raise is called, so it flatters aggressive plays.
  // A check has no meaningful EV here, so it is left blank.
  let ev = 0;
  const isCheck = !isPreflop && !facingBet && decision.action === 'call';
  if (isCheck) {
    ev = null;
  } else if (decision.action === 'call') {
    ev = Math.round((potSize + betSize) * (equity / 100) - betSize);
  } else if (decision.action === 'raise') {
    ev = Math.round((potSize + decision.raiseAmount) * (equity / 100) - decision.raiseAmount);
  }

  return {
    holeCards: holeCards,
    street: isPreflop ? 'preflop' : streetName(board.length),
    action: decision.action,
    confidence: decision.confidence,
    raiseAmount: decision.raiseAmount,
    allIn: !!decision.allIn,
    bigBlind: bigBlind,
    handStrength: handEvaluation.strength,
    equity,
    numOpponents,
    villainPct: usedRange ? villainPct : null,
    draw: draws ? { text: draws.text, outs: draws.count, hitPct: draws.hitPct } : null,
    facingBet,
    // Equity you need to break even on a call: bet / (pot + bet)
    requiredEquity: isPreflop || !facingBet ? null : Math.round((betSize / (potSize + betSize)) * 100),
    potOdds: isPreflop ? null : Math.round(potOdds),
    impliedOdds: isPreflop ? null : Math.round(impliedOdds),
    ev,
    reasoning: decision.reasoning,
    timestamp: new Date().toISOString()
  };
};
