import { calculateEquity, cardToInt, notationToCombos, rangeToCombos, scoreHand } from '../equity';

const hand = (...cards) => cards.map(cardToInt);

describe('scoreHand', () => {
  test('orders hand categories correctly', () => {
    const royal = scoreHand(hand('A♠', 'K♠', 'Q♠', 'J♠', '10♠', '2♦', '3♣'));
    const quads = scoreHand(hand('9♠', '9♥', '9♦', '9♣', 'A♠', '2♦', '3♣'));
    const boat = scoreHand(hand('K♠', 'K♥', 'K♦', '4♣', '4♠', '2♦', '3♣'));
    const flush = scoreHand(hand('A♠', 'J♠', '8♠', '5♠', '2♠', 'K♦', '3♣'));
    const straight = scoreHand(hand('5♠', '6♥', '7♦', '8♣', '9♠', '2♦', '2♣'));
    const trips = scoreHand(hand('Q♠', 'Q♥', 'Q♦', '8♣', '9♠', '2♦', '4♣'));
    const twoPair = scoreHand(hand('Q♠', 'Q♥', '8♦', '8♣', '9♠', '2♦', '4♣'));
    const pair = scoreHand(hand('Q♠', 'Q♥', '7♦', '8♣', '9♠', '2♦', '4♣'));
    const high = scoreHand(hand('A♠', 'J♥', '7♦', '8♣', '9♠', '2♦', '4♣'));
    const order = [royal, quads, boat, flush, straight, trips, twoPair, pair, high];
    expect([...order].sort((a, b) => b - a)).toEqual(order);
  });

  test('wheel is the lowest straight', () => {
    const wheel = scoreHand(hand('A♠', '2♥', '3♦', '4♣', '5♠', '9♦', 'K♣'));
    const sixHigh = scoreHand(hand('2♠', '3♥', '4♦', '5♣', '6♠', '9♦', 'K♣'));
    expect(sixHigh).toBeGreaterThan(wheel);
  });

  test('kickers break ties between pairs', () => {
    const better = scoreHand(hand('Q♠', 'Q♥', 'A♦', '8♣', '9♠', '2♦', '4♣'));
    const worse = scoreHand(hand('Q♦', 'Q♣', 'K♦', '8♥', '9♥', '2♥', '4♦'));
    expect(better).toBeGreaterThan(worse);
  });
});

describe('notation parsing', () => {
  test('combo counts', () => {
    expect(notationToCombos('AA')).toHaveLength(6);
    expect(notationToCombos('AKs')).toHaveLength(4);
    expect(notationToCombos('AKo')).toHaveLength(12);
    expect(notationToCombos('AK')).toHaveLength(16);
    expect(notationToCombos('banana')).toHaveLength(0);
  });

  test('reports invalid range tokens', () => {
    const { combos, invalid } = rangeToCombos('AA, KK, xyz');
    expect(combos).toHaveLength(12);
    expect(invalid).toEqual(['xyz']);
  });
});

describe('calculateEquity (known preflop values)', () => {
  test('AA vs KK is about 82%', () => {
    const { equity } = calculateEquity({
      heroCombos: notationToCombos('AA'),
      opponents: [notationToCombos('KK')],
      iterations: 30000
    });
    expect(equity).toBeGreaterThan(79);
    expect(equity).toBeLessThan(85);
  });

  test('AKs vs a random hand is about 67%', () => {
    const { equity } = calculateEquity({
      heroCombos: notationToCombos('AKs'),
      opponents: [null],
      iterations: 30000
    });
    expect(equity).toBeGreaterThan(64);
    expect(equity).toBeLessThan(70);
  });

  test('a made nut hand on the river has 100% equity against a random hand', () => {
    const { equity } = calculateEquity({
      heroCombos: [hand('A♠', 'K♠')],
      board: hand('Q♠', 'J♠', '10♠', '2♦', '3♣'),
      opponents: [null],
      iterations: 2000
    });
    expect(equity).toBe(100);
  });
});
