// Monte Carlo equity calculation for Texas Hold'em.
// Cards are integers 0-51: rank = card >> 2 (0 = deuce ... 12 = ace), suit = card & 3.

const RANKS = '23456789TJQKA';
const SUIT_SYMBOLS = { '♠': 0, '♥': 1, '♦': 2, '♣': 3, s: 0, h: 1, d: 2, c: 3 };

// Convert 'A♠', '10♦' or 'Td' to a card integer. Returns null if unrecognised.
export const cardToInt = (cardStr) => {
  if (!cardStr) return null;
  const rankStr = cardStr.slice(0, -1) === '10' ? 'T' : cardStr.slice(0, -1).toUpperCase();
  const rank = RANKS.indexOf(rankStr);
  const suit = SUIT_SYMBOLS[cardStr.slice(-1)] ?? SUIT_SYMBOLS[cardStr.slice(-1).toLowerCase()];
  if (rank < 0 || suit === undefined) return null;
  return rank * 4 + suit;
};

// Highest card of the best straight in a 13-bit rank mask, or -1. The wheel (A-2-3-4-5) scores 3.
const straightHigh = (mask) => {
  for (let high = 12; high >= 4; high--) {
    const run = 0b11111 << (high - 4);
    if ((mask & run) === run) return high;
  }
  if ((mask & 0b1000000001111) === 0b1000000001111) return 3;
  return -1;
};

const encode = (ranks) => {
  let value = 0;
  for (let i = 0; i < 5; i++) value = value * 13 + (ranks[i] ?? 0);
  return value;
};

const BASE = 13 ** 5;

// Score a 5-7 card hand. Higher is better.
export const scoreHand = (cards) => {
  const rankCount = new Array(13).fill(0);
  const suitCount = [0, 0, 0, 0];
  const suitMask = [0, 0, 0, 0];
  let mask = 0;
  for (const card of cards) {
    const rank = card >> 2;
    const suit = card & 3;
    rankCount[rank]++;
    suitCount[suit]++;
    suitMask[suit] |= 1 << rank;
    mask |= 1 << rank;
  }

  const flushSuit = suitCount.findIndex((n) => n >= 5);
  if (flushSuit >= 0) {
    const sfHigh = straightHigh(suitMask[flushSuit]);
    if (sfHigh >= 0) return 8 * BASE + sfHigh;
  }

  const quads = [];
  const trips = [];
  const pairs = [];
  const singles = [];
  for (let rank = 12; rank >= 0; rank--) {
    const n = rankCount[rank];
    if (n === 4) quads.push(rank);
    else if (n === 3) trips.push(rank);
    else if (n === 2) pairs.push(rank);
    else if (n === 1) singles.push(rank);
  }

  if (quads.length) {
    const kicker = [...trips, ...pairs, ...singles].sort((a, b) => b - a)[0];
    return 7 * BASE + encode([quads[0], kicker]);
  }
  if (trips.length && (trips.length > 1 || pairs.length)) {
    const pairRank = trips.length > 1 ? Math.max(trips[1], pairs[0] ?? -1) : pairs[0];
    return 6 * BASE + encode([trips[0], pairRank]);
  }
  if (flushSuit >= 0) {
    const top = [];
    for (let rank = 12; rank >= 0 && top.length < 5; rank--) {
      if (suitMask[flushSuit] & (1 << rank)) top.push(rank);
    }
    return 5 * BASE + encode(top);
  }
  const high = straightHigh(mask);
  if (high >= 0) return 4 * BASE + high;
  if (trips.length) return 3 * BASE + encode([trips[0], ...singles.concat(pairs).sort((a, b) => b - a).slice(0, 2)]);
  if (pairs.length >= 2) {
    const kicker = [...pairs.slice(2), ...singles].sort((a, b) => b - a)[0];
    return 2 * BASE + encode([pairs[0], pairs[1], kicker]);
  }
  if (pairs.length === 1) return 1 * BASE + encode([pairs[0], ...singles.slice(0, 3)]);
  return encode(singles);
};

