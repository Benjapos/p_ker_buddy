import {
  parseCard,
  getRankValue,
  evaluateHand,
  calculatePotOdds,
  getPositionMultiplier,
  getPlayerCountAdjustment,
  analyzeHand
} from '../pokerLogic';

describe('Poker Logic Utilities', () => {
  describe('parseCard', () => {
    test('parses card string correctly', () => {
      expect(parseCard('A♠')).toEqual({ rank: 'A', suit: '♠' });
      expect(parseCard('K♥')).toEqual({ rank: 'K', suit: '♥' });
      expect(parseCard('10♦')).toEqual({ rank: '10', suit: '♦' });
      expect(parseCard('2♣')).toEqual({ rank: '2', suit: '♣' });
    });
  });

  describe('getRankValue', () => {
    test('returns correct rank values', () => {
      expect(getRankValue('2')).toBe(0);
      expect(getRankValue('A')).toBe(12);
      expect(getRankValue('K')).toBe(11);
      expect(getRankValue('Q')).toBe(10);
      expect(getRankValue('J')).toBe(9);
      expect(getRankValue('10')).toBe(8);
    });
  });

  describe('evaluateHand', () => {
    test('evaluates pair correctly', () => {
      const holeCards = ['A♠', 'A♥'];
      const communityCards = ['K♦', 'Q♣', '2♠'];
      
      const result = evaluateHand(holeCards, communityCards);
      expect(result.strength).toBe('Pair');
      expect(result.value).toBe(1);
    });

    test('evaluates three of a kind correctly', () => {
      const holeCards = ['A♠', 'A♥'];
      const communityCards = ['A♦', 'Q♣', '2♠'];
      
      const result = evaluateHand(holeCards, communityCards);
      expect(result.strength).toBe('Three of a Kind');
      expect(result.value).toBe(3);
    });

    test('evaluates flush correctly', () => {
      const holeCards = ['A♠', 'K♠'];
      const communityCards = ['Q♠', 'J♠', '2♠'];
      
      const result = evaluateHand(holeCards, communityCards);
      expect(result.strength).toBe('Flush');
      expect(result.value).toBe(5);
    });

    test('returns incomplete for insufficient cards', () => {
      const holeCards = ['A♠', 'K♥'];
      const communityCards = ['Q♦'];
      
      const result = evaluateHand(holeCards, communityCards);
      expect(result.strength).toBe('Incomplete');
      expect(result.value).toBe(0);
    });
  });

  describe('calculatePotOdds', () => {
    test('calculates pot odds correctly', () => {
      expect(calculatePotOdds(100, 50)).toBe(200);
      expect(calculatePotOdds(200, 100)).toBe(200);
      expect(calculatePotOdds(50, 25)).toBe(200);
    });

    test('returns 0 for zero bet size', () => {
      expect(calculatePotOdds(100, 0)).toBe(0);
      expect(calculatePotOdds(0, 0)).toBe(0);
    });
  });

  describe('getPositionMultiplier', () => {
    test('returns correct multipliers for positions', () => {
      expect(getPositionMultiplier('early')).toBe(0.8);
      expect(getPositionMultiplier('middle')).toBe(1.0);
      expect(getPositionMultiplier('late')).toBe(1.2);
      expect(getPositionMultiplier('button')).toBe(1.3);
      expect(getPositionMultiplier('small_blind')).toBe(0.9);
      expect(getPositionMultiplier('big_blind')).toBe(1.1);
    });

    test('returns default multiplier for unknown position', () => {
      expect(getPositionMultiplier('unknown')).toBe(1.0);
    });
  });

  describe('getPlayerCountAdjustment', () => {
    test('returns correct adjustments for player counts', () => {
      expect(getPlayerCountAdjustment(2)).toBe(1.0);
      expect(getPlayerCountAdjustment(6)).toBe(0.6);
      expect(getPlayerCountAdjustment(10)).toBe(0.2);
    });

    test('never returns less than 0.5', () => {
      expect(getPlayerCountAdjustment(20)).toBe(0.5);
    });
  });

  describe('analyzeHand', () => {
    test('generates recommendation for strong hand', async () => {
      const handData = {
        holeCards: ['A♠', 'A♥'],
        flop: ['A♦', 'K♣', 'Q♠'],
        turn: null,
        river: null,
        numPlayers: 6,
        position: 'button',
        potSize: 100,
        betSize: 0
      };

      const result = await analyzeHand(handData);
      
      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('handStrength');
      expect(result).toHaveProperty('potOdds');
      expect(result).toHaveProperty('ev');
      expect(result).toHaveProperty('reasoning');
      
      // Should recommend raise for three aces
      expect(result.action).toBe('raise');
      expect(result.confidence).toBeGreaterThan(70);
      expect(result.handStrength).toBe('Three of a Kind');
    });

    test('generates recommendation for weak hand', async () => {
      const handData = {
        holeCards: ['2♠', '7♥'],
        flop: ['K♦', 'Q♣', 'J♠'],
        turn: null,
        river: null,
        numPlayers: 6,
        position: 'early',
        potSize: 100,
        betSize: 50
      };

      const result = await analyzeHand(handData);
      
      expect(result.action).toBe('fold');
      expect(result.handStrength).toBe('High Card');
    });

    test('considers pot odds in decision making', async () => {
      const handData = {
        holeCards: ['2♠', '7♥'],
        flop: ['K♦', 'Q♣', 'J♠'],
        turn: null,
        river: null,
        numPlayers: 6,
        position: 'middle',
        potSize: 200,
        betSize: 10 // Very good pot odds
      };

      const result = await analyzeHand(handData);
      
      // With very good pot odds, might call even with weak hand
      expect(['call', 'fold']).toContain(result.action);
    });
  });
}); 