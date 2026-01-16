'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';

interface Card {
  id: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const DEMO_CARDS = [
  { emoji: '🍎', value: 'apple' },
  { emoji: '🍌', value: 'banana' },
  { emoji: '🍇', value: 'grape' },
];

interface MemoryGameDemoProps {
  onClose: () => void;
}

export default function MemoryGameDemo({ onClose }: MemoryGameDemoProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // 게임 초기화
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newCards: Card[] = [];
    DEMO_CARDS.forEach((item, index) => {
      newCards.push({
        id: `${index}-a`,
        emoji: item.emoji,
        isFlipped: false,
        isMatched: false,
      });
      newCards.push({
        id: `${index}-b`,
        emoji: item.emoji,
        isFlipped: false,
        isMatched: false,
      });
    });

    // 셔플
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }

    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setIsCompleted(false);
  };

  const handleCardClick = async (cardId: string) => {
    if (isChecking || flippedCards.length >= 2) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map((c) =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves(moves + 1);

      const [firstId, secondId] = newFlipped;
      const firstCard = newCards.find((c) => c.id === firstId);
      const secondCard = newCards.find((c) => c.id === secondId);

      await new Promise((resolve) => setTimeout(resolve, 600));

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // 매칭 성공
        const matchedCards = newCards.map((c) =>
          c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
        );
        setCards(matchedCards);
        const newMatchedPairs = matchedPairs + 1;
        setMatchedPairs(newMatchedPairs);

        if (newMatchedPairs === DEMO_CARDS.length) {
          setIsCompleted(true);
        }
      } else {
        // 매칭 실패 - 다시 뒤집기
        const resetCards = newCards.map((c) =>
          c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
        );
        setCards(resetCards);
      }

      setFlippedCards([]);
      setIsChecking(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[var(--success-light)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <h3 className="text-2xl font-bold text-[var(--neutral-800)] mb-2">축하합니다!</h3>
          <p className="text-[var(--neutral-600)]">
            {moves}번 만에 모든 카드를 맞추셨습니다!
          </p>
        </div>

        <div className="bg-[var(--neutral-100)] rounded-xl p-4 mb-6">
          <p className="text-sm text-[var(--neutral-600)]">
            실제 기억력 훈련에서는 더 많은 카드와 다양한 난이도로 기억력을 향상시킬 수 있습니다.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={initializeGame}>
            다시 하기
          </Button>
          <Button variant="primary" className="flex-1" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 상태 표시 */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-[var(--neutral-500)]">
          매칭: {matchedPairs}/{DEMO_CARDS.length}
        </div>
        <div className="text-sm text-[var(--neutral-500)]">
          시도: {moves}회
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isFlipped || card.isMatched || isChecking}
            className={`aspect-square rounded-xl text-4xl transition-all transform ${
              card.isFlipped || card.isMatched
                ? 'bg-white border-2 border-[var(--primary)]'
                : 'bg-[var(--primary)] hover:scale-105'
            } ${card.isMatched ? 'opacity-50' : ''}`}
          >
            {card.isFlipped || card.isMatched ? card.emoji : '?'}
          </button>
        ))}
      </div>

      <p className="text-sm text-center text-[var(--neutral-500)]">
        같은 그림 카드를 찾아 짝을 맞춰보세요!
      </p>
    </div>
  );
}
