import { Player } from '../types/poker';

export interface SidePot {
  amount: number;
  players: string[];
}

export class PotManager {
  private pots: SidePot[] = [];

  calculatePots(players: Player[]): SidePot[] {
    const activePlayers = players.filter(p => !p.isFolded && p.currentBet > 0);
    if (activePlayers.length === 0) return this.pots;

    // This is a simplified version. For a real game, side pots are calculated
    // when players go all-in with different amounts.
    const totalPot = players.reduce((sum, p) => sum + p.currentBet, 0);
    
    // For now, let's just handle a single main pot
    const activePlayerIds = players.filter(p => !p.isFolded).map(p => p.id);
    this.pots = [{ amount: totalPot, players: activePlayerIds }];
    
    return this.pots;
  }

  get totalAmount(): number {
    return this.pots.reduce((sum, pot) => sum + pot.amount, 0);
  }

  reset(): void {
    this.pots = [];
  }
}

