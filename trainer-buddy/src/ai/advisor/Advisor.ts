import { Player, GameState, PlayerActionType } from '../../types/poker';
import { RangeParser } from '../../utils/RangeParser';
import { PokerMath, DrawInfo, BoardTexture } from '../../utils/PokerMath';
import { HandEvaluator } from '../../game/HandEvaluator';
import rangesData from '../../data/ranges.json';

export interface AdvisorFeedback {
  action: PlayerActionType;
  advice: string;
  isCorrect: boolean;
  severity: 'none' | 'minor' | 'major';
  expectedSizing?: string;
  potOdds?: number;
  equity?: number;
}

export class Advisor {
  static analyze(
    player: Player, 
    gameState: GameState, 
    action: PlayerActionType, 
    amount?: number
  ): AdvisorFeedback {
    const isPreFlop = gameState.currentPhase === 'pre-flop';
    
    if (isPreFlop) {
      return this.analyzePreFlop(player, gameState, action, amount);
    }

    // For post-flop, we'll keep the existing logic but refine the justifications
    return this.analyzePostFlop(player, gameState, action, amount);
  }

  private static analyzePreFlop(player: Player, gameState: GameState, action: PlayerActionType, amount?: number): AdvisorFeedback {
    const position = this.getPositionName(player, gameState);
    const currentMaxBet = Math.max(...gameState.players.map(p => p.currentBet));
    const isUnopened = currentMaxBet <= gameState.bigBlind;

    const hand = {
      rank1: player.cards[0].rank,
      rank2: player.cards[1].rank,
      isSuited: player.cards[0].suit === player.cards[1].suit
    };

    // 1. Unopened Pot (RFI)
    if (isUnopened) {
      const rfiRange = (rangesData.rfi as any)[position] || [];
      const isInRange = RangeParser.isHandInRange(hand, rfiRange);
      const isRaisingAction = action === 'raise' || action === 'bet';

      if (isInRange) {
        if (isRaisingAction) {
          return {
            action: 'raise',
            advice: `Excellent. In ${position}, this hand is a standard GTO Open-Raise. By raising, you take the initiative and maximize your Fold Equity.`,
            isCorrect: true,
            severity: 'none'
          };
        } else {
          return {
            action: 'raise',
            advice: `In ${position}, you should be raising this hand. Calling (limping) is a common leak; it lacks "Fold Equity" and makes you easy to exploit.`,
            isCorrect: false,
            severity: action === 'fold' ? 'major' : 'minor'
          };
        }
      } else {
        if (action === 'fold') {
          return {
            action: 'fold',
            advice: `Correct fold. In ${position}, this hand is too weak to open. Folding prevents you from getting into difficult spots out of position.`,
            isCorrect: true,
            severity: 'none'
          };
        } else {
          return {
            action: 'fold',
            advice: `In ${position}, this hand is outside your GTO range. This is a "Range Asymmetry" leak—playing too many marginal hands from this position.`,
            isCorrect: false,
            severity: 'minor'
          };
        }
      }
    }

    // 2. Facing an Open Raise
    const aggressorId = gameState.lastAggressorId;
    const aggressor = gameState.players.find(p => p.id === aggressorId);
    const aggressorPos = aggressor ? this.getPositionName(aggressor, gameState) : 'UTG';
    
    // Check specific vs_open range (e.g. BB_vs_BTN)
    const vsOpenKey = `${position}_vs_${aggressorPos}`;
    const vsOpenRange = (rangesData.vs_open as any)[vsOpenKey];
    
    if (vsOpenRange) {
      const is3Bet = RangeParser.isHandInRange(hand, vsOpenRange.three_bet);
      const isCall = RangeParser.isHandInRange(hand, vsOpenRange.call);
      
      if (is3Bet) {
        if (action === 'raise') return { action: 'raise', advice: `Great 3-bet. This hand is a strong favorite against the ${aggressorPos} opening range.`, isCorrect: true, severity: 'none' };
        return { action: 'raise', advice: `You should be 3-betting here. This hand is too strong to just call or fold against a ${aggressorPos} open.`, isCorrect: false, severity: 'minor' };
      }
      
      if (isCall) {
        if (action === 'call') return { action: 'call', advice: `Solid call. In the ${position}, you have the right price to see a flop with this hand.`, isCorrect: true, severity: 'none' };
        if (action === 'raise') return { action: 'call', advice: `A call is better here. Raising bloats the pot with a hand that prefers to play post-flop with lower variance.`, isCorrect: false, severity: 'minor' };
        return { action: 'call', advice: `Don't fold this. You're in the ${position} and getting a good price to defend.`, isCorrect: false, severity: 'minor' };
      }
      
      if (action === 'fold') return { action: 'fold', advice: `Good fold. This hand is too weak to continue against a ${aggressorPos} raise.`, isCorrect: true, severity: 'none' };
      return { action: 'fold', advice: `Fold is the standard play here. Don't bleed chips with marginal hands against an open raise.`, isCorrect: false, severity: 'minor' };
    }

    // Fallback: Check general 3-betting ranges
    const general3BetRange = (rangesData.three_bet as any)[position] || [];
    if (RangeParser.isHandInRange(hand, general3BetRange)) {
      if (action === 'raise') return { action: 'raise', advice: `Aggressive and correct. This is a premium 3-betting hand from ${position}.`, isCorrect: true, severity: 'none' };
      return { action: 'raise', advice: `Standard 3-bet. You should be re-raising with this premium hand to build value.`, isCorrect: false, severity: 'major' };
    }

    if (action === 'fold') {
      return { action: 'fold', advice: "Correct fold against the open raise.", isCorrect: true, severity: 'none' };
    }

    return {
      action: 'fold',
      advice: "This hand is likely too weak to continue. Folding is the safest and most standard GTO play here.",
      isCorrect: false,
      severity: 'minor'
    };
  }

