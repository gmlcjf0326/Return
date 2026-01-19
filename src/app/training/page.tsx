'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/sessionStore';
import { useTrainingStore } from '@/store/trainingStore';
import { Button, Card, CardHeader, CardContent, StatusBadge } from '@/components/ui';
import { DemoModal, type DemoType } from '@/components/demos';

export default function TrainingPage() {
  const router = useRouter();
  const { session, initSession } = useSessionStore();
  const { recentSessions } = useTrainingStore();
  const [activeDemo, setActiveDemo] = useState<DemoType | null>(null);
  const preloadStartedRef = useRef(false);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // 동작 훈련 프리로드 (hover 시 TensorFlow 미리 로드)
  const preloadMovementTraining = useCallback(async () => {
    if (preloadStartedRef.current) return;
    preloadStartedRef.current = true;

    try {
      // TensorFlow 백그라운드 로드
      const { initTensorFlow } = await import('@/lib/ai/tensorflow');
      await initTensorFlow();
      console.log('[Preload] TensorFlow loaded in background');
    } catch (error) {
      console.warn('[Preload] Failed to preload TensorFlow:', error);
    }
  }, []);

  // 순서: 음성 훈련, 동작 훈련, 회상 대화, 언어력 게임, 기억력 게임, 계산력 게임
  const trainingModules = [
    {
      id: 'voice',
      title: '음성 훈련',
      subtitle: 'Voice Training',
      description: '문장 읽기, 단어 따라하기 등으로 발화 능력을 향상시킵니다.',
      icon: (
        <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      bgColor: 'bg-pink-100',
      href: '/training/voice',
      status: 'available',
      tags: ['음성', '발화'],
      demoType: 'voice' as DemoType,
    },
    {
      id: 'movement',
      title: '동작 훈련',
      subtitle: 'Movement Training',
      description: '간단한 동작을 따라하며 신체 협응력과 자세 인식을 훈련합니다.',
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-orange-100',
      href: '/training/movement',
      status: 'available',
      tags: ['동작', '신체'],
      demoType: 'movement' as DemoType,
      onHover: preloadMovementTraining, // AI 모델 미리 로드
    },
    {
      id: 'reminiscence',
      title: '회상 대화',
      subtitle: 'Reminiscence Therapy',
      description: '개인 사진을 보며 AI와 추억을 나누는 회상치료 프로그램입니다.',
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      bgColor: 'bg-amber-100',
      href: '/training/reminiscence',
      status: 'available',
      tags: ['회상', '정서'],
      demoType: 'reminiscence' as DemoType,
    },
    {
      id: 'language',
      title: '언어력 게임',
      subtitle: 'Language Game',
      description: '단어 연상, 속담 완성, 반의어/유의어 문제로 언어 능력을 훈련합니다.',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      bgColor: 'bg-green-100',
      href: '/training/language',
      status: 'available',
      tags: ['언어력', '어휘력'],
      demoType: 'language' as DemoType,
    },
    {
      id: 'memory-game',
      title: '기억력 게임',
      subtitle: 'Memory Card Game',
      description: '카드 짝맞추기 게임으로 기억력을 훈련합니다. 같은 그림의 카드를 찾아 짝을 맞추세요.',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      bgColor: 'bg-purple-100',
      href: '/training/memory-game',
      status: 'available',
      tags: ['기억력', '집중력'],
      demoType: 'memory' as DemoType,
    },
    {
      id: 'calculation',
      title: '계산력 게임',
      subtitle: 'Calculation Game',
      description: '덧셈, 뺄셈, 곱셈, 나눗셈 문제를 풀며 계산 능력을 향상시킵니다.',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      bgColor: 'bg-blue-100',
      href: '/training/calculation',
      status: 'available',
      tags: ['계산력', '논리력'],
      demoType: 'calculation' as DemoType,
    },
  ];

  const getTrainingTypeName = (type: string) => {
    const names: Record<string, string> = {
      memory_game: '기억력 게임',
      calculation_game: '계산력 게임',
      language_game: '언어력 게임',
      attention_game: '주의력 게임',
      reminiscence: '회상 대화',
      voice: '음성 훈련',
      movement: '동작 훈련',
    };
    return names[type] || type;
  };

  return (
    <div className="min-h-full bg-[var(--neutral-50)]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/" className="text-[var(--primary)] hover:underline text-sm mb-4 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            홈으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-[var(--neutral-800)]">인지 훈련</h1>
          <p className="text-[var(--neutral-500)] mt-2">Cognitive Training - 다양한 게임으로 인지 능력을 향상시켜보세요</p>
        </div>

        {/* 훈련 모듈 그리드 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {trainingModules.map((module) => (
            <div
              key={module.id}
              onMouseEnter={module.onHover}
            >
            <Card
              className="hover:shadow-lg transition-all group"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 ${module.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {module.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-[var(--neutral-800)]">{module.title}</h3>
                        <p className="text-sm text-[var(--neutral-500)]">{module.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-[var(--neutral-600)] text-sm mb-3">{module.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {module.tags.map((tag) => (
                        <StatusBadge key={tag} status="info" size="sm">{tag}</StatusBadge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="md"
                        className="flex-1"
                        onClick={() => router.push(module.href)}
                      >
                        시작하기
                      </Button>
                      {module.demoType && (
                        <Button
                          variant="outline"
                          size="md"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDemo(module.demoType);
                          }}
                        >
                          체험하기
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          ))}
        </div>

        {/* 최근 훈련 기록 */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-xl font-bold text-[var(--neutral-800)]">최근 훈련 기록</h3>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.slice(0, 5).map((session, index) => (
                  <div
                    key={session.id || index}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--primary-light)]/20 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🎮</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">{getTrainingTypeName(session.type)}</p>
                        <p className="text-sm text-slate-500">
                          레벨 {session.level} • {new Date(session.completedAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--primary)]">{session.score}점</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-medium">아직 훈련 기록이 없습니다</p>
                <p className="text-sm mt-1">위의 게임을 선택하여 훈련을 시작해보세요!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 훈련 팁 */}
        <Card className="bg-gradient-to-r from-[var(--primary-deep)] to-[var(--primary)] text-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2">효과적인 인지 훈련을 위한 팁</h4>
                <ul className="text-blue-100 space-y-1 text-sm">
                  <li>• 매일 10-15분씩 꾸준히 훈련하는 것이 효과적입니다</li>
                  <li>• 다양한 종류의 게임을 번갈아 하면 더욱 좋습니다</li>
                  <li>• 처음에는 쉬운 레벨부터 시작하여 점차 난이도를 높여보세요</li>
                  <li>• 회상 대화는 가족 사진과 함께 하면 더욱 효과적입니다</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Modal */}
      {activeDemo && (
        <DemoModal type={activeDemo} onClose={() => setActiveDemo(null)} />
      )}
    </div>
  );
}
