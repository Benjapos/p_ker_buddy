import { Player, Card, GamePhase, GameState as IGameState } from '../types/poker';
import { Deck } from './Deck';
import { HandEvaluator } from './HandEvaluator';

export class GameEngine {
  private state: IGameState;
  private deck: Deck;

  constructor(players: Player[], smallBlind: number, bigBlind: number) {
    this.deck = new Deck();
    this.state = {
      players,
      communityCards: [],
      pot: 0,
      sidePots: [],
      currentPhase: 'pre-flop',
      dealerIndex: 0,
      currentPlayerIndex: 0,
      lastAggressorId: null,
      lastRaiseAmount: 0,
      minRaise: bigBlind,
      smallBlind,
      bigBlind
    };
  }

  getState(): IGameState {
    // Return a deep copy to ensure immutability for React state updates
    return JSON.parse(JSON.stringify(this.state));
  }

  startNewHand(): void {
    this.deck.reset();
    this.deck.shuffle();

    const nextDealerIndex = (this.state.dealerIndex + 1) % this.state.players.length;

    const newPlayers = this.state.players.map((player, index) => ({
      ...player,
      cards: [this.deck.deal()!, this.deck.deal()!],
      isFolded: false,
      isAllIn: false,
      hasActed: false,
      currentBet: 0,
      isDealer: index === nextDealerIndex,
      isSmallBlind: index === (nextDealerIndex + 1) % this.state.players.length,
      isBigBlind: index === (nextDealerIndex + 2) % this.state.players.length
    }));

    this.state = {
      ...this.state,
      players: newPlayers,
      communityCards: [],
      pot: 0,
      sidePots: [],
      currentPhase: 'pre-flop',
      lastAggressorId: null,
      dealerIndex: nextDealerIndex
    };

    // Post blinds
    const sbIndex = (nextDealerIndex + 1) % this.state.players.length;
    const bbIndex = (nextDealerIndex + 2) % this.state.players.length;
    
    this.postBlind(sbIndex, this.state.smallBlind);
    this.postBlind(bbIndex, this.state.bigBlind);

    this.state.currentPlayerIndex = (bbIndex + 1) % this.state.players.length;
    this.state.lastRaiseAmount = this.state.bigBlind;
    this.state.minRaise = this.state.bigBlind * 2;
  }

  private postBlind(playerIndex: number, amount: number): void {
    const player = this.state.players[playerIndex];
    const actualAmount = Math.min(player.chips, amount);
    
    const updatedPlayers = [...this.state.players];
    updatedPlayers[playerIndex] = {
      ...player,
      chips: player.chips - actualAmount,
      currentBet: actualAmount,
      isAllIn: player.chips - actualAmount === 0
    };

    this.state = {
      ...this.state,
      players: updatedPlayers,
      pot: this.state.pot + actualAmount
    };
  }

  processAction(playerId: string, action: 'fold' | 'check' | 'call' | 'bet' | 'raise', amount?: number): boolean {
    const playerIndex = this.state.players.findIndex(p => p.id === playerId);
    if (playerIndex !== this.state.currentPlayerIndex) return false;

    const player = this.state.players[playerIndex];
    const currentMaxBet = Math.max(...this.state.players.map(p => p.currentBet));
    const callAmount = currentMaxBet - player.currentBet;

    switch (action) {
      case 'fold':
        player.isFolded = true;
        break;

      case 'check':
        if (callAmount > 0) return false;
        break;

      case 'call':
        if (callAmount === 0 && this.state.currentPhase !== 'pre-flop') return false; 
        const actualCall = Math.min(player.chips, callAmount);
        player.chips -= actualCall;
        player.currentBet += actualCall;
        this.state.pot += actualCall;
        if (player.chips === 0) player.isAllIn = true;
        break;

      case 'bet':
      case 'raise':
        if (amount === undefined) return false;
        
        // amount is the TOTAL bet the player wants to have in front of them
        const totalBet = amount;
        const incrementalRaise = totalBet - currentMaxBet;
        const playerContribution = totalBet - player.currentBet;

        // Validation:
        // 1. Must be more than current max bet
        if (totalBet <= currentMaxBet && player.chips > playerContribution) return false;
        
        // 2. Must meet minimum raise requirement (unless all-in)
        if (incrementalRaise < this.state.lastRaiseAmount && player.chips > playerContribution) {
          return false;
        }

        if (playerContribution > player.chips) return false;

        player.chips -= playerContribution;
        player.currentBet = totalBet;
        this.state.pot += playerContribution;
        this.state.lastAggressorId = player.id;
        
        this.state.lastRaiseAmount = incrementalRaise;
        this.state.minRaise = totalBet + incrementalRaise;
        
        if (player.chips === 0) player.isAllIn = true;

        // Reset hasActed for everyone else when a raise occurs
        this.state.players.forEach(p => {
          if (p.id !== player.id) {
            p.hasActed = false;
          }
        });
        break;
    }

    player.hasActed = true;
    this.moveToNextPlayer();
    return true;
  }

