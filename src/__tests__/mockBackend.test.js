import { mockAnalyzeHand } from '../mockBackend';
import { getGTOAction, GTO_RANGES } from '../utils/pokerLogic';
import { cardToInt } from '../utils/equity';
import { topRangeCombos, villainRangePercent, countDraws, boardTexture, decidePostflop } from '../utils/postflop';

const base = { numPlayers: 4, position: 'middle', potSize: 100, betSize: 0, bigBlind: 2, smallBlind: 1, stackSize: 1000 };
const ints = cards => cards.map(cardToInt);

describe('postflop advice uses the real hand, not preflop ranges', () => {
  test('suited 2-3 on a 3-4-8 flop with a 2 on the turn (two pair) is not a fold', async () => {
    const result = await mockAnalyzeHand({ ...base, holeCards: ['2♠', '3♠'], flop: ['3♦', '4♣', '8♥'], turn: '2♦' });
    expect(result.handStrength).toBe('Two Pair');
    expect(result.action).not.toBe('fold');
    expect(result.equity).toBeGreaterThan(45);
  });

  test('still not a fold when facing a modest bet with two pair', async () => {
    const result = await mockAnalyzeHand({ ...base, holeCards: ['2♠', '3♠'], flop: ['3♦', '4♣', '8♥'], turn: '2♦', betSize: 40 });
    expect(result.action).not.toBe('fold');
  });

  test('hand name counts the turn and river', async () => {
    const result = await mockAnalyzeHand({ ...base, holeCards: ['A♠', 'K♠'], flop: ['Q♠', 'J♠', '2♦'], turn: '10♠' });
    expect(result.handStrength).toBe('Straight Flush');
    expect(result.action).toBe('raise');
  });

  test('folds a weak hand facing a big bet', async () => {
    const result = await mockAnalyzeHand({ ...base, holeCards: ['7♣', '2♦'], flop: ['K♠', 'Q♠', 'J♥'], turn: '9♦', betSize: 300 });
    expect(result.action).toBe('fold');
  });

  test('a bet narrows the opponent range, so equity drops', async () => {
    // A mid pair is a big favourite over random hands, but much less so over a range that bets the pot
    const hand = { ...base, numPlayers: 2, holeCards: ['9♥', '9♦'], flop: ['4♠', '7♣', '2♦'] };
    const noBet = await mockAnalyzeHand({ ...hand, betSize: 0 });
    const potBet = await mockAnalyzeHand({ ...hand, betSize: 100 });
    expect(potBet.villainPct).toBe(30);
    expect(potBet.equity).toBeLessThan(noBet.equity - 4);
  });

  test('reports draws', async () => {
    const result = await mockAnalyzeHand({ ...base, holeCards: ['A♠', 'K♠'], flop: ['Q♠', '7♠', '2♦'] });
    expect(result.draw.outs).toBeGreaterThanOrEqual(9);
    expect(result.draw.text).toMatch(/flush draw/);
  });

  test('a check has no EV figure', async () => {
    const result = await mockAnalyzeHand({ ...base, holeCards: ['7♣', '2♦'], flop: ['K♠', 'Q♠', 'J♥'], turn: '9♦' });
    expect(result.action).toBe('call');
    expect(result.ev).toBeNull();
  });
});

describe('preflop', () => {
  test('still uses the range tables when opening', async () => {
    const result = await mockAnalyzeHand({ ...base, holeCards: ['2♠', '3♠'], position: 'early', potSize: 3, preflopAction: 'open' });
    expect(result.action).toBe('fold');
  });

  test('premium hands re-raise a raise', () => {
    const r = getGTOAction(['A♠', 'A♥'], 'button', 6, 70, 60, 20, 10, 'raise');
    expect(r.action).toBe('raise');
    expect(r.raiseAmount).toBe(180); // 3x the raise in position
  });

  test('out of position the re-raise is bigger', () => {
    const r = getGTOAction(['K♠', 'K♥'], 'small_blind', 6, 70, 60, 20, 10, 'raise');
    expect(r.raiseAmount).toBe(240);
  });

  test('strong hands call a raise and weak hands fold', () => {
    expect(getGTOAction(['J♠', 'J♥'], 'button', 6, 70, 60, 20, 10, 'raise').action).toBe('call');
    expect(getGTOAction(['7♠', '2♥'], 'button', 6, 70, 60, 20, 10, 'raise').action).toBe('fold');
  });

  test('does not call off against a huge raise without a monster', () => {
    expect(getGTOAction(['J♠', 'J♥'], 'button', 6, 700, 600, 20, 10, 'raise').action).toBe('fold');
    expect(getGTOAction(['A♠', 'K♥'], 'button', 6, 700, 600, 20, 10, 'raise').action).toBe('call');
  });

  test('the action before you is used instead of guessing from the pot', () => {
    // Pot of 30 looks like "no action", but the user said someone raised
    expect(getGTOAction(['A♠', 'A♥'], 'button', 6, 30, 60, 20, 10, 'raise').action).toBe('raise');
    expect(getGTOAction(['A♠', 'A♥'], 'button', 6, 30, 0, 20, 10, 'open').action).toBe('raise');
  });

  test('the big blind checks instead of "opening"', () => {
    const r = getGTOAction(['9♠', '2♥'], 'big_blind', 6, 30, 0, 20, 10, 'open');
    expect(r.action).toBe('call');
    expect(r.reasoning).toMatch(/check/i);
  });

  test('range tables hold only real hands, with no overlaps', () => {
    const real = /^(?:([AKQJT98765432])\1|[AKQJT98765432][AKQJT98765432][so])$/;
    Object.values(GTO_RANGES).forEach(ranges => {
      const seen = new Set();
      ['raise', 'call', 'fold'].forEach(key => ranges[key].forEach(hand => {
        expect(hand).toMatch(real);
        expect(seen.has(hand)).toBe(false);
        seen.add(hand);
      }));
    });
  });
});

