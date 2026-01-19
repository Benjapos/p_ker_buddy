import { Suit, Rank, Card as ICard } from '../types/poker';

export class Card implements ICard {
  constructor(public suit: Suit, public rank: Rank) {}

  get value(): number {
    const rankValues: Record<Rank, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return rankValues[this.rank];
  }

  toString(): string {
    const suitSymbols: Record<Suit, string> = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠'
    };
    return `${this.rank}${suitSymbols[this.suit]}`;
  }

  get color(): 'red' | 'black' {
    return this.suit === 'hearts' || this.suit === 'diamonds' ? 'red' : 'black';
  }
}

