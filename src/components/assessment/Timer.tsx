'use client';

import { useEffect, useState, useCallback } from 'react';

interface TimerProps {
  /** 제한 시간 (초) */
  duration: number;
  /** 시작 여부 */
  isRunning: boolean;
  /** 시간 종료 시 콜백 */
  onTimeUp?: () => void;
  /** 남은 시간 변경 시 콜백 */
  onTick?: (remainingSeconds: number) => void;
  /** 표시 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 경고 임계값 (초) - 이 시간 이하로 남으면 빨간색으로 변경 */
  warningThreshold?: number;
}

export default function Timer({
  duration,
  isRunning,
  onTimeUp,
  onTick,
  size = 'md',
  warningThreshold = 10,
}: TimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(duration);

  // 타이머 리셋
  useEffect(() => {
    setRemainingSeconds(duration);
  }, [duration]);

  // 타이머 로직
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newValue = prev - 1;

        if (onTick) {
          onTick(newValue);
        }

        if (newValue <= 0) {
          clearInterval(interval);
          if (onTimeUp) {
            onTimeUp();
          }
          return 0;
        }

        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUp, onTick]);

  // 시간 포맷팅 (MM:SS)
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 진행률 계산
  const progress = (remainingSeconds / duration) * 100;
  const isWarning = remainingSeconds <= warningThreshold;

  // 크기별 스타일
  const sizeStyles = {
    sm: {
      container: 'w-24',
      text: 'text-lg',
      bar: 'h-1',
    },
    md: {
      container: 'w-32',
      text: 'text-2xl',
      bar: 'h-1.5',
    },
    lg: {
      container: 'w-40',
      text: 'text-3xl',
      bar: 'h-2',
    },
  };

  const styles = sizeStyles[size];

  return (
    <div className={`${styles.container} flex flex-col items-center`}>
      {/* 디지털 시계 스타일 시간 표시 */}
      <div
        className={`
          ${styles.text}
          font-mono font-bold
          ${isWarning ? 'text-[var(--danger)] animate-pulse' : 'text-[var(--neutral-800)]'}
          transition-colors duration-300
        `}
      >
        {formatTime(remainingSeconds)}
      </div>

      {/* 진행 바 */}
      <div className={`w-full ${styles.bar} bg-[var(--neutral-200)] rounded-full mt-2 overflow-hidden`}>
        <div
          className={`
            h-full rounded-full transition-all duration-1000 ease-linear
            ${isWarning ? 'bg-[var(--danger)]' : 'bg-[var(--primary)]'}
          `}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 라벨 */}
      <p className="text-xs text-[var(--neutral-500)] mt-1">남은 시간</p>
    </div>
  );
}
