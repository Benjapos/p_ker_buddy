import React, { useState } from 'react';
import { usePokerStore } from '../../store/gameStore';

export const ActionPanel: React.FC = () => {
  const { gameState, performAction } = usePokerStore();
  const [raiseAmount, setRaiseAmount] = useState(0);

  if (!gameState) return null;

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isUserTurn = currentPlayer.id === 'user';
  const currentMaxBet = Math.max(...gameState.players.map(p => p.currentBet));
  const callAmount = currentMaxBet - currentPlayer.currentBet;
  const canCheck = callAmount === 0;

  if (gameState.currentPhase === 'showdown') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="text-xl font-black text-green-400 animate-bounce">HAND COMPLETE</div>
        <button 
          onClick={() => usePokerStore.getState().startNewHand()}
          className="px-12 py-4 bg-green-600 hover:bg-green-500 border-2 border-green-400/50 rounded-2xl font-black text-white transition-all hover:scale-105 shadow-[0_0_30px_rgba(34,197,94,0.4)]"
        >
          START NEXT HAND
        </button>
      </div>
    );
  }

  if (!isUserTurn) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-400 italic">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-bounce" />
        </div>
        <span className="mt-2 font-bold uppercase tracking-widest text-[10px]">Waiting for {currentPlayer.name}...</span>
      </div>
    );
  }

  const handleRaise = () => {
    const totalAmount = currentMaxBet + Math.max(gameState.minRaise, raiseAmount);
    performAction('user', 'raise', totalAmount);
  };

  return (
    <div className="flex items-center justify-center gap-4 w-full h-full px-8">
      <button 
        onClick={() => performAction('user', 'fold')}
        className="px-8 py-4 bg-red-900/50 hover:bg-red-800 border-2 border-red-700/50 rounded-xl font-black text-red-200 transition-all hover:scale-105"
      >
        FOLD
      </button>

      {canCheck ? (
        <button 
          onClick={() => performAction('user', 'check')}
          className="px-8 py-4 bg-blue-900/50 hover:bg-blue-800 border-2 border-blue-700/50 rounded-xl font-black text-blue-200 transition-all hover:scale-105"
        >
          CHECK
        </button>
      ) : (
        <button 
          onClick={() => performAction('user', 'call')}
          className="px-8 py-4 bg-blue-900/50 hover:bg-blue-800 border-2 border-blue-700/50 rounded-xl font-black text-blue-200 transition-all hover:scale-105 flex flex-col items-center"
        >
          <span>CALL</span>
          <span className="text-[10px] opacity-70">${callAmount}</span>
        </button>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <input 
            type="range" 
            min={gameState.minRaise} 
            max={currentPlayer.chips} 
            step={10}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
            className="w-48 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <span className="text-green-400 font-mono font-bold">${currentMaxBet + Math.max(gameState.minRaise, raiseAmount)}</span>
        </div>
        <button 
          onClick={handleRaise}
          className="px-8 py-4 bg-green-600 hover:bg-green-500 border-2 border-green-400/50 rounded-xl font-black text-white transition-all hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
        >
          {canCheck ? 'BET' : 'RAISE'}
        </button>
      </div>
    </div>
  );
};

