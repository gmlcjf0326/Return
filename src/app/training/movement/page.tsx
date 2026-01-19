'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useSessionStore } from '@/store/sessionStore';
import { Button, Card } from '@/components/ui';

// 동적 import로 초기 번들 크기 최적화 (893줄 컴포넌트)
const MovementTraining = dynamic(
  () => import('@/components/training/MovementTraining').then(mod => mod.MovementTraining),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">동작 훈련 모듈 로딩 중...</p>
        </div>
      </div>
    ),
  }
);

export default function MovementTrainingPage() {
  const router = useRouter();
  const { initSession } = useSessionStore();

  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [isTrainingStarted, setIsTrainingStarted] = useState(false);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const handleStartTraining = useCallback((count: number) => {
    setSelectedCount(count);
    setIsTrainingStarted(true);
  }, []);

  const handleExit = useCallback(() => {
    setIsTrainingStarted(false);
    setSelectedCount(null);
  }, []);

  const handleBackToTraining = useCallback(() => {
    router.push('/training');
  }, [router]);

  const handleComplete = useCallback((score: number, count: number) => {
    console.log(`훈련 완료: ${score}점, ${count}개 동작`);
  }, []);

  // 훈련 화면
  if (isTrainingStarted && selectedCount) {
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
                  <h1 className="text-xl font-bold text-slate-800">동작 훈련</h1>
                  <p className="text-sm text-slate-500">{selectedCount}개 동작</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MovementTraining
            exerciseCount={selectedCount}
            onComplete={handleComplete}
          />
        </main>
      </div>
    );
  }

  // 선택 화면
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
                <h1 className="text-xl font-bold text-slate-800">동작 훈련</h1>
                <p className="text-sm text-slate-500">Movement Training</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">🤸</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">훈련 방법</h2>
              <ul className="text-slate-600 space-y-1">
                <li>• 화면에 나오는 동작 안내를 잘 읽어주세요</li>
                <li>• 시작 버튼을 누르면 카메라가 켜집니다</li>
                <li>• 카운트다운 후 안내된 동작을 따라해주세요</li>
                <li>• 동작을 일정 시간 유지하면 점수가 측정됩니다</li>
              </ul>
            </div>
          </div>
        </Card>

        <h3 className="text-lg font-bold text-slate-800 mb-4">훈련량 선택</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { count: 3, name: '가볍게', description: '3개 동작 (약 2분)', color: 'green' },
            { count: 5, name: '보통', description: '5개 동작 (약 3분)', color: 'blue' },
            { count: 10, name: '집중', description: '10개 동작 (약 6분)', color: 'purple' },
          ].map((item) => (
            <Card
              key={item.count}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleStartTraining(item.count)}
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 ${
                  item.color === 'green' ? 'bg-green-100' :
                  item.color === 'blue' ? 'bg-blue-100' :
                  'bg-purple-100'
                }`}>
                  <span className={`text-2xl font-bold ${
                    item.color === 'green' ? 'text-green-600' :
                    item.color === 'blue' ? 'text-blue-600' :
                    'text-purple-600'
                  }`}>
                    {item.count}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 mb-1">{item.name}</h4>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 bg-orange-50 border-orange-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-orange-800 mb-1">동작 훈련 팁</h4>
              <p className="text-sm text-orange-700">
                카메라가 전신이 잘 보이도록 충분한 거리를 유지해주세요.
                동작을 천천히, 정확하게 수행하면 더 좋은 점수를 받을 수 있습니다.
                몸을 움직이기 전에 가벼운 스트레칭을 권장합니다!
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
