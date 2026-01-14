'use client';

import Link from 'next/link';
import { Button, Card, CardHeader, CardContent, StatusBadge } from '@/components/ui';

export default function TrainingPage() {
  return (
    <div className="min-h-full bg-[var(--neutral-50)]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-[var(--primary)] hover:underline text-sm mb-4 inline-block">
            &larr; 홈으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-[var(--neutral-800)]">인지 훈련</h1>
          <p className="text-[var(--neutral-500)] mt-2">Cognitive Training</p>
        </div>

        {/* Coming Soon Card */}
        <Card className="mb-8">
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 bg-[var(--info-light)] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[var(--info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--neutral-800)] mb-4">준비 중입니다</h2>
            <p className="text-[var(--neutral-600)] mb-6 max-w-md mx-auto">
              맞춤형 인지 훈련 프로그램이 곧 제공됩니다.
              기억력, 주의력, 언어력 등을 향상시키는 다양한 게임과 활동을 즐길 수 있습니다.
            </p>
            <StatusBadge status="pending" size="lg">Phase 4 예정</StatusBadge>
          </CardContent>
        </Card>

        {/* Planned Features */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold text-[var(--neutral-800)]">예정된 기능</h3>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--neutral-50)] rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-[var(--neutral-700)]">기억력 게임</span>
                </div>
                <p className="text-sm text-[var(--neutral-500)]">카드 짝맞추기, 이미지 순서 기억</p>
              </div>

              <div className="p-4 bg-[var(--neutral-50)] rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-[var(--neutral-700)]">계산력 퍼즐</span>
                </div>
                <p className="text-sm text-[var(--neutral-500)]">숫자 퍼즐, 사칙연산 게임</p>
              </div>

              <div className="p-4 bg-[var(--neutral-50)] rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-[var(--neutral-700)]">언어력 훈련</span>
                </div>
                <p className="text-sm text-[var(--neutral-500)]">단어 연상, 문장 완성 게임</p>
              </div>

              <div className="p-4 bg-[var(--neutral-50)] rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-[var(--neutral-700)]">반응 속도</span>
                </div>
                <p className="text-sm text-[var(--neutral-500)]">주의력 훈련, 빠른 반응 게임</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action */}
        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="primary" size="lg">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
