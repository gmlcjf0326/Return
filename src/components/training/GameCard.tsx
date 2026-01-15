'use client';

import { memo } from 'react';
import type { GameCard as GameCardType } from '@/store/trainingStore';

interface GameCardProps {
  card: GameCardType;
  onClick: (cardId: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function GameCardComponent({ card, onClick, disabled = false, size = 'md' }: GameCardProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-20 h-20 text-3xl sm:w-24 sm:h-24 sm:text-4xl',
    lg: 'w-24 h-24 text-4xl sm:w-28 sm:h-28 sm:text-5xl',
  };

  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched) {
      onClick(card.id);
    }
  };

  const isRevealed = card.isFlipped || card.isMatched;

  return (
    <div
      className={`
        relative cursor-pointer perspective-1000
        ${sizeClasses[size]}
        ${disabled || card.isMatched ? 'cursor-default' : 'cursor-pointer'}
      `}
      onClick={handleClick}
    >
      <div
        className={`
          relative w-full h-full transition-transform duration-500 transform-style-3d
          ${isRevealed ? 'rotate-y-180' : ''}
        `}
        style={{
          transformStyle: 'preserve-3d',
          transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* 카드 뒷면 (물음표) */}
        <div
          className={`
            absolute w-full h-full rounded-xl flex items-center justify-center
            bg-gradient-to-br from-[var(--primary)] to-[var(--primary-deep)]
            shadow-lg border-2 border-[var(--primary-light)]
            ${!disabled && !card.isMatched && !card.isFlipped ? 'hover:scale-105 hover:shadow-xl' : ''}
            transition-all duration-200
          `}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-white text-opacity-80">?</span>
        </div>

        {/* 카드 앞면 (이모지) */}
        <div
          className={`
            absolute w-full h-full rounded-xl flex items-center justify-center
            bg-white shadow-lg border-2
            ${card.isMatched
              ? 'border-green-400 bg-green-50'
              : 'border-[var(--neutral-200)]'}
            transition-all duration-200
          `}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className={card.isMatched ? 'animate-bounce' : ''}>
            {card.emoji}
          </span>
        </div>
      </div>

      {/* 매칭 완료 효과 */}
      {card.isMatched && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-green-400 opacity-20 rounded-xl animate-pulse" />
        </div>
      )}
    </div>
  );
}

export const GameCard = memo(GameCardComponent);
