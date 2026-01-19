import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState, Player, Card } from '../types/poker';
import { GameEngine } from '../game/GameEngine';
import { BotAI } from '../ai/opponents/BotAI';
import { Advisor, AdvisorFeedback } from '../ai/advisor/Advisor';
import { WeaknessDetector, UserDecision, Weakness } from '../ai/learning/WeaknessDetector';

interface PokerStore {
  gameState: GameState | null;
  engine: GameEngine | null;
  isProcessingBot: boolean;
  lastFeedback: AdvisorFeedback | null;
  decisions: UserDecision[];
  weaknesses: Weakness[];
  persistenceEnabled: boolean;
  initGame: (players: Player[]) => void;
  startNewHand: () => void;
  performAction: (playerId: string, action: 'fold' | 'check' | 'call' | 'bet' | 'raise', amount?: number) => void;
  triggerBotAction: () => Promise<void>;
  clearFeedback: () => void;
  togglePersistence: (enabled: boolean) => void;
  resetSession: () => void;
}

export const usePokerStore = create<PokerStore>()(
  persist(
    (set, get) => ({
      gameState: null,
      engine: null,
      isProcessingBot: false,
      lastFeedback: null,
      decisions: [],
      weaknesses: [],
      persistenceEnabled: true,

      initGame: (players: Player[]) => {
        console.log('Initializing game...');
        // If persistence is enabled, we might want to restore chips from the last session
        const storedDecisions = get().decisions;
        const storedWeaknesses = get().weaknesses;
        
        const engine = new GameEngine(players, 10, 20);
        engine.startNewHand();
        set({ engine, gameState: engine.getState() });
        
        const state = engine.getState();
        if (state.players[state.currentPlayerIndex].personality !== 'user') {
          get().triggerBotAction();
        }
      },

      startNewHand: () => {
        const { engine } = get();
        if (engine) {
          engine.startNewHand();
          const state = engine.getState();
          set({ gameState: state, lastFeedback: null });
          
          if (state.players[state.currentPlayerIndex].personality !== 'user') {
            get().triggerBotAction();
          }
        }
      },

      performAction: (playerId: string, action, amount) => {
        const { engine, isProcessingBot, gameState, decisions } = get();
        if (engine && (!isProcessingBot || playerId === 'user')) {
          if (playerId === 'user' && gameState) {
            const feedback = Advisor.analyze(
              gameState.players[gameState.currentPlayerIndex],
              gameState,
              action,
              amount
            );
            
            const newDecision: UserDecision = {
              phase: gameState.currentPhase,
              action,
              isCorrect: feedback.isCorrect,
              severity: feedback.severity
            };
            
            const updatedDecisions = [...decisions, newDecision];
            const updatedWeaknesses = WeaknessDetector.analyze(updatedDecisions);
            
            set({ 
              lastFeedback: feedback,
              decisions: updatedDecisions,
              weaknesses: updatedWeaknesses
            });
          }

          const success = engine.processAction(playerId, action, amount);
          if (success) {
            const newState = engine.getState();
            
            if (newState.currentPhase === 'showdown') {
              set({ gameState: newState, lastFeedback: null });
            } else {
              set({ gameState: newState });
              
              if (newState.players[newState.currentPlayerIndex].personality !== 'user') {
                get().triggerBotAction();
              }
            }
          } else if (playerId !== 'user') {
            console.error(`[PokerStore] Bot ${playerId} action ${action} failed! Forcing fold.`);
            engine.processAction(playerId, 'fold');
            set({ gameState: engine.getState() });
            
            const newState = engine.getState();
            if (newState.currentPhase !== 'showdown' && 
                newState.players[newState.currentPlayerIndex].personality !== 'user') {
              get().triggerBotAction();
            }
          }
        }
      },

      triggerBotAction: async () => {
        const { engine, isProcessingBot } = get();
        if (!engine || isProcessingBot) return;

        const state = engine.getState();
        const bot = state.players[state.currentPlayerIndex];
        
        if (!bot || bot.personality === 'user' || state.currentPhase === 'showdown') {
          return;
        }

        set({ isProcessingBot: true });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

          const currentState = engine.getState();
          const currentBot = currentState.players[currentState.currentPlayerIndex];
          
          if (!currentBot || currentBot.personality === 'user' || currentState.currentPhase === 'showdown') {
            set({ isProcessingBot: false });
            return;
          }

          const decision = BotAI.getAction(currentBot, currentState);
          const success = engine.processAction(currentBot.id, decision.action, decision.amount);
          
          if (success) {
            set({ gameState: engine.getState(), isProcessingBot: false });
            
            const newState = engine.getState();
            if (newState.currentPhase !== 'showdown' && 
                newState.players[newState.currentPlayerIndex].personality !== 'user') {
              get().triggerBotAction();
            }
          } else {
            engine.processAction(currentBot.id, 'fold');
            set({ gameState: engine.getState(), isProcessingBot: false });
            
            const newState = engine.getState();
            if (newState.currentPhase !== 'showdown' && 
                newState.players[newState.currentPlayerIndex].personality !== 'user') {
              get().triggerBotAction();
            }
          }
        } catch (error) {
          console.error('[PokerStore] Error in bot action:', error);
          set({ isProcessingBot: false });
        }
      },

      clearFeedback: () => set({ lastFeedback: null }),

      togglePersistence: (enabled: boolean) => set({ persistenceEnabled: enabled }),

      resetSession: () => {
        const { engine } = get();
        if (engine) {
          const state = engine.getState();
          const resetPlayers = state.players.map(p => ({ ...p, chips: 1000 }));
          // We can't easily reset the engine's internal state without re-initializing
          // but we can at least clear the stats
          set({ 
            decisions: [], 
            weaknesses: [], 
            gameState: { ...state, players: resetPlayers } 
          });
          // To fully reset chips we'd need engine support or re-init
          window.location.reload(); // Hard reset is safest for chips
        } else {
          set({ decisions: [], weaknesses: [] });
        }
      }
    }),
    {
      name: 'poker-trainer-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => 
        state.persistenceEnabled 
          ? { 
              decisions: state.decisions, 
              weaknesses: state.weaknesses, 
              persistenceEnabled: state.persistenceEnabled 
            } 
          : { persistenceEnabled: false },
    }
  )
);

