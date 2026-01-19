import React, { useEffect } from 'react';
import { usePokerStore } from '../../store/gameStore';
import { PlayerSeat } from './PlayerSeat';
import { CardUI } from './CardUI';

const SEAT_POSITIONS = [
  { top: '85%', left: '50%' }, // Player (Bottom)
  { top: '65%', left: '15%' }, // Bottom Left
  { top: '35%', left: '15%' }, // Top Left
  { top: '15%', left: '50%' }, // Top
  { top: '35%', left: '85%' }, // Top Right
  { top: '65%', left: '85%' }, // Bottom Right
];

export const PokerTable: React.FC = () => {
  const { gameState, initGame } = usePokerStore();

  useEffect(() => {
    if (!gameState) {
      initGame([
        { id: 'user', name: 'You', chips: 1000, cards: [], isDealer: false, isSmallBlind: false, isBigBlind: false, currentBet: 0, isFolded: false, isAllIn: false, hasActed: false, position: 0, personality: 'user' },
        { id: 'bot1', name: 'Tight Tim', chips: 1000, cards: [], isDealer: false, isSmallBlind: false, isBigBlind: false, currentBet: 0, isFolded: false, isAllIn: false, hasActed: false, position: 1, personality: 'TAG' },
        { id: 'bot2', name: 'Loose Lou', chips: 1000, cards: [], isDealer: false, isSmallBlind: false, isBigBlind: false, currentBet: 0, isFolded: false, isAllIn: false, hasActed: false, position: 2, personality: 'LAG' },
        { id: 'bot3', name: 'Passive Pat', chips: 1000, cards: [], isDealer: false, isSmallBlind: false, isBigBlind: false, currentBet: 0, isFolded: false, isAllIn: false, hasActed: false, position: 3, personality: 'TP' },
        { id: 'bot4', name: 'Gambling Gus', chips: 1000, cards: [], isDealer: false, isSmallBlind: false, isBigBlind: false, currentBet: 0, isFolded: false, isAllIn: false, hasActed: false, position: 4, personality: 'LP' },
        { id: 'bot5', name: 'Steady Sam', chips: 1000, cards: [], isDealer: false, isSmallBlind: false, isBigBlind: false, currentBet: 0, isFolded: false, isAllIn: false, hasActed: false, position: 5, personality: 'TAG' },
      ]);
    }
  }, [gameState, initGame]);

  if (!gameState) return <div className="text-white">Loading game...</div>;

  return (
    <div className="relative w-full h-full min-h-[600px] flex items-center justify-center bg-[#0a2e1f] rounded-[150px] border-[12px] border-[#3d2b1f] shadow-2xl overflow-hidden">
      {/* Table Inner felt texture (simulated) */}
      <div className="absolute inset-4 border-4 border-[#071f15] rounded-[140px] opacity-30" />
      
      {/* Community Cards */}
      <div className="flex gap-2 z-10 bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/5">
        {gameState.communityCards.map((card, i) => (
          <CardUI key={i} card={card} className="w-16 h-24" />
        ))}
        {Array.from({ length: 5 - gameState.communityCards.length }).map((_, i) => (
          <div key={i} className="w-16 h-24 rounded-md border-2 border-dashed border-white/20 flex items-center justify-center text-white/10 font-bold text-3xl">
            ?
          </div>
        ))}
      </div>

      {/* Pot */}
      <div className="absolute top-[40%] flex flex-col items-center gap-1">
        <div className="bg-yellow-600/20 px-4 py-1 rounded-full border border-yellow-500/30 backdrop-blur-md">
          <span className="text-yellow-400 font-mono font-bold text-xl">POT: ${gameState.pot}</span>
        </div>
        <div className="text-white/40 text-xs uppercase tracking-widest font-bold">
          {gameState.currentPhase === 'showdown' ? (
            <span className="text-green-400">Hand Complete</span>
          ) : (
            `Phase: ${gameState.currentPhase}`
          )}
        </div>
      </div>

      {/* Player Seats */}
      {gameState.players.map((player, index) => (
        <PlayerSeat 
          key={player.id} 
          player={player} 
          isCurrent={index === gameState.currentPlayerIndex}
          position={SEAT_POSITIONS[index]}
          showAllCards={gameState.currentPhase === 'showdown'}
        />
      ))}
    </div>
  );
};

