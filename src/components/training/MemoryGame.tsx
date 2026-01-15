'use client';

import { useEffect, useRef, useCallback } from 'react';
import { GameCard } from './GameCard';
import { useTrainingStore, GAME_LEVELS } from '@/store/trainingStore';
import { Button, Card } from '@/components/ui';

interface MemoryGameProps {
  level?: number;
  onComplete?: () => void;
  onExit?: () => void;
}

export function MemoryGame({ level = 1, onComplete, onExit }: MemoryGameProps) {
  const {
    gameState,
    isStarted,
    isCompleted,
    isPaused,
    score,
    mistakes,
    startTraining,
    flipCard,
    checkMatch,
    updateElapsedTime,
    pauseTraining,
    resumeTraining,
    resetTraining,
  } = useTrainingStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);

  // 게임 시작
  useEffect(() => {
    if (!isStarted) {
      startTraining('memory_game', level);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [level, isStarted, startTraining]);

  // 타이머 관리
  useEffect(() => {
    if (isStarted && !isCompleted && !isPaused && gameState?.startTime) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.startTime!) / 1000);
        updateElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStarted, isCompleted, isPaused, gameState?.startTime, updateElapsedTime]);

  // 매칭 확인
  useEffect(() => {
    if (gameState?.flippedCards.length === 2 && !isCheckingRef.current) {
      isCheckingRef.current = true;
      checkMatch().finally(() => {
        isCheckingRef.current = false;
      });
    }
  }, [gameState?.flippedCards.length, checkMatch]);

  // 게임 완료 시 콜백
  useEffect(() => {
    if (isCompleted && onComplete) {
      onComplete();
    }
  }, [isCompleted, onComplete]);

  const handleCardClick = useCallback((cardId: string) => {
    if (!isPaused && !isCompleted && (gameState?.flippedCards?.length ?? 0) < 2) {
      flipCard(cardId);
    }
  }, [isPaused, isCompleted, gameState?.flippedCards?.length, flipCard]);

  const handleRestart = useCallback(() => {
    resetTraining();
    startTraining('memory_game', level);
  }, [resetTraining, startTraining, level]);

  const handleExit = useCallback(() => {
    resetTraining();
    onExit?.();
  }, [resetTraining, onExit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">게임 준비 중...</p>
        </div>
      </div>
    );
  }

  const levelConfig = GAME_LEVELS[level - 1] || GAME_LEVELS[0];
  const timeRemaining = Math.max(0, levelConfig.timeLimit - (gameState.elapsedTime || 0));
  const isTimeUp = timeRemaining <= 0 && !isCompleted;

  return (
    <div className="space-y-6">
      {/* 게임 상태 표시 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-slate-500 mb-1">레벨</p>
          <p className="text-2xl font-bold text-[var(--primary)]">{level}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-slate-500 mb-1">남은 시간</p>
          <p className={`text-2xl font-bold ${timeRemaining <= 30 ? 'text-red-500' : 'text-[var(--neutral-800)]'}`}>
            {formatTime(timeRemaining)}
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-slate-500 mb-1">점수</p>
          <p className="text-2xl font-bold text-[var(--success)]">{score}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-slate-500 mb-1">진행</p>
          <p className="text-2xl font-bold text-[var(--neutral-800)]">
            {gameState.matchedPairs}/{gameState.totalPairs}
          </p>
        </Card>
      </div>

      {/* 진행 바 */}
      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] transition-all duration-300"
          style={{ width: `${(gameState.matchedPairs / gameState.totalPairs) * 100}%` }}
        />
      </div>

      {/* 게임 보드 */}
      <Card className="p-6">
        <div
          className="grid gap-3 justify-center mx-auto"
          style={{
            gridTemplateColumns: `repeat(${levelConfig.gridSize.cols}, minmax(0, 1fr))`,
            maxWidth: `${levelConfig.gridSize.cols * 100}px`,
          }}
        >
          {gameState.cards.map((card) => (
            <GameCard
              key={card.id}
              card={card}
              onClick={handleCardClick}
              disabled={isPaused || isCompleted || isTimeUp || gameState.flippedCards.length >= 2}
              size={levelConfig.gridSize.cols > 4 ? 'sm' : 'md'}
            />
          ))}
        </div>
      </Card>

      {/* 게임 완료 또는 시간 초과 */}
      {(isCompleted || isTimeUp) && (
        <Card className="p-8 text-center bg-gradient-to-br from-slate-50 to-slate-100">
          {isCompleted ? (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">축하합니다! 🎉</h3>
              <p className="text-slate-600 mb-6">모든 카드를 맞추셨습니다!</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">시간 초과!</h3>
              <p className="text-slate-600 mb-6">다시 도전해보세요.</p>
            </>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <p className="text-sm text-slate-500">최종 점수</p>
              <p className="text-xl font-bold text-[var(--primary)]">{score}</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <p className="text-sm text-slate-500">시도 횟수</p>
              <p className="text-xl font-bold text-slate-700">{gameState.moves}회</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <p className="text-sm text-slate-500">실수</p>
              <p className="text-xl font-bold text-red-500">{mistakes}회</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleExit}>
              나가기
            </Button>
            <Button variant="primary" onClick={handleRestart}>
              다시 하기
            </Button>
            {isCompleted && level < GAME_LEVELS.length && (
              <Button
                variant="secondary"
                onClick={() => {
                  resetTraining();
                  startTraining('memory_game', level + 1);
                }}
              >
                다음 레벨
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* 컨트롤 버튼 (게임 중) */}
      {!isCompleted && !isTimeUp && (
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={handleExit}>
            나가기
          </Button>
          {isPaused ? (
            <Button variant="primary" onClick={resumeTraining}>
              계속하기
            </Button>
          ) : (
            <Button variant="secondary" onClick={pauseTraining}>
              일시정지
            </Button>
          )}
          <Button variant="ghost" onClick={handleRestart}>
            처음부터
          </Button>
        </div>
      )}

      {/* 일시정지 오버레이 */}
      {isPaused && !isCompleted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 text-center max-w-sm mx-4">
            <div className="w-16 h-16 bg-[var(--primary-light)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">일시정지</h3>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleExit}>
                나가기
              </Button>
              <Button variant="primary" onClick={resumeTraining}>
                계속하기
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
