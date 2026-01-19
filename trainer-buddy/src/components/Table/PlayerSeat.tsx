import React from 'react';
import { Player } from '../../types/poker';
import { CardUI } from './CardUI';
import { User, Bot } from 'lucide-react';

interface PlayerSeatProps {
  player: Player;
  isCurrent: boolean;
  position: { top: string; left: string };
  showAllCards?: boolean;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({ player, isCurrent, position, showAllCards }) => {
  return (
    <div 
      className={`absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2`}
      style={{ top: position.top, left: position.left }}
    >
      {/* Cards */}
      <div className="flex gap-1 mb-1">
        {!player.isFolded && player.cards.map((card, i) => (
          <CardUI 
            key={i} 
            card={card} 
            faceDown={!showAllCards && player.personality !== 'user'} 
            className={player.isFolded ? 'opacity-50 grayscale' : ''}
          />
        ))}
      </div>

      {/* Info Bubble */}
      <div className={`
        relative flex flex-col items-center p-3 rounded-xl min-w-[120px]
        ${isCurrent ? 'bg-yellow-500 ring-4 ring-yellow-200 shadow-lg scale-110' : 'bg-gray-800'}
        ${player.isFolded ? 'opacity-40 grayscale' : 'opacity-100'}
        transition-all duration-300
      `}>
        <div className="flex items-center gap-2 mb-1">
          {player.personality === 'user' ? <User size={16} className="text-blue-400" /> : <Bot size={16} className="text-gray-400" />}
          <span className="text-white font-bold text-sm truncate max-w-[80px]">{player.name}</span>
        </div>
        
        <div className="text-green-400 font-mono text-xs font-bold">
          ${player.chips}
        </div>

        {player.isDealer && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center text-[10px] font-black text-gray-800 shadow-sm">
            D
          </div>
        )}

        {player.currentBet > 0 && (
          <div className="absolute -bottom-8 bg-black/60 px-2 py-0.5 rounded-full text-yellow-400 text-xs font-bold border border-yellow-500/30">
            ${player.currentBet}
          </div>
        )}
      </div>
    </div>
  );
};

