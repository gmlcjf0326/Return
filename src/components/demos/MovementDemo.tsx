'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';

interface MovementDemoProps {
  onClose: () => void;
}

const DEMO_MOVEMENTS = [
  {
    id: 1,
    name: '양팔 들기',
    instruction: '양팔을 머리 위로 천천히 들어올려주세요',
    icon: '🙆',
    duration: 5,
  },
  {
    id: 2,
    name: '고개 들기',
    instruction: '고개를 위로 천천히 들어올렸다가 내려주세요',
    icon: '😊',
    duration: 5,
  },
  {
    id: 3,
    name: '고개 돌리기',
    instruction: '고개를 좌우로 천천히 돌려주세요',
    icon: '🙂',
    duration: 5,
  },
];

export default function MovementDemo({ onClose }: MovementDemoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPerforming, setIsPerforming] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPerforming && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsPerforming(false);
            setCompleted([...completed, true]);
            if (currentIndex < DEMO_MOVEMENTS.length - 1) {
              setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
              }, 500);
            } else {
              setTimeout(() => setShowResult(true), 500);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPerforming, countdown, currentIndex, completed]);

  const handleStartMovement = () => {
    setIsPerforming(true);
    setCountdown(DEMO_MOVEMENTS[currentIndex].duration);
  };

  const movement = DEMO_MOVEMENTS[currentIndex];

  if (showResult) {
    return (
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💪</span>
          </div>
          <h3 className="text-2xl font-bold text-[var(--neutral-800)] mb-2">완료!</h3>
          <p className="text-[var(--neutral-600)]">
            {DEMO_MOVEMENTS.length}개 동작을 모두 수행했습니다
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {DEMO_MOVEMENTS.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl bg-[var(--success-light)] flex items-center gap-3"
            >
              <span className="text-2xl">{m.icon}</span>
              <div>
                <p className="font-medium text-[var(--neutral-800)]">{m.name}</p>
                <p className="text-xs text-[var(--neutral-500)]">{m.instruction}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[var(--neutral-100)] rounded-xl p-4 mb-6">
          <p className="text-sm text-[var(--neutral-600)]">
            실제 동작 훈련에서는 카메라를 통해 자세를 분석하고 정확도 피드백을 제공합니다.
          </p>
        </div>

        <Button variant="primary" className="w-full" onClick={onClose}>
          닫기
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 진행률 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-[var(--neutral-500)] mb-2">
          <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs">
            동작 {currentIndex + 1}
          </span>
          <span>{currentIndex + 1}/{DEMO_MOVEMENTS.length}</span>
        </div>
        <div className="h-2 bg-[var(--neutral-200)] rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all"
            style={{ width: `${((currentIndex + 1) / DEMO_MOVEMENTS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 동작 안내 */}
      <div className="mb-8 text-center">
        <div className="bg-orange-50 rounded-2xl p-8 mb-4">
          <span className="text-7xl block mb-4">{movement.icon}</span>
          <h3 className="text-2xl font-bold text-[var(--neutral-800)] mb-2">
            {movement.name}
          </h3>
          <p className="text-[var(--neutral-600)]">
            {movement.instruction}
          </p>
        </div>
      </div>

      {/* 수행 버튼 */}
      <div className="flex flex-col items-center gap-4">
        {isPerforming ? (
          <>
            <div className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-5xl font-bold text-white">{countdown}</span>
            </div>
            <p className="text-lg font-semibold text-orange-500">동작을 수행하세요!</p>
            <div className="flex gap-2">
              {Array.from({ length: movement.duration }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i < movement.duration - countdown ? 'bg-orange-500' : 'bg-orange-200'
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={handleStartMovement}
              className="w-32 h-32 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <p className="text-sm text-[var(--neutral-500)]">버튼을 눌러 동작을 시작하세요</p>
          </>
        )}
      </div>

      <p className="text-xs text-center text-[var(--neutral-400)] mt-6">
        * 체험 모드에서는 카메라 분석이 작동하지 않습니다
      </p>
    </div>
  );
}