  private moveToNextPlayer(): void {
    const playersStillIn = this.state.players.filter(p => !p.isFolded);
    
    // Check if everyone else folded
    if (playersStillIn.length <= 1) {
      console.log(`[GameEngine] Hand over - everyone folded. Winner: ${playersStillIn[0]?.name}`);
      this.state.currentPhase = 'showdown';
      this.resolveShowdown();
      return;
    }

    // Check if betting round is over
    if (this.isBettingRoundOver()) {
      console.log(`[GameEngine] Betting round over for phase ${this.state.currentPhase}`);
      this.advancePhase();
    } else {
      let nextIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
      let safetyCounter = 0;
      
      // Find next active player
      while (
        (this.state.players[nextIndex].isFolded || this.state.players[nextIndex].isAllIn) && 
        safetyCounter < this.state.players.length
      ) {
        nextIndex = (nextIndex + 1) % this.state.players.length;
        safetyCounter++;
      }
      
      console.log(`[GameEngine] Moving turn from ${this.state.currentPlayerIndex} to ${nextIndex}`);
      this.state.currentPlayerIndex = nextIndex;
    }
  }

  private isBettingRoundOver(): boolean {
    const playersStillIn = this.state.players.filter(p => !p.isFolded);
    const activePlayers = playersStillIn.filter(p => !p.isAllIn);
    
    if (playersStillIn.length <= 1) return true;

    const currentMaxBet = Math.max(...this.state.players.map(p => p.currentBet));
    
    // Round is over if:
    // 1. All active players have matched the currentMaxBet
    // 2. All active players have had a chance to act (hasActed is true)
    const allMatched = activePlayers.every(p => p.currentBet === currentMaxBet);
    const everyoneActed = activePlayers.every(p => p.hasActed);

    return allMatched && everyoneActed;
  }

  private advancePhase(): void {
    // Reset current bets for the next round
    this.state.players.forEach(p => {
      p.currentBet = 0;
      p.hasActed = false;
    });
    this.state.lastRaiseAmount = this.state.bigBlind;
    this.state.minRaise = this.state.bigBlind * 2;

    switch (this.state.currentPhase) {
      case 'pre-flop':
        this.state.currentPhase = 'flop';
        this.state.communityCards.push(this.deck.deal()!, this.deck.deal()!, this.deck.deal()!);
        break;
      case 'flop':
        this.state.currentPhase = 'turn';
        this.state.communityCards.push(this.deck.deal()!);
        break;
      case 'turn':
        this.state.currentPhase = 'river';
        this.state.communityCards.push(this.deck.deal()!);
        break;
      case 'river':
        this.state.currentPhase = 'showdown';
        this.resolveShowdown();
        return;
    }

    // After pre-flop, the first active player after the dealer starts
    let nextIndex = (this.state.dealerIndex + 1) % this.state.players.length;
    while (this.state.players[nextIndex].isFolded || this.state.players[nextIndex].isAllIn) {
      nextIndex = (nextIndex + 1) % this.state.players.length;
    }
    this.state.currentPlayerIndex = nextIndex;
  }

  private resolveShowdown(): void {
    const activePlayers = this.state.players.filter(p => !p.isFolded);
    if (activePlayers.length === 0) return;

    // Special case: if only one player left (everyone else folded)
    if (activePlayers.length === 1) {
      const winnerIndex = this.state.players.findIndex(p => p.id === activePlayers[0].id);
      const updatedPlayers = [...this.state.players];
      updatedPlayers[winnerIndex] = {
        ...updatedPlayers[winnerIndex],
        chips: updatedPlayers[winnerIndex].chips + this.state.pot
      };
      
      console.log(`[GameEngine] Winner by fold: ${updatedPlayers[winnerIndex].name} wins $${this.state.pot}`);
      
      this.state = {
        ...this.state,
        players: updatedPlayers,
        pot: 0
      };
      return;
    }

    const playerStrengths = activePlayers.map(p => ({
      playerId: p.id,
      strength: HandEvaluator.evaluate([...p.cards, ...this.state.communityCards])
    }));

    playerStrengths.sort((a, b) => b.strength.score - a.strength.score);
    
    const winners = playerStrengths.filter(ps => ps.strength.score === playerStrengths[0].strength.score);
    const winAmount = Math.floor(this.state.pot / winners.length);

    const updatedPlayers = this.state.players.map(player => {
      const isWinner = winners.some(w => w.playerId === player.id);
      if (isWinner) {
        return { ...player, chips: player.chips + winAmount };
      }
      return player;
    });

    this.state = {
      ...this.state,
      players: updatedPlayers,
      pot: 0
    };
  }
}

