'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LanguageGame } from '@/components/training';
import { LANGUAGE_LEVELS } from '@/data/training-data';
import { useSessionStore } from '@/store/sessionStore';
import { Button, Card } from '@/components/ui';

export default function LanguageGamePage() {
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
                  <h1 className="text-xl font-bold text-slate-800">언어력 게임</h1>
                  <p className="text-sm text-slate-500">레벨 {selectedLevel}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LanguageGame level={selectedLevel} onExit={handleExit} />
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
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBackToTraining} className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                뒤로
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">언어력 게임</h1>
                <p className="text-sm text-slate-500">Language Game</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">게임 방법</h2>
              <ul className="text-slate-600 space-y-1">
                <li>• 단어 연상, 속담 완성, 반의어/유의어 문제가 출제됩니다</li>
                <li>• 4개의 선택지 중 정답을 선택하세요</li>
                <li>• 힌트를 사용하면 점수가 감점됩니다</li>
                <li>• 빠르게 답할수록 보너스 점수를 받습니다</li>
              </ul>
            </div>
          </div>
        </Card>

        <h3 className="text-lg font-bold text-slate-800 mb-4">레벨 선택</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LANGUAGE_LEVELS.map((level, index) => (
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
                  <p className="font-semibold text-slate-700">{Math.floor(level.timeLimit / 60)}분</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 bg-green-50 border-green-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-green-800 mb-1">언어력 향상 팁</h4>
              <p className="text-sm text-green-700">
                단어를 떠올릴 때 관련된 이미지를 상상해보세요. 속담은 상황을 연상하면 더 쉽게 기억할 수 있습니다.
                매일 조금씩 연습하면 어휘력이 크게 향상됩니다!
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