// Expand notation like 'AKs', 'AKo', 'AK' or 'QQ' into every suited/offsuit card combination.
export const notationToCombos = (notation) => {
  const text = notation.trim().replace(/10/g, 'T');
  const match = /^([2-9TJQKA])([2-9TJQKA])([so]?)$/i.exec(text);
  if (!match) return [];
  const r1 = RANKS.indexOf(match[1].toUpperCase());
  const r2 = RANKS.indexOf(match[2].toUpperCase());
  const kind = match[3].toLowerCase();
  const combos = [];
  for (let s1 = 0; s1 < 4; s1++) {
    for (let s2 = 0; s2 < 4; s2++) {
      if (r1 === r2) {
        if (s1 >= s2 || kind) continue;
      } else {
        if (kind === 's' && s1 !== s2) continue;
        if (kind === 'o' && s1 === s2) continue;
      }
      combos.push([r1 * 4 + s1, r2 * 4 + s2]);
    }
  }
  return combos;
};

// Parse a list or comma/space separated string of notations into combos. Reports any tokens it could not read.
export const rangeToCombos = (range) => {
  const tokens = Array.isArray(range) ? range : String(range).split(/[\s,]+/).filter(Boolean);
  const combos = [];
  const invalid = [];
  const seen = new Set();
  for (const token of tokens) {
    if (seen.has(token)) continue;
    seen.add(token);
    const expanded = notationToCombos(token);
    if (expanded.length === 0) invalid.push(token);
    combos.push(...expanded);
  }
  return { combos, invalid };
};

/**
 * Estimate hero equity by simulation.
 * @param {number[][]} heroCombos possible hero hands (one is picked per iteration)
 * @param {number[]} board known community cards (0-5)
 * @param {Array<number[][]|null>} opponents one entry per opponent: a combo list, or null for a random hand
 * @returns {{equity: number, win: number, tie: number, lose: number, iterations: number}} percentages
 */
export const calculateEquity = ({ heroCombos, board = [], opponents, iterations = 20000 }) => {
  const dead = new Set(board);
  const heroOptions = heroCombos.filter(([a, b]) => !dead.has(a) && !dead.has(b));
  if (heroOptions.length === 0) throw new Error('No valid hero hand for this board.');

  const oppOptions = opponents.map((combos) =>
    combos ? combos.filter(([a, b]) => !dead.has(a) && !dead.has(b)) : null
  );
  if (oppOptions.some((combos) => combos && combos.length === 0)) {
    throw new Error('Opponent range has no hands left after removing known cards.');
  }

  const deck = [];
  for (let c = 0; c < 52; c++) if (!dead.has(c)) deck.push(c);
  const boardNeeded = 5 - board.length;

  let wins = 0;
  let ties = 0;
  let valid = 0;

  for (let i = 0; i < iterations; i++) {
    const hero = heroOptions[(Math.random() * heroOptions.length) | 0];
    const used = new Set(hero);
    const oppHands = [];
    let ok = true;

    for (const options of oppOptions) {
      let hand = null;
      for (let attempt = 0; attempt < 30; attempt++) {
        let candidate;
        if (options) {
          candidate = options[(Math.random() * options.length) | 0];
        } else {
          const a = deck[(Math.random() * deck.length) | 0];
          const b = deck[(Math.random() * deck.length) | 0];
          if (a === b) continue;
          candidate = [a, b];
        }
        if (!used.has(candidate[0]) && !used.has(candidate[1])) {
          hand = candidate;
          break;
        }
      }
      if (!hand) { ok = false; break; }
      used.add(hand[0]);
      used.add(hand[1]);
      oppHands.push(hand);
    }
    if (!ok) continue;

    // Deal the rest of the board from the cards nobody holds.
    const runout = [];
    while (runout.length < boardNeeded) {
      const card = deck[(Math.random() * deck.length) | 0];
      if (!used.has(card) && !runout.includes(card)) runout.push(card);
    }
    const fullBoard = board.concat(runout);

    const heroScore = scoreHand([...hero, ...fullBoard]);
    let best = -1;
    let bestCount = 0;
    for (const opp of oppHands) {
      const score = scoreHand([...opp, ...fullBoard]);
      if (score > best) { best = score; bestCount = 1; }
      else if (score === best) bestCount++;
    }

    if (heroScore > best) wins++;
    else if (heroScore === best) ties += 1 / (bestCount + 1);
    valid++;
  }

  if (valid === 0) throw new Error('Could not sample any valid hands.');
  const win = (wins / valid) * 100;
  const tie = (ties / valid) * 100;
  return {
    equity: win + tie,
    win,
    tie,
    lose: 100 - win - tie,
    iterations: valid
  };
};
