// Postflop decision helpers: opponent ranges that tighten when someone bets, draw/outs counting,
// board texture, and the fold / call / bet-or-raise decision itself.
// Everything here is a rule-of-thumb model, not a solver.

import { scoreHand, notationToCombos } from './equity.js';

const BASE = 13 ** 5;
const CHARS = '23456789TJQKA';

// ---- Opponent range by percentage of starting hands -------------------------------------------

// Chen formula: a quick, well-known preflop hand strength score.
const chenScore = (hi, lo, suited) => {
  const points = (r) => (r === 12 ? 10 : r === 11 ? 8 : r === 10 ? 7 : r === 9 ? 6 : (r + 2) / 2);
  let score = points(hi);
  if (hi === lo) return Math.max(5, score * 2);
  if (suited) score += 2;
  const gap = hi - lo - 1;
  score -= gap === 0 ? 0 : gap === 1 ? 1 : gap === 2 ? 2 : gap === 3 ? 4 : 5;
  if (gap <= 1 && hi < 10) score += 1;
  return Math.ceil(score);
};

let classesByStrength = null;
const getClasses = () => {
  if (classesByStrength) return classesByStrength;
  const classes = [];
  for (let hi = 12; hi >= 0; hi--) {
    for (let lo = hi; lo >= 0; lo--) {
      if (hi === lo) {
        classes.push({ notation: CHARS[hi] + CHARS[lo], combos: 6, score: chenScore(hi, lo, false) });
      } else {
        classes.push({ notation: CHARS[hi] + CHARS[lo] + 's', combos: 4, score: chenScore(hi, lo, true) });
        classes.push({ notation: CHARS[hi] + CHARS[lo] + 'o', combos: 12, score: chenScore(hi, lo, false) });
      }
    }
  }
  // Stronger first; at equal score prefer pairs, then suited, then higher cards.
  const kind = (c) => (c.combos === 6 ? 0 : c.combos === 4 ? 1 : 2); // pair, suited, offsuit
  classes.sort((a, b) => b.score - a.score || kind(a) - kind(b));
  classesByStrength = classes;
  return classes;
};

const rangeCache = new Map();

// The strongest `percent`% of all 1326 starting hands, as card-combo pairs.
export const topRangeCombos = (percent) => {
  const pct = Math.min(100, Math.max(1, Math.round(percent)));
  if (rangeCache.has(pct)) return rangeCache.get(pct);
  const target = (pct / 100) * 1326;
  const combos = [];
  let count = 0;
  for (const cls of getClasses()) {
    if (count >= target) break;
    combos.push(...notationToCombos(cls.notation));
    count += cls.combos;
  }
  rangeCache.set(pct, combos);
  return combos;
};

// How wide a bettor's range is, from the size of the bet compared with the pot.
export const villainRangePercent = (betSize, potSize) => {
  const fraction = betSize / Math.max(potSize, 1);
  if (fraction < 0.33) return 65;
  if (fraction < 0.75) return 45;
  if (fraction <= 1.25) return 30;
  return 20;
};

// ---- Draws and outs -----------------------------------------------------------------------------

const comb2 = (n) => (n * (n - 1)) / 2;

// Cards that would turn the hand into a straight or better when it is not already that good on the board alone.
// Only meaningful on the flop and turn (3 or 4 community cards).
export const countDraws = (holeInts, boardInts) => {
  if (boardInts.length < 3 || boardInts.length > 4) return null;
  const used = new Set([...holeInts, ...boardInts]);
  const current = Math.floor(scoreHand([...holeInts, ...boardInts]) / BASE);
  let flushOuts = 0;
  let straightOuts = 0;
  let otherBigOuts = 0;

  for (let card = 0; card < 52; card++) {
    if (used.has(card)) continue;
    const next = Math.floor(scoreHand([...holeInts, ...boardInts, card]) / BASE);
    const boardOnly = Math.floor(scoreHand([...boardInts, card]) / BASE);
    if (next <= current || next <= boardOnly || next < 4) continue;
    if (next === 5) flushOuts++;
    else if (next === 4) straightOuts++;
    else otherBigOuts++;
  }

  const total = flushOuts + straightOuts + otherBigOuts;
  if (total === 0) return null;

  const unseen = 52 - used.size;
  const cardsToCome = boardInts.length === 3 ? 2 : 1;
  const missChance = cardsToCome === 2
    ? ((unseen - total) * (unseen - total - 1)) / (unseen * (unseen - 1))
    : (unseen - total) / unseen;

  const parts = [];
  if (flushOuts) parts.push('flush draw');
  if (straightOuts) parts.push(straightOuts >= 8 ? 'open-ended straight draw' : 'gutshot straight draw');
  return {
    count: total,
    flushOuts,
    straightOuts,
    text: parts.join(' + ') || 'draw',
    hitPct: Math.round((1 - missChance) * 100)
  };
};

// ---- Board texture ------------------------------------------------------------------------------

