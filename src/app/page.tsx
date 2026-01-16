'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/sessionStore';
import { Button, Card, CardHeader, CardContent, DataPanel, StatusBadge } from '@/components/ui';
import { DemoModal, DemoPlayer, CardPlayButton, type DemoType, type AutoplayDemoType } from '@/components/demos';

export default function Home() {
  const router = useRouter();
  const { session, isInitialized, initSession } = useSessionStore();
  const [activeDemo, setActiveDemo] = useState<DemoType | null>(null);
  const [autoplayDemo, setAutoplayDemo] = useState<AutoplayDemoType | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      initSession();
    }
  }, [isInitialized, initSession]);

  return (
    <div className="min-h-full bg-[var(--neutral-50)]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-[var(--primary-deep)] to-[var(--primary)] rounded-2xl p-8 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {session?.nickname ? `${session.nickname}님, 환영합니다` : '환영합니다'}
            </h2>
            <p className="text-blue-100 text-lg">
              AI 기반 인지 평가와 맞춤형 회상치료로 뇌 건강을 관리하세요
            </p>
            {session && (
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>세션 ID: {session.id.slice(0, 8)}...</span>
              </div>
            )}
          </div>
        </section>

        {/* Main Actions */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-[var(--neutral-800)] mb-4">주요 기능</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cognitive Assessment Card */}
            <Card className="hover:shadow-lg transition-shadow relative">
              <CardPlayButton onClick={() => setAutoplayDemo('assessment')} variant="primary" />
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[var(--primary-light)]/20 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[var(--neutral-800)]">인지 진단</h4>
                    <p className="text-[var(--neutral-500)]">Cognitive Assessment</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--neutral-600)] mb-6">
                  기억력, 주의력, 언어력 등 6개 영역의 인지 기능을 종합적으로 평가합니다.
                  AI가 음성, 표정, 반응 속도를 분석하여 정밀한 진단 결과를 제공합니다.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <StatusBadge status="info" size="sm">기억력</StatusBadge>
                  <StatusBadge status="info" size="sm">주의력</StatusBadge>
                  <StatusBadge status="info" size="sm">언어력</StatusBadge>
                  <StatusBadge status="info" size="sm">계산력</StatusBadge>
                  <StatusBadge status="info" size="sm">실행기능</StatusBadge>
                  <StatusBadge status="info" size="sm">시공간력</StatusBadge>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    onClick={() => router.push('/assessment')}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    진단 시작하기
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setActiveDemo('assessment')}
                  >
                    체험하기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Training Card */}
            <Card className="hover:shadow-lg transition-shadow relative">
              <CardPlayButton onClick={() => setAutoplayDemo('training')} variant="emerald" />
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[var(--info-light)] rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-[var(--info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[var(--neutral-800)]">훈련 시작</h4>
                    <p className="text-[var(--neutral-500)]">Cognitive Training</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--neutral-600)] mb-6">
                  맞춤형 인지 훈련 게임과 회상치료 프로그램으로 뇌 기능을 향상시킵니다.
                  개인 사진을 활용한 회상 대화로 기억력을 자극합니다.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <StatusBadge status="normal" size="sm">기억력 게임</StatusBadge>
                  <StatusBadge status="normal" size="sm">계산력 퍼즐</StatusBadge>
                  <StatusBadge status="normal" size="sm">회상 대화</StatusBadge>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                    onClick={() => router.push('/training')}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    훈련 시작하기
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setActiveDemo('memory')}
                  >
                    체험하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Demo Section */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-[var(--neutral-800)] mb-4">훈련 체험해보기</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveDemo('memory')}
              className="p-4 bg-white rounded-xl border border-[var(--neutral-200)] hover:shadow-md transition-all text-center group"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🎴</span>
              </div>
              <h5 className="font-semibold text-[var(--neutral-700)]">기억력 게임</h5>
              <p className="text-xs text-[var(--neutral-500)] mt-1">카드 매칭</p>
            </button>

            <button
              onClick={() => setActiveDemo('calculation')}
              className="p-4 bg-white rounded-xl border border-[var(--neutral-200)] hover:shadow-md transition-all text-center group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🔢</span>
              </div>
              <h5 className="font-semibold text-[var(--neutral-700)]">계산력 게임</h5>
              <p className="text-xs text-[var(--neutral-500)] mt-1">수학 문제</p>
            </button>

            <button
              onClick={() => setActiveDemo('language')}
              className="p-4 bg-white rounded-xl border border-[var(--neutral-200)] hover:shadow-md transition-all text-center group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📖</span>
              </div>
              <h5 className="font-semibold text-[var(--neutral-700)]">언어력 게임</h5>
              <p className="text-xs text-[var(--neutral-500)] mt-1">단어 퍼즐</p>
            </button>

            <button
              onClick={() => setActiveDemo('reminiscence')}
              className="p-4 bg-white rounded-xl border border-[var(--neutral-200)] hover:shadow-md transition-all text-center group"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <span className="text-2xl">💬</span>
              </div>
              <h5 className="font-semibold text-[var(--neutral-700)]">회상 대화</h5>
              <p className="text-xs text-[var(--neutral-500)] mt-1">추억 이야기</p>
            </button>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-[var(--neutral-800)] mb-4">바로가기</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/photos">
              <Card className="hover:shadow-md transition-shadow cursor-pointer text-center py-6">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h5 className="font-semibold text-[var(--neutral-700)]">사진 관리</h5>
                <p className="text-sm text-[var(--neutral-500)]">Photos</p>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="hover:shadow-md transition-shadow cursor-pointer text-center py-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h5 className="font-semibold text-[var(--neutral-700)]">분석 리포트</h5>
                <p className="text-sm text-[var(--neutral-500)]">Analytics</p>
              </Card>
            </Link>

            <Link href="/assessment/history">
              <Card className="hover:shadow-md transition-shadow cursor-pointer text-center py-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h5 className="font-semibold text-[var(--neutral-700)]">진단 이력</h5>
                <p className="text-sm text-[var(--neutral-500)]">History</p>
              </Card>
            </Link>

            <Link href="/training/reminiscence">
              <Card className="hover:shadow-md transition-shadow cursor-pointer text-center py-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h5 className="font-semibold text-[var(--neutral-700)]">회상 대화</h5>
                <p className="text-sm text-[var(--neutral-500)]">Reminiscence</p>
              </Card>
            </Link>
          </div>
        </section>

        {/* Recent Results (Placeholder) */}
        <section className="mb-8">
          <h3 className="text-xl font-bold text-[var(--neutral-800)] mb-4">최근 인지 상태</h3>
          <Card>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <DataPanel value="--" label="기억력" unit="/100" size="sm" />
                <DataPanel value="--" label="주의력" unit="/100" size="sm" />
                <DataPanel value="--" label="언어력" unit="/100" size="sm" />
                <DataPanel value="--" label="계산력" unit="/100" size="sm" />
                <DataPanel value="--" label="실행기능" unit="/100" size="sm" />
                <DataPanel value="--" label="시공간력" unit="/100" size="sm" />
              </div>
              <div className="mt-6 text-center">
                <p className="text-[var(--neutral-500)] mb-4">
                  아직 진단 기록이 없습니다. 첫 번째 인지 진단을 시작해보세요.
                </p>
                <Button variant="outline" onClick={() => router.push('/assessment')}>
                  첫 진단 시작하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Info Section */}
        <section>
          <Card className="bg-[var(--neutral-100)] border-none">
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[var(--neutral-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-semibold text-[var(--neutral-700)] mb-1">안내 사항</h5>
                  <p className="text-sm text-[var(--neutral-500)]">
                    본 플랫폼은 인지 기능 훈련 및 모니터링을 위한 보조 도구입니다.
                    정확한 진단을 위해서는 전문 의료기관 상담을 권장합니다.
                    개인정보는 기기에만 저장되며 외부로 전송되지 않습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Demo Modal */}
      {activeDemo && (
        <DemoModal type={activeDemo} onClose={() => setActiveDemo(null)} />
      )}

      {/* Autoplay Demo Player */}
      {autoplayDemo && (
        <DemoPlayer type={autoplayDemo} onClose={() => setAutoplayDemo(null)} />
      )}
    </div>
  );
}
