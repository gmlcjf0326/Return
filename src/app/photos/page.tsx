'use client';

import Link from 'next/link';
import { Button, Card, CardContent, StatusBadge } from '@/components/ui';

export default function PhotosPage() {
  return (
    <div className="min-h-full bg-[var(--neutral-50)]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-[var(--primary)] hover:underline text-sm mb-4 inline-block">
            &larr; 홈으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-[var(--neutral-800)]">사진 관리</h1>
          <p className="text-[var(--neutral-500)] mt-2">Photo Management</p>
        </div>

        {/* Coming Soon Card */}
        <Card className="mb-8">
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--neutral-800)] mb-4">준비 중입니다</h2>
            <p className="text-[var(--neutral-600)] mb-6 max-w-md mx-auto">
              사진 업로드 및 AI 자동 태깅 기능이 곧 제공됩니다.
              추억이 담긴 사진을 업로드하면 AI가 자동으로 분석하여 태그를 생성합니다.
            </p>
            <StatusBadge status="pending" size="lg">Phase 3 예정</StatusBadge>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardContent>
            <h3 className="text-xl font-bold text-[var(--neutral-800)] mb-6">제공 예정 기능</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--neutral-50)] rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <span className="font-semibold text-[var(--neutral-700)]">사진 업로드</span>
                </div>
                <p className="text-sm text-[var(--neutral-500)]">드래그 앤 드롭으로 쉽게 업로드</p>
              </div>

              <div className="p-4 bg-[var(--neutral-50)] rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-[var(--neutral-700)]">AI 자동 태깅</span>
                </div>
                <p className="text-sm text-[var(--neutral-500)]">GPT Vision으로 장면, 시대, 분위기 분석</p>
              </div>

              <div className="p-4 bg-[var(--neutral-50)] rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-[var(--neutral-700)]">태그 편집</span>
                </div>
                <p className="text-sm text-[var(--neutral-500)]">자동 태그 수정 및 직접 태그 추가</p>
              </div>

              <div className="p-4 bg-[var(--neutral-50)] rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="font-semibold text-[var(--neutral-700)]">앨범 관리</span>
                </div>
                <p className="text-sm text-[var(--neutral-500)]">시대별, 주제별 앨범 자동 정리</p>
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
