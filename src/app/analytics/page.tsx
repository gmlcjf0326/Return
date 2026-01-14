'use client';

import Link from 'next/link';
import { Button, Card, CardContent, StatusBadge, DataPanel } from '@/components/ui';

export default function AnalyticsPage() {
  return (
    <div className="min-h-full bg-[var(--neutral-50)]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-[var(--primary)] hover:underline text-sm mb-4 inline-block">
            &larr; 홈으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-[var(--neutral-800)]">분석 리포트</h1>
          <p className="text-[var(--neutral-500)] mt-2">Analytics Dashboard</p>
        </div>

        {/* Coming Soon Card */}
        <Card className="mb-8">
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--neutral-800)] mb-4">준비 중입니다</h2>
            <p className="text-[var(--neutral-600)] mb-6 max-w-md mx-auto">
              종합 분석 리포트 기능이 곧 제공됩니다.
              시간에 따른 인지 점수 변화, 취약 영역 분석, AI 기반 개선 추천을 확인할 수 있습니다.
            </p>
            <StatusBadge status="pending" size="lg">Phase 5 예정</StatusBadge>
          </CardContent>
        </Card>

        {/* Preview - Placeholder Data */}
        <Card className="mb-8">
          <CardContent>
            <h3 className="text-xl font-bold text-[var(--neutral-800)] mb-6">미리보기 (예시 데이터)</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
              <DataPanel value="--" label="기억력" unit="/100" size="sm" />
              <DataPanel value="--" label="주의력" unit="/100" size="sm" />
              <DataPanel value="--" label="언어력" unit="/100" size="sm" />
              <DataPanel value="--" label="계산력" unit="/100" size="sm" />
              <DataPanel value="--" label="실행기능" unit="/100" size="sm" />
              <DataPanel value="--" label="시공간력" unit="/100" size="sm" />
            </div>
            <p className="text-center text-[var(--neutral-500)] text-sm">
              진단을 완료하면 여기에 점수가 표시됩니다
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardContent>
            <h3 className="text-xl font-bold text-[var(--neutral-800)] mb-6">제공 예정 기능</h3>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-[var(--neutral-50)] rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--neutral-700)]">점수 추이 그래프</h4>
                  <p className="text-sm text-[var(--neutral-500)]">시간에 따른 각 영역별 점수 변화를 시각화합니다.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-[var(--neutral-50)] rounded-xl">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--neutral-700)]">취약 영역 감지</h4>
                  <p className="text-sm text-[var(--neutral-500)]">점수가 낮거나 하락하는 영역을 자동으로 감지합니다.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-[var(--neutral-50)] rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--neutral-700)]">AI 기반 추천</h4>
                  <p className="text-sm text-[var(--neutral-500)]">분석 결과에 기반한 맞춤형 훈련을 추천합니다.</p>
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
