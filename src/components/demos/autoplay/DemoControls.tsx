'use client';

import { DemoControlsProps } from './types';

export function DemoControls({
  isPlaying,
  onPlayPause,
  onSkip,
  onClose,
}: DemoControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* 재생/일시정지 버튼 - 실제 앱 스타일 */}
      <button
        onClick={onPlayPause}
        className="w-14 h-14 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-deep)] flex items-center justify-center transition-colors shadow-lg"
        aria-label={isPlaying ? '일시정지' : '재생'}
      >
        {isPlaying ? (
          <svg
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-white ml-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* 건너뛰기 버튼 - 실제 앱 스타일 */}
      <button
        onClick={onSkip}
        className="w-10 h-10 rounded-full bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] flex items-center justify-center transition-colors"
        aria-label="다음 씬으로"
      >
        <svg
          className="w-5 h-5 text-[var(--neutral-600)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* 닫기 버튼 - 실제 앱 스타일 */}
      <button
        onClick={onClose}
        className="w-10 h-10 rounded-full bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] flex items-center justify-center transition-colors"
        aria-label="닫기"
      >
        <svg
          className="w-5 h-5 text-[var(--neutral-600)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
