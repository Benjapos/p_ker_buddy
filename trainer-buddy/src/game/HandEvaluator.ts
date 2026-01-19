import { Card, HandStrength, HandRank } from '../types/poker';

export class HandEvaluator {
  static evaluate(cards: Card[]): HandStrength {
    if (cards.length < 5) {
      throw new Error('Need at least 5 cards to evaluate a hand');
    }

    // Get all possible 5-card combinations if we have more than 5 cards
    const combinations = this.getCombinations(cards, 5);
    let bestHand: HandStrength | null = null;

    for (const combo of combinations) {
      const strength = this.evaluateFiveCards(combo);
      if (!bestHand || strength.score > bestHand.score) {
        bestHand = strength;
      }
    }

    return bestHand!;
  }

  private static getCombinations(cards: Card[], k: number): Card[][] {
    const result: Card[][] = [];
    const f = (start: number, currentCombo: Card[]) => {
      if (currentCombo.length === k) {
        result.push([...currentCombo]);
        return;
      }
      for (let i = start; i < cards.length; i++) {
        currentCombo.push(cards[i]);
        f(i + 1, currentCombo);
        currentCombo.pop();
      }
    };
    f(0, []);
    return result;
  }

  private static evaluateFiveCards(cards: Card[]): HandStrength {
    const sorted = [...cards].sort((a, b) => b.value - a.value);
    const ranks = sorted.map(c => c.value);
    const suits = sorted.map(c => c.suit);

    const isFlush = new Set(suits).size === 1;
    const isStraight = this.isStraight(ranks);

    const counts: Record<number, number> = {};
    ranks.forEach(r => counts[r] = (counts[r] || 0) + 1);
    const countValues = Object.values(counts).sort((a, b) => b - a);
    const countEntries = Object.entries(counts)
      .map(([rank, count]) => ({ rank: parseInt(rank), count }))
      .sort((a, b) => b.count !== a.count ? b.count - a.count : b.rank - a.rank);

    // Score calculation: rank * 10^10 + primary_cards_value * 10^x + kickers
    // This ensures rank is most important, then primary group, then kickers.
    
    if (isStraight && isFlush) {
      if (ranks[0] === 14 && ranks[1] === 13) {
        return { rank: 'Royal Flush', value: 9, score: this.calculateScore(9, ranks), cards: sorted };
      }
      return { rank: 'Straight Flush', value: 8, score: this.calculateScore(8, ranks), cards: sorted };
    }

    if (countValues[0] === 4) {
      const quads = countEntries[0].rank;
      const kicker = countEntries[1].rank;
      return { rank: 'Four of a Kind', value: 7, score: this.calculateScore(7, [quads, quads, quads, quads, kicker]), cards: sorted };
    }

    if (countValues[0] === 3 && countValues[1] === 2) {
      const trips = countEntries[0].rank;
      const pair = countEntries[1].rank;
      return { rank: 'Full House', value: 6, score: this.calculateScore(6, [trips, trips, trips, pair, pair]), cards: sorted };
    }

    if (isFlush) {
      return { rank: 'Flush', value: 5, score: this.calculateScore(5, ranks), cards: sorted };
    }

    if (isStraight) {
      return { rank: 'Straight', value: 4, score: this.calculateScore(4, ranks), cards: sorted };
    }

    if (countValues[0] === 3) {
      const trips = countEntries[0].rank;
      const kickers = countEntries.slice(1).map(e => e.rank);
      return { rank: 'Three of a Kind', value: 3, score: this.calculateScore(3, [trips, trips, trips, ...kickers]), cards: sorted };
    }

    if (countValues[0] === 2 && countValues[1] === 2) {
      const highPair = countEntries[0].rank;
      const lowPair = countEntries[1].rank;
      const kicker = countEntries[2].rank;
      return { rank: 'Two Pair', value: 2, score: this.calculateScore(2, [highPair, highPair, lowPair, lowPair, kicker]), cards: sorted };
    }

    if (countValues[0] === 2) {
      const pair = countEntries[0].rank;
      const kickers = countEntries.slice(1).map(e => e.rank);
      return { rank: 'Pair', value: 1, score: this.calculateScore(1, [pair, pair, ...kickers]), cards: sorted };
    }

    return { rank: 'High Card', value: 0, score: this.calculateScore(0, ranks), cards: sorted };
  }

  private static isStraight(ranks: number[]): boolean {
    const uniqueRanks = Array.from(new Set(ranks)).sort((a, b) => b - a);
    if (uniqueRanks.length < 5) return false;

    // Check for standard straight
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
      if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) return true;
    }

    // Check for A-2-3-4-5 straight
    if (uniqueRanks.includes(14) && uniqueRanks.includes(2) && uniqueRanks.includes(3) && 
        uniqueRanks.includes(4) && uniqueRanks.includes(5)) {
      return true;
    }

    return false;
  }

  private static calculateScore(rankValue: number, cardValues: number[]): number {
    // Base 15 because card values go up to 14 (Ace)
    let score = rankValue * Math.pow(15, 5);
    for (let i = 0; i < cardValues.length; i++) {
      score += cardValues[i] * Math.pow(15, 4 - i);
    }
    return score;
  }
}

