'use client';

import { DemoProgressProps } from './types';

export function DemoProgress({
  currentScene,
  totalScenes,
  sceneProgress,
}: DemoProgressProps) {
  // 전체 진행률 계산
  const overallProgress =
    ((currentScene + sceneProgress / 100) / totalScenes) * 100;

  return (
    <div className="w-full">
      {/* 전체 진행 바 - 실제 앱 스타일 */}
      <div className="h-1.5 bg-[var(--neutral-200)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--primary)] rounded-full transition-all duration-300 ease-linear"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* 씬 인디케이터 - 실제 앱 스타일 */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {Array.from({ length: totalScenes }).map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              idx < currentScene
                ? 'bg-[var(--primary)]'
                : idx === currentScene
                ? 'bg-[var(--primary)] scale-125'
                : 'bg-[var(--neutral-300)]'
            }`}
          />
        ))}
      </div>

      {/* 진행 텍스트 - 실제 앱 스타일 */}
      <div className="text-center mt-2 text-[var(--neutral-500)] text-sm">
        {currentScene + 1} / {totalScenes}
      </div>
    </div>
  );
}
