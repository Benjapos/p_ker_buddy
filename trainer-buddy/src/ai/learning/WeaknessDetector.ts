import { PlayerActionType, GamePhase } from '../../types/poker';

export interface UserDecision {
  phase: GamePhase;
  action: PlayerActionType;
  isCorrect: boolean;
  severity: string;
}

export interface Weakness {
  id: string;
  name: string;
  description: string;
  count: number;
}

export class WeaknessDetector {
  static analyze(decisions: UserDecision[]): Weakness[] {
    const weaknesses: Weakness[] = [];
    
    // Check for "Too Foldy Pre-flop"
    const preFlopFolds = decisions.filter(d => d.phase === 'pre-flop' && d.action === 'fold' && !d.isCorrect).length;
    if (preFlopFolds >= 3) {
      weaknesses.push({
        id: 'tight_preflop',
        name: 'Folding too much pre-flop',
        description: 'You are folding hands that have potential. Try playing more suited connectors or high cards.',
        count: preFlopFolds
      });
    }

    // Check for "Passive Post-flop"
    const passivePlays = decisions.filter(d => d.phase !== 'pre-flop' && d.action === 'call' && !d.isCorrect).length;
    if (passivePlays >= 3) {
      weaknesses.push({
        id: 'passive_postflop',
        name: 'Playing too passively',
        description: 'You are calling when you should be raising. Take initiative to build pots with strong hands.',
        count: passivePlays
      });
    }

    // Check for "Chasing Draws"
    const chasing = decisions.filter(d => d.action === 'call' && !d.isCorrect && d.severity === 'minor').length;
    if (chasing >= 3) {
      weaknesses.push({
        id: 'chasing_draws',
        name: 'Chasing weak draws',
        description: 'You are calling bets without the right pot odds to complete your draws.',
        count: chasing
      });
    }

    return weaknesses;
  }
}

