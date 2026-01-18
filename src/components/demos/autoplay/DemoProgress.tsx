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
      {/* 전체 진행 바 - 단순화 */}
      <div className="h-2 bg-[var(--neutral-200)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--primary)] rounded-full transition-all duration-200 ease-linear"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* 진행 텍스트 - 간결하게 */}
      <div className="text-center mt-3 text-[var(--neutral-600)] text-sm font-medium">
        {currentScene + 1} / {totalScenes}
      </div>
    </div>
  );
}
