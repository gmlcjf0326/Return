'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MemoryGame } from '@/components/training';
import { useTrainingStore, GAME_LEVELS } from '@/store/trainingStore';
import { useSessionStore } from '@/store/sessionStore';
import { Button, Card } from '@/components/ui';

function MemoryGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLevel = parseInt(searchParams.get('level') || '1');

  const { session, initSession } = useSessionStore();
  const { resetTraining } = useTrainingStore();

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);

  // 세션 초기화
  useEffect(() => {
    initSession();
  }, [initSession]);

  // URL에서 레벨 파라미터가 있으면 바로 시작
  useEffect(() => {
    if (initialLevel && initialLevel >= 1 && initialLevel <= GAME_LEVELS.length) {
      setSelectedLevel(initialLevel);
    }
  }, [initialLevel]);

  const handleStartGame = useCallback((level: number) => {
    resetTraining();
    setSelectedLevel(level);
    setIsGameStarted(true);
  }, [resetTraining]);

  const handleGameComplete = useCallback(() => {
    // 게임 완료 시 결과는 MemoryGame 컴포넌트에서 표시됨
  }, []);

  const handleExit = useCallback(() => {
    resetTraining();
    setIsGameStarted(false);
    setSelectedLevel(null);
  }, [resetTraining]);

  const handleBackToTraining = useCallback(() => {
    resetTraining();
    router.push('/training');
  }, [resetTraining, router]);

  // 게임 화면
  if (isGameStarted && selectedLevel) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* 헤더 */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExit}
                  className="flex items-center gap-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  나가기
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">기억력 게임</h1>
                  <p className="text-sm text-slate-500">레벨 {selectedLevel}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 게임 영역 */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MemoryGame
            level={selectedLevel}
            onComplete={handleGameComplete}
            onExit={handleExit}
          />
        </main>
      </div>
    );
  }

  // 레벨 선택 화면
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToTraining}
                className="w-9 h-9 rounded-lg bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] flex items-center justify-center transition-colors"
                aria-label="뒤로 가기"
              >
                <svg className="w-5 h-5 text-[var(--neutral-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">기억력 게임</h1>
                <p className="text-sm text-slate-500">Memory Card Game</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 게임 설명 */}
        <Card className="mb-8 p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">게임 방법</h2>
              <ul className="text-slate-600 space-y-1">
                <li>• 카드를 클릭하면 뒤집어집니다</li>
                <li>• 같은 그림의 카드 2장을 찾아 짝을 맞추세요</li>
                <li>• 모든 카드의 짝을 맞추면 성공!</li>
                <li>• 제한 시간 내에 완료해야 합니다</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 레벨 선택 */}
        <h3 className="text-lg font-bold text-slate-800 mb-4">레벨 선택</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GAME_LEVELS.map((level, index) => (
            <Card
              key={level.level}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleStartGame(level.level)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    index === 0 ? 'bg-green-100 text-green-600' :
                    index === 1 ? 'bg-blue-100 text-blue-600' :
                    index === 2 ? 'bg-purple-100 text-purple-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <span className="text-xl font-bold">{level.level}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">
                      레벨 {level.level}
                      {index === 0 && ' (쉬움)'}
                      {index === 1 && ' (보통)'}
                      {index === 2 && ' (어려움)'}
                      {index === 3 && ' (전문가)'}
                    </h4>
                    <p className="text-sm text-slate-500">
                      {level.gridSize.rows}x{level.gridSize.cols} 그리드
                    </p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="text-slate-500">카드 수</p>
                  <p className="font-semibold text-slate-700">{level.pairsCount * 2}장</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="text-slate-500">짝 수</p>
                  <p className="font-semibold text-slate-700">{level.pairsCount}쌍</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="text-slate-500">제한시간</p>
                  <p className="font-semibold text-slate-700">{Math.floor(level.timeLimit / 60)}분</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 팁 */}
        <Card className="mt-8 p-6 bg-blue-50 border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">기억력 향상 팁</h4>
              <p className="text-sm text-blue-700">
                카드의 위치를 기억할 때 비슷한 색깔이나 카테고리로 그룹을 지어 기억하면 더 쉽게 찾을 수 있어요.
                처음에는 쉬운 레벨부터 시작해서 점차 어려운 레벨에 도전해보세요!
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">로딩 중...</p>
      </div>
    </div>
  );
}

export default function MemoryGamePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MemoryGameContent />
    </Suspense>
  );
}
