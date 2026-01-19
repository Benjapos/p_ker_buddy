import { Card, Suit, Rank } from '../types/poker';

export interface BoardTexture {
  isDry: boolean;
  isWet: boolean;
  isPaired: boolean;
  isMonotone: boolean;
  isConnected: boolean;
  description: string;
}

export interface DrawInfo {
  type: 'none' | 'flush-draw' | 'oesd' | 'gutshot' | 'combo-draw';
  outs: number;
  equity: number; // Estimated percentage
}

export class PokerMath {
  /**
   * Calculates the pot odds as a percentage.
   * This is the percentage of the total pot you need to win to break even on a call.
   */
  static calculatePotOdds(callAmount: number, totalPot: number): number {
    if (callAmount === 0) return 0;
    const finalPot = totalPot + callAmount;
    return (callAmount / finalPot) * 100;
  }

  /**
   * Analyzes the board texture based on community cards.
   */
  static analyzeTexture(cards: Card[]): BoardTexture {
    if (cards.length < 3) {
      return { isDry: true, isWet: false, isPaired: false, isMonotone: false, isConnected: false, description: 'Pre-flop' };
    }

    const values = cards.map(c => c.value).sort((a, b) => a - b);
    const suits = cards.map(c => c.suit);

    // Monotone check
    const suitCounts: Record<Suit, number> = {} as any;
    suits.forEach(s => suitCounts[s] = (suitCounts[s] || 0) + 1);
    const isMonotone = Object.values(suitCounts).some(count => count >= 3);

    // Paired check
    const valueCounts: Record<number, number> = {};
    values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
    const isPaired = Object.values(valueCounts).some(count => count >= 2);

    // Connected check (3 cards within a 4-card span, e.g., 7-8-9 or 7-8-J)
    let isConnected = false;
    if (values.length >= 3) {
      for (let i = 0; i <= values.length - 3; i++) {
        if (values[i + 2] - values[i] <= 4) {
          isConnected = true;
          break;
        }
      }
    }

    // A board is generally considered "wet" if it's connected, monotone, or heavily dynamic
    const isWet = isConnected || isMonotone || (values.length >= 3 && values[values.length - 1] - values[0] <= 5);
    const isDry = !isWet && !isPaired;

    let description = isDry ? 'Dry' : 'Dynamic';
    if (isMonotone) description = 'Monotone';
    if (isPaired) description += ' / Paired';

    return { isDry, isWet, isPaired, isMonotone, isConnected, description };
  }

  /**
   * Estimates outs and equity for draws using the Rule of 2 and 4.
   */
  static identifyDraws(holeCards: Card[], communityCards: Card[]): DrawInfo {
    const allCards = [...holeCards, ...communityCards];
    const suits = allCards.map(c => c.suit);
    const values = Array.from(new Set(allCards.map(c => c.value))).sort((a, b) => a - b);

    let outs = 0;
    let type: DrawInfo['type'] = 'none';

    // Flush Draw Check (4 of a suit)
    const suitCounts: Record<Suit, number> = {} as any;
    suits.forEach(s => suitCounts[s] = (suitCounts[s] || 0) + 1);
    const hasFlushDraw = Object.values(suitCounts).some(count => count === 4);

    // Straight Draw Check (OESD or Gutshot)
    let hasOESD = false;
    let hasGutshot = false;

    if (values.length >= 4) {
      for (let i = 0; i <= values.length - 4; i++) {
        const span = values[i + 3] - values[i];
        if (span === 3) hasOESD = true; // e.g., 7-8-9-T
        else if (span === 4) hasGutshot = true; // e.g., 7-8-T-J or 7-9-T-J
      }
      
      // Special case: A-2-3-4 or A-K-Q-J
      const lowStraight = [14, 2, 3, 4, 5];
      const highStraight = [14, 13, 12, 11, 10];
      
      const lowMatchCount = lowStraight.filter(v => values.includes(v)).length;
      const highMatchCount = highStraight.filter(v => values.includes(v)).length;
      
      if (lowMatchCount === 4 || highMatchCount === 4) hasGutshot = true;
    }

    if (hasFlushDraw && (hasOESD || hasGutshot)) {
      type = 'combo-draw';
      outs = 15; // 9 for flush + roughly 6-8 for straight
    } else if (hasFlushDraw) {
      type = 'flush-draw';
      outs = 9;
    } else if (hasOESD) {
      type = 'oesd';
      outs = 8;
    } else if (hasGutshot) {
      type = 'gutshot';
      outs = 4;
    }

    // Rule of 2 and 4
    // 1 card to come: outs * 2
    // 2 cards to come (flop): outs * 4
    const cardsToCome = communityCards.length === 3 ? 4 : (communityCards.length === 4 ? 2 : 0);
    const equity = outs * cardsToCome;

    return { type, outs, equity };
  }
}

