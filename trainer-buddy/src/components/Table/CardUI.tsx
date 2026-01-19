import React from 'react';
import { Card as ICard } from '../../types/poker';

interface CardUIProps {
  card?: ICard;
  faceDown?: boolean;
  className?: string;
}

export const CardUI: React.FC<CardUIProps> = ({ card, faceDown, className = '' }) => {
  if (faceDown || !card) {
    return (
      <div className={`w-12 h-16 bg-blue-800 rounded-md border-2 border-white flex items-center justify-center ${className}`}>
        <div className="w-8 h-12 border border-blue-600 rounded-sm opacity-50" />
      </div>
    );
  }

  const suitSymbols: Record<string, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  };

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  return (
    <div className={`w-12 h-16 bg-white rounded-md border-2 border-gray-300 flex flex-col items-center justify-between p-1 shadow-md ${className}`}>
      <div className={`text-sm font-bold self-start leading-none ${isRed ? 'text-red-600' : 'text-black'}`}>
        {card.rank}
      </div>
      <div className={`text-xl ${isRed ? 'text-red-600' : 'text-black'}`}>
        {suitSymbols[card.suit]}
      </div>
      <div className={`text-sm font-bold self-end leading-none rotate-180 ${isRed ? 'text-red-600' : 'text-black'}`}>
        {card.rank}
      </div>
    </div>
  );
};

