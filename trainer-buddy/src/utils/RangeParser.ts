import { Rank, Suit } from '../types/poker';

export class RangeParser {
  private static rankValues: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };

  static isHandInRange(hand: {rank1: Rank, rank2: Rank, isSuited: boolean}, rangeStrings: string[]): boolean {
    const { rank1, rank2, isSuited } = hand;
    const v1 = this.rankValues[rank1];
    const v2 = this.rankValues[rank2];
    const high = Math.max(v1, v2);
    const low = Math.min(v1, v2);

    for (const rangeStr of rangeStrings) {
      if (this.matches(high, low, isSuited, rangeStr)) return true;
    }
    return false;
  }

  private static matches(high: number, low: number, isSuited: boolean, rangeStr: string): boolean {
    // 1. Pairs: 22, 22+, 88-TT
    if (/^[2-9TJQKA]{2}[+-]?$/.test(rangeStr) || /^[2-9TJQKA]{2}-[2-9TJQKA]{2}$/.test(rangeStr)) {
      if (high !== low) return false;
      
      if (rangeStr.includes('-')) {
        const [start, end] = rangeStr.split('-').map(s => this.getRankValue(s[0]));
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        return high >= min && high <= max;
      }

      const rangeRank = this.getRankValue(rangeStr[0]);
      if (rangeStr.endsWith('+')) return high >= rangeRank;
      return high === rangeRank;
    }

    // 2. Suited: A2s, A2s+, K9s-KQs
    if (rangeStr.includes('s')) {
      if (!isSuited) return false;
      return this.matchNonPair(high, low, rangeStr.replace('s', ''));
    }

    // 3. Offsuit: A2o, A2o+, K9o-KQo
    if (rangeStr.includes('o')) {
      if (isSuited) return false;
      return this.matchNonPair(high, low, rangeStr.replace('o', ''));
    }

    return false;
  }

  private static matchNonPair(high: number, low: number, cleanStr: string): boolean {
    // Handling range like K9-KQ (Suited or Offsuit handled by caller)
    if (cleanStr.includes('-')) {
      const [start, end] = cleanStr.split('-');
      const r1 = this.getRankValue(start[0]);
      const r2_start = this.getRankValue(start.substring(1));
      const r2_end = this.getRankValue(end.substring(1));
      
      if (high !== r1) return false;
      const min = Math.min(r2_start, r2_end);
      const max = Math.max(r2_start, r2_end);
      return low >= min && low <= max;
    }

    // Handling + or exact like A2 or A2+
    const r1 = this.getRankValue(cleanStr[0]);
    const r2 = this.getRankValue(cleanStr.substring(1).replace('+', ''));
    
    if (high !== r1) return false;
    if (cleanStr.endsWith('+')) return low >= r2;
    return low === r2;
  }

  private static getRankValue(rankStr: string): number {
    const val = this.rankValues[rankStr];
    if (val === undefined) return parseInt(rankStr);
    return val;
  }
}
