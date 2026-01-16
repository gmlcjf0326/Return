'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--neutral-200)] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* 로고 - 클릭 시 홈으로 이동 */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-deep)] rounded-xl flex items-center justify-center overflow-hidden">
            {/* 32x32 픽셀아트 스타일 뇌 아이콘 */}
            <svg width="24" height="24" viewBox="0 0 16 16" className="text-white">
              {/* 픽셀아트 뇌 형태 - 도트로 구성 */}
              <rect x="5" y="2" width="2" height="2" fill="currentColor"/>
              <rect x="7" y="2" width="2" height="2" fill="currentColor"/>
              <rect x="9" y="2" width="2" height="2" fill="currentColor"/>
              <rect x="3" y="4" width="2" height="2" fill="currentColor"/>
              <rect x="5" y="4" width="2" height="2" fill="currentColor"/>
              <rect x="9" y="4" width="2" height="2" fill="currentColor"/>
              <rect x="11" y="4" width="2" height="2" fill="currentColor"/>
              <rect x="3" y="6" width="2" height="2" fill="currentColor"/>
              <rect x="7" y="6" width="2" height="2" fill="currentColor"/>
              <rect x="11" y="6" width="2" height="2" fill="currentColor"/>
              <rect x="3" y="8" width="2" height="2" fill="currentColor"/>
              <rect x="5" y="8" width="2" height="2" fill="currentColor"/>
              <rect x="9" y="8" width="2" height="2" fill="currentColor"/>
              <rect x="11" y="8" width="2" height="2" fill="currentColor"/>
              <rect x="5" y="10" width="2" height="2" fill="currentColor"/>
              <rect x="7" y="10" width="2" height="2" fill="currentColor"/>
              <rect x="9" y="10" width="2" height="2" fill="currentColor"/>
              <rect x="6" y="12" width="2" height="2" fill="currentColor"/>
              <rect x="8" y="12" width="2" height="2" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--neutral-800)]">
              Re:turn
            </h1>
            <p className="text-xs text-[var(--neutral-500)]">
              AI 기반 회상치료 플랫폼
            </p>
          </div>
        </Link>

        {/* 설정 버튼 */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/settings')}
            className="p-2 hover:bg-[var(--neutral-100)] rounded-lg transition-colors"
            aria-label="설정"
          >
            <svg
              className="w-6 h-6 text-[var(--neutral-600)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
