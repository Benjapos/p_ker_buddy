export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // 2-14
}

export type PlayerActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise';

export interface PlayerAction {
  playerId: string;
  type: PlayerActionType;
  amount?: number;
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  cards: Card[];
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  currentBet: number;
  isFolded: boolean;
  isAllIn: boolean;
  hasActed: boolean;
  position: number;
  personality?: 'user' | 'TAG' | 'LAG' | 'TP' | 'LP';
}

export type HandRank = 
  | 'High Card'
  | 'Pair'
  | 'Two Pair'
  | 'Three of a Kind'
  | 'Straight'
  | 'Flush'
  | 'Full House'
  | 'Four of a Kind'
  | 'Straight Flush'
  | 'Royal Flush';

export interface HandStrength {
  rank: HandRank;
  value: number; // 0-9
  score: number; // A unique score to compare hands of the same rank
  cards: Card[]; // The 5 cards that make up the hand
}

export type GamePhase = 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface GameState {
  players: Player[];
  communityCards: Card[];
  pot: number;
  sidePots: { amount: number; players: string[] }[];
  currentPhase: GamePhase;
  dealerIndex: number;
  currentPlayerIndex: number;
  lastAggressorId: string | null;
  lastRaiseAmount: number;
  minRaise: number;
  smallBlind: number;
  bigBlind: number;
}