export const boardTexture = (boardInts) => {
  const suitCounts = [0, 0, 0, 0];
  const ranks = new Set();
  const rankCounts = {};
  boardInts.forEach((c) => {
    suitCounts[c & 3]++;
    ranks.add(c >> 2);
    rankCounts[c >> 2] = (rankCounts[c >> 2] || 0) + 1;
  });
  const flushy = Math.max(...suitCounts) >= 3;
  const sorted = [...ranks].sort((a, b) => a - b);
  let connected = false;
  for (let i = 0; i + 2 < sorted.length; i++) {
    if (sorted[i + 2] - sorted[i] <= 4) connected = true;
  }
  const paired = Object.values(rankCounts).some((n) => n >= 2);
  return { flushy, connected, paired, wet: flushy || connected };
};

// ---- The decision -------------------------------------------------------------------------------

const isInPosition = (position) => position === 'button' || position === 'late';

const clampBet = (amount, bigBlind, stackSize) => Math.max(bigBlind, Math.min(Math.round(amount), stackSize));

/**
 * Decide fold / call (check) / raise (bet) after the flop.
 * equity is the hero's win chance in percent against the opponents' modelled ranges.
 */
export const decidePostflop = ({
  handStrength,
  equity,
  potSize,
  betSize,
  bigBlind = 2,
  stackSize = 1000,
  numOpponents = 1,
  position = 'middle',
  draws = null,
  texture = { wet: false },
  villainPct = null
}) => {
  const eq = Math.round(equity);
  const facingBet = betSize > 0;
  const inPosition = isInPosition(position);
  const required = facingBet ? (betSize / (potSize + betSize)) * 100 : 0;
  const vs = villainPct
    ? `a range that bets this size (about the top ${villainPct}% of hands)${numOpponents > 1 ? ` and ${numOpponents - 1} other random hand${numOpponents - 1 === 1 ? '' : 's'}` : ''}`
    : `${numOpponents} random opponent hand${numOpponents === 1 ? '' : 's'}`;
  const base = `${handStrength} with about ${eq}% equity against ${vs}.`;
  const drawNote = draws ? ` You also have a ${draws.text} (${draws.count} outs, about ${draws.hitPct}% to hit).` : '';

  // ----- Nobody has bet -----
  if (!facingBet) {
    const strong = eq >= (inPosition ? 68 : 72);
    const medium = eq >= (inPosition ? 55 : 60);
    const semiBluff = !!draws && draws.count >= 8 && inPosition;

    if (strong) {
      const fraction = texture.wet ? 0.75 : 0.55;
      return {
        action: 'raise',
        confidence: Math.min(95, 70 + (eq - 68)),
        raiseAmount: clampBet(potSize * fraction, bigBlind, stackSize),
        reasoning: `${base} Bet for value, about ${Math.round(fraction * 100)}% of the pot${texture.wet ? ' to charge draws on this wet board' : ''}.${drawNote}`
      };
    }
    if (medium) {
      return {
        action: 'raise',
        confidence: 62,
        raiseAmount: clampBet(potSize * 0.5, bigBlind, stackSize),
        reasoning: `${base} A half-pot bet gets value from worse hands and protects against draws.${drawNote}`
      };
    }
    if (semiBluff) {
      return {
        action: 'raise',
        confidence: 58,
        raiseAmount: clampBet(potSize * 0.5, bigBlind, stackSize),
        reasoning: `${base}${drawNote} A half-pot semi-bluff can win now if they fold, or improve if called. (Fold chances are not included in the equity figure.)`
      };
    }
    return {
      action: 'call',
      confidence: 65,
      reasoning: `${base} Check and see the next card for free.${drawNote}`
    };
  }

  // ----- Facing a bet -----
  const committed = betSize >= stackSize * 0.5; // calling costs half your stack or more
  const drawBonus = draws && draws.count >= 8 && !committed ? 3 : 0; // implied odds on a good draw
  const cushion = committed ? 0 : (inPosition ? 4 : 7) - drawBonus;

  if (eq >= 78) {
    const multiplier = inPosition ? 3 : 3.5;
    const target = betSize * multiplier;
    const allIn = target >= stackSize * 0.8;
    return {
      action: 'raise',
      confidence: Math.min(95, 70 + (eq - 78)),
      raiseAmount: allIn ? stackSize : clampBet(target, bigBlind, stackSize),
      allIn,
      reasoning: `${base} ${allIn ? 'Put your stack in' : 'Raise'} for value.${drawNote}`
    };
  }

  if (eq >= required + cushion) {
    const price = `${required.toFixed(0)}% needed to call`;
    return {
      action: 'call',
      confidence: Math.min(85, 60 + Math.round(eq - required)),
      reasoning: `${base} That beats the ${price}${committed ? ' and you are close to committed' : ''}.${drawNote}`
    };
  }

  return {
    action: 'fold',
    confidence: Math.min(90, 65 + Math.round(required - eq)),
    reasoning: `${base} That is short of the ${required.toFixed(0)}% needed to call${cushion ? ` (plus a ${cushion}-point safety margin${inPosition ? '' : ' for playing out of position'})` : ''}.${drawNote}`
  };
};
