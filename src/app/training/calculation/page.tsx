'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CalculationGame } from '@/components/training';
import { CALCULATION_LEVELS } from '@/data/training-data';
import { useSessionStore } from '@/store/sessionStore';
import { Button, Card } from '@/components/ui';

export default function CalculationGamePage() {
  const router = useRouter();
  const { initSession } = useSessionStore();

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const handleStartGame = useCallback((level: number) => {
    setSelectedLevel(level);
    setIsGameStarted(true);
  }, []);

  const handleExit = useCallback(() => {
    setIsGameStarted(false);
    setSelectedLevel(null);
  }, []);

  const handleBackToTraining = useCallback(() => {
    router.push('/training');
  }, [router]);

  // 게임 화면
  if (isGameStarted && selectedLevel) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleExit} className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  나가기
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">계산력 게임</h1>
                  <p className="text-sm text-slate-500">레벨 {selectedLevel}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CalculationGame level={selectedLevel} onExit={handleExit} />
        </main>
      </div>
    );
  }

  // 레벨 선택 화면
  return (
    <div className="min-h-screen bg-slate-50">
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
                <h1 className="text-xl font-bold text-slate-800">계산력 게임</h1>
                <p className="text-sm text-slate-500">Calculation Game</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">게임 방법</h2>
              <ul className="text-slate-600 space-y-1">
                <li>• 화면에 표시되는 계산 문제를 풀어주세요</li>
                <li>• 4개의 선택지 중 정답을 선택하세요</li>
                <li>• 빠르게 답할수록 보너스 점수를 받습니다</li>
                <li>• 제한 시간 내에 모든 문제를 풀어보세요</li>
              </ul>
            </div>
          </div>
        </Card>

        <h3 className="text-lg font-bold text-slate-800 mb-4">레벨 선택</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CALCULATION_LEVELS.map((level, index) => (
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
                    <h4 className="font-bold text-slate-800">레벨 {level.level} ({level.name})</h4>
                    <p className="text-sm text-slate-500">{level.description}</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="text-slate-500">문제 수</p>
                  <p className="font-semibold text-slate-700">{level.problemCount}문제</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="text-slate-500">제한시간</p>
                  <p className="font-semibold text-slate-700">{Math.floor(level.timeLimit / 60)}분 {level.timeLimit % 60}초</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 bg-blue-50 border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">계산력 향상 팁</h4>
              <p className="text-sm text-blue-700">
                암산을 빠르게 하려면 10의 보수를 활용해보세요. 예를 들어 7+8은 7+3+5=15로 계산할 수 있습니다.
                꾸준한 연습이 계산 속도를 높이는 가장 좋은 방법입니다!
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
