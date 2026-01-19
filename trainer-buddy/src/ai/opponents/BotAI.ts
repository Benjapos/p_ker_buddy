import { Player, GameState, HandStrength, PlayerActionType } from '../../types/poker';
import { HandEvaluator } from '../../game/HandEvaluator';
import { RangeParser } from '../../utils/RangeParser';
import rangesData from '../../data/ranges.json';

export class BotAI {
  static getAction(player: Player, gameState: GameState): { action: PlayerActionType; amount?: number } {
    const currentMaxBet = Math.max(...gameState.players.map(p => p.currentBet));
    const callAmount = currentMaxBet - player.currentBet;
    
    // Evaluate current hand strength
    let handStrength: HandStrength | null = null;
    if (gameState.communityCards.length >= 3) {
      handStrength = HandEvaluator.evaluate([...player.cards, ...gameState.communityCards]);
    }

    const personality = player.personality || 'TAG';
    const random = Math.random();
    
    console.log(`[BotAI] ${player.name} (${personality}) is deciding... Phase: ${gameState.currentPhase}, Call Amount: ${callAmount}`);

    // Pre-flop logic
    if (gameState.currentPhase === 'pre-flop') {
      return this.getPreFlopAction(player, gameState, personality, random, callAmount);
    }

    // Post-flop logic
    if (!handStrength) {
      console.log(`[BotAI] ${player.name} has no hand strength (pre-eval), checking/folding.`);
      return callAmount === 0 ? { action: 'check' } : { action: 'fold' };
    }

    const decision = this.getPostFlopAction(player, gameState, personality, handStrength, random, callAmount);
    console.log(`[BotAI] ${player.name} post-flop decision:`, decision);
    return decision;
  }

  private static getPreFlopAction(
    player: Player, 
    gameState: GameState, 
    personality: string, 
    random: number, 
    callAmount: number
  ): { action: PlayerActionType; amount?: number } {
    const hand = {
      rank1: player.cards[0].rank,
      rank2: player.cards[1].rank,
      isSuited: player.cards[0].suit === player.cards[1].suit
    };

    const currentMaxBet = Math.max(...gameState.players.map(p => p.currentBet));
    const isUnopened = currentMaxBet <= gameState.bigBlind;
    const position = this.getPositionName(player, gameState);

    // 1. RFI Logic
    if (isUnopened) {
      const rfiRange = (rangesData.rfi as any)[position] || [];
      if (RangeParser.isHandInRange(hand, rfiRange)) {
        return { action: 'raise', amount: Math.max(gameState.bigBlind * 3, gameState.minRaise) };
      }
      return { action: 'fold' };
    }

    // 2. Facing Raise Logic (Simplified GTO)
    const premiumRange = ["JJ+", "AQs+", "AKo"];
    if (RangeParser.isHandInRange(hand, premiumRange)) {
      return { action: 'raise', amount: currentMaxBet * 3 };
    }

    const callingRange = ["22+", "A2s+", "K9s+", "QTs+", "JTs", "T9s", "AQo+"];
    if (RangeParser.isHandInRange(hand, callingRange) && callAmount <= gameState.bigBlind * 4) {
      return { action: 'call' };
    }

    if (callAmount === 0) return { action: 'check' };
    return { action: 'fold' };
  }

  private static getPositionName(player: Player, gameState: GameState): string {
    const numPlayers = gameState.players.length;
    const dealerIndex = gameState.dealerIndex;
    const playerIndex = gameState.players.findIndex(p => p.id === player.id);
    const diff = (playerIndex - dealerIndex + numPlayers) % numPlayers;

    if (diff === 0) return 'BTN';
    if (numPlayers === 6) {
      if (diff === 1) return 'SB';
      if (diff === 2) return 'BB';
      if (diff === 3) return 'UTG';
      if (diff === 4) return 'MP';
      if (diff === 5) return 'CO';
    }
    return 'MP';
  }

  private static getPostFlopAction(
    player: Player, 
    gameState: GameState, 
    personality: string, 
    strength: HandStrength, 
    random: number, 
    callAmount: number
  ): { action: PlayerActionType; amount?: number } {
    const isAggressive = personality.includes('A');
    const currentMaxBet = Math.max(...gameState.players.map(p => p.currentBet));
    const minTotalBet = currentMaxBet + Math.max(gameState.lastRaiseAmount, gameState.bigBlind);

    // VALUE BETTING / RAISING
    // Full House or better - Monster hand, always build pot
    if (strength.value >= 6) { 
      return { action: 'raise', amount: Math.max(minTotalBet, currentMaxBet + gameState.pot * 0.75) };
    }

    // Flush or Straight - Very strong, usually raise
    if (strength.value >= 4) {
      return { action: 'raise', amount: Math.max(minTotalBet, currentMaxBet + gameState.pot * 0.5) };
    }

    // Three of a Kind (Trips/Set) - Strong hand, should almost always raise/bet for value
    if (strength.value === 3) {
      return { action: 'raise', amount: Math.max(minTotalBet, currentMaxBet + gameState.pot * 0.6) };
    }

    // Two Pair - Strong, but vulnerable. Aggressive players raise.
    if (strength.value === 2) {
      if (isAggressive || random > 0.2) {
        return { action: 'raise', amount: Math.max(minTotalBet, currentMaxBet + gameState.pot * 0.5) };
      }
      return { action: 'call' };
    }

    // One Pair - Top pair or high kicker
    if (strength.value === 1) {
      const isTopPair = strength.cards[0].value === gameState.communityCards.sort((a,b) => b.value - a.value)[0].value;
      if (isTopPair && (isAggressive || random > 0.5)) {
        return { action: 'raise', amount: Math.max(minTotalBet, currentMaxBet + gameState.pot * 0.3) };
      }
      if (callAmount === 0) return { action: 'check' };
      return random > 0.4 ? { action: 'call' } : { action: 'fold' };
    }

    // BLUFFING / DRAWS
    if (callAmount === 0) {
      // Semi-bluff with aggressive personality
      if (isAggressive && random > 0.8) {
        return { action: 'raise', amount: Math.max(minTotalBet, currentMaxBet + gameState.pot * 0.4) };
      }
      return { action: 'check' };
    }

    return { action: 'fold' };
  }
}