describe('opponent range model', () => {
  const has = (combos, a, b) => combos.some(([x, y]) => (x === cardToInt(a) && y === cardToInt(b)) || (x === cardToInt(b) && y === cardToInt(a)));

  test('top 10% holds big hands and not trash', () => {
    const top = topRangeCombos(10);
    expect(has(top, 'A♠', 'A♥')).toBe(true);
    expect(has(top, '7♠', '2♥')).toBe(false);
  });

  test('wider percentages contain more hands', () => {
    expect(topRangeCombos(50).length).toBeGreaterThan(topRangeCombos(20).length);
    expect(topRangeCombos(100).length).toBe(1326);
  });

  test('bigger bets mean tighter ranges', () => {
    expect(villainRangePercent(25, 100)).toBe(65);
    expect(villainRangePercent(50, 100)).toBe(45);
    expect(villainRangePercent(100, 100)).toBe(30);
    expect(villainRangePercent(200, 100)).toBe(20);
  });
});

describe('draws and board texture', () => {
  test('flush draw has 9 outs', () => {
    const d = countDraws(ints(['A♠', 'K♠']), ints(['Q♠', '7♠', '2♦']));
    expect(d.flushOuts).toBe(9);
    expect(d.text).toMatch(/flush draw/);
    expect(d.hitPct).toBeGreaterThan(30);
  });

  test('open-ended straight draw has 8 outs', () => {
    const d = countDraws(ints(['8♥', '9♣']), ints(['6♦', '7♠', 'K♣']));
    expect(d.straightOuts).toBe(8);
    expect(d.text).toMatch(/open-ended/);
  });

  test('gutshot has 4 outs', () => {
    const d = countDraws(ints(['8♥', '9♣']), ints(['6♦', '10♠', '2♣']));
    expect(d.straightOuts).toBe(4);
    expect(d.text).toMatch(/gutshot/);
  });

  test('no draw on the river or with nothing to draw to', () => {
    expect(countDraws(ints(['A♠', 'K♠']), ints(['Q♠', '7♠', '2♦', '3♣', '9♥']))).toBeNull();
    expect(countDraws(ints(['A♠', 'A♥']), ints(['A♦', 'A♣', '2♦']))).toBeNull();
  });

  test('wet and dry boards', () => {
    expect(boardTexture(ints(['Q♠', 'J♠', '10♦'])).wet).toBe(true);
    expect(boardTexture(ints(['K♠', '7♦', '2♣'])).wet).toBe(false);
    expect(boardTexture(ints(['K♠', '7♠', '2♠'])).flushy).toBe(true);
  });
});

describe('decidePostflop', () => {
  const common = { handStrength: 'Pair', potSize: 100, bigBlind: 2, stackSize: 1000, numOpponents: 1, position: 'button' };

  test('never folds when there is nothing to call', () => {
    expect(decidePostflop({ ...common, equity: 10, betSize: 0 }).action).toBe('call'); // check
  });

  test('bets bigger on wet boards', () => {
    const dry = decidePostflop({ ...common, equity: 85, betSize: 0, texture: { wet: false } });
    const wet = decidePostflop({ ...common, equity: 85, betSize: 0, texture: { wet: true } });
    expect(dry.raiseAmount).toBe(55);
    expect(wet.raiseAmount).toBe(75);
  });

  test('position changes thin value bets', () => {
    expect(decidePostflop({ ...common, equity: 58, betSize: 0 }).action).toBe('raise');
    expect(decidePostflop({ ...common, equity: 58, betSize: 0, position: 'early' }).action).toBe('call');
  });

  test('semi-bluffs a big draw in position only', () => {
    const draws = { text: 'flush draw', count: 9, hitPct: 35 };
    expect(decidePostflop({ ...common, equity: 40, betSize: 0, draws }).action).toBe('raise');
    expect(decidePostflop({ ...common, equity: 40, betSize: 0, draws, position: 'early' }).action).toBe('call');
  });

  test('needs a bigger margin to call out of position', () => {
    const facing = { ...common, betSize: 50, equity: 38 }; // needs 33%
    expect(decidePostflop(facing).action).toBe('call');
    expect(decidePostflop({ ...facing, position: 'early' }).action).toBe('fold');
  });

  test('a good draw can call slightly short of the price', () => {
    const facing = { ...common, betSize: 50, equity: 35 };
    expect(decidePostflop(facing).action).toBe('fold');
    expect(decidePostflop({ ...facing, draws: { text: 'flush draw', count: 9, hitPct: 35 } }).action).toBe('call');
  });

  test('stays in when the call commits most of the stack', () => {
    const r = decidePostflop({ ...common, betSize: 600, potSize: 700, equity: 47 }); // needs 46%
    expect(r.action).toBe('call');
  });

  test('puts the stack in with a big equity lead', () => {
    const r = decidePostflop({ ...common, betSize: 400, equity: 90 });
    expect(r.action).toBe('raise');
    expect(r.allIn).toBe(true);
    expect(r.raiseAmount).toBe(1000);
  });

  test('folds weak hands that are not getting the price', () => {
    expect(decidePostflop({ ...common, equity: 15, betSize: 100 }).action).toBe('fold');
  });
});