  private static analyzePostFlop(player: Player, gameState: GameState, action: PlayerActionType, amount?: number): AdvisorFeedback {
    const currentMaxBet = Math.max(...gameState.players.map(p => p.currentBet));
    const callAmount = currentMaxBet - player.currentBet;
    const totalPot = gameState.pot;
    const wasLastAggressor = gameState.lastAggressorId === player.id;
    
    const potOdds = PokerMath.calculatePotOdds(callAmount, totalPot);
    const texture = PokerMath.analyzeTexture(gameState.communityCards);
    const drawInfo = PokerMath.identifyDraws(player.cards, gameState.communityCards);
    const handStrength = HandEvaluator.evaluate([...player.cards, ...gameState.communityCards]);

    // 1. Check for Fold errors based on Math (Pot Odds vs Equity)
    if (action === 'fold' && callAmount > 0) {
      if (drawInfo.equity > potOdds) {
        return {
          action: 'call',
          advice: `Mathematical Error. You have ${drawInfo.equity.toFixed(1)}% equity with a ${drawInfo.type}, but you only need ${potOdds.toFixed(1)}% to break even. This is a profitable call long-term.`,
          isCorrect: false,
          severity: 'major',
          potOdds,
          equity: drawInfo.equity
        };
      }
      
      if (handStrength.value >= 1) { // At least a pair
        return {
          action: 'call',
          advice: `Too tight. You have ${handStrength.rank} on a ${texture.description} board. Folding here is over-folding; you should at least call to see the next card.`,
          isCorrect: false,
          severity: 'minor'
        };
      }
    }

    // 2. Betting Strategy (C-bets and Value Bets)
    if (action === 'check' && callAmount === 0) {
      // C-betting logic
      if (wasLastAggressor && gameState.currentPhase === 'flop') {
        const sizing = texture.isDry ? '33% Pot' : '65% Pot';
        const reasoning = texture.isDry 
          ? "This is a 'Dry' board. A small C-bet (33% pot) is highly effective here to fold out air."
          : "This is a 'Wet' board. You need to bet larger (65%+ pot) to protect your equity against draws.";
          
        return {
          action: 'bet',
          advice: `Continuation Bet Opportunity. ${reasoning}`,
          isCorrect: true,
          severity: 'none',
          expectedSizing: sizing
        };
      }

      // Value betting
      if (handStrength.value >= 2) { // Two Pair or better
        return {
          action: 'bet',
          advice: `Value Bet Missed. You have ${handStrength.rank}. On this ${texture.description} board, you should be building the pot to get paid by weaker hands.`,
          isCorrect: false,
          severity: 'minor',
          expectedSizing: '75% Pot'
        };
      }
    }

    // 3. Sizing Feedback for Bets/Raises
    if ((action === 'bet' || action === 'raise') && amount) {
      const betSizeRelative = (amount - currentMaxBet) / totalPot;
      
      if (texture.isDry && betSizeRelative > 0.6) {
        return {
          action: 'bet',
          advice: "Sizing Warning: You're betting very large on a dry board. While it might work, GTO players typically use smaller sizes (33%) here to stay balanced and keep opponents in with worse hands.",
          isCorrect: true,
          severity: 'none',
          expectedSizing: '33% Pot'
        };
      }

      if (texture.isWet && betSizeRelative < 0.4) {
        return {
          action: 'bet',
          advice: "Sizing Warning: This is a wet board with many draws. You're giving your opponents too good of a price to chase. Increase sizing to 65-75% pot to protect your hand.",
          isCorrect: true,
          severity: 'none',
          expectedSizing: '75% Pot'
        };
      }
    }

    return {
      action,
      advice: `Good logic. You're playing correctly based on ${handStrength.rank} and the ${texture.description} board texture.`,
      isCorrect: true,
      severity: 'none',
      potOdds: callAmount > 0 ? potOdds : undefined,
      equity: drawInfo.type !== 'none' ? drawInfo.equity : undefined
    };
  }

  private static getPositionName(player: Player, gameState: GameState): string {
    const numPlayers = gameState.players.length;
    const dealerIndex = gameState.dealerIndex;
    const playerIndex = gameState.players.findIndex(p => p.id === player.id);
    
    // Relative to dealer
    const diff = (playerIndex - dealerIndex + numPlayers) % numPlayers;

    if (diff === 0) return 'BTN';
    if (numPlayers === 6) {
      if (diff === 1) return 'SB';
      if (diff === 2) return 'BB';
      if (diff === 3) return 'UTG';
      if (diff === 4) return 'MP';
      if (diff === 5) return 'CO';
    }
    
    // Fallback for different table sizes
    if (diff === numPlayers - 1) return 'CO';
    return 'MP';
  }
}

