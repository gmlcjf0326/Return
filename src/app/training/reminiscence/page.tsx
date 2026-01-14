'use client';

import Link from 'next/link';
import { Button, Card, CardContent, StatusBadge } from '@/components/ui';

export default function ReminiscencePage() {
  return (
    <div className="min-h-full bg-[var(--neutral-50)]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-[var(--primary)] hover:underline text-sm mb-4 inline-block">
            &larr; 홈으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-[var(--neutral-800)]">회상 대화</h1>
          <p className="text-[var(--neutral-500)] mt-2">Reminiscence Therapy</p>
        </div>

        {/* Coming Soon Card */}
        <Card className="mb-8">
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--neutral-800)] mb-4">준비 중입니다</h2>
            <p className="text-[var(--neutral-600)] mb-6 max-w-md mx-auto">
              AI 기반 회상 대화 기능이 곧 제공됩니다.
              개인 사진을 활용하여 과거의 소중한 기억을 되살리는 대화를 나눌 수 있습니다.
            </p>
            <StatusBadge status="pending" size="lg">Phase 3 예정</StatusBadge>
          </CardContent>
        </Card>

        {/* How it works */}
        <Card>
          <CardContent>
            <h3 className="text-xl font-bold text-[var(--neutral-800)] mb-6">회상 대화란?</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[var(--primary-light)]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[var(--primary)] font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--neutral-700)]">사진 업로드</h4>
                  <p className="text-sm text-[var(--neutral-500)]">가족 사진, 여행 사진 등 추억이 담긴 사진을 업로드합니다.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[var(--primary-light)]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[var(--primary)] font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--neutral-700)]">AI 분석</h4>
                  <p className="text-sm text-[var(--neutral-500)]">AI가 사진을 분석하여 장면, 시대, 분위기 등을 파악합니다.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[var(--primary-light)]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[var(--primary)] font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--neutral-700)]">맞춤 대화</h4>
                  <p className="text-sm text-[var(--neutral-500)]">사진에 기반한 질문으로 자연스러운 회상 대화를 진행합니다.</p>
                </div>
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
