import React from 'react';
import { NumberItem } from '../types';

interface NumberCardProps {
  item: NumberItem;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const NumberCard: React.FC<NumberCardProps> = ({ item, isSelected, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group flex items-center justify-center w-full aspect-[4/5] md:aspect-square
        rounded-2xl text-4xl md:text-6xl font-bold tracking-tighter transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}
        ${isSelected 
          ? 'bg-game-accent text-game-dark shadow-xl shadow-game-accent/30 scale-105 z-10 ring-4 ring-game-accent/50' 
          : 'bg-game-card text-slate-200 shadow-lg border-b-4 border-slate-900 hover:bg-slate-700'
        }
      `}
    >
      <span className="drop-shadow-md">
        {parseFloat(item.value.toFixed(2))}
      </span>
      
      {/* Decorative corner accents */}
      <div className={`absolute top-3 left-3 w-2 h-2 rounded-full ${isSelected ? 'bg-game-dark/30' : 'bg-slate-600'}`} />
      <div className={`absolute bottom-3 right-3 w-2 h-2 rounded-full ${isSelected ? 'bg-game-dark/30' : 'bg-slate-600'}`} />
    </button>
  );
};
