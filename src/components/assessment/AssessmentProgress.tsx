'use client';

import type { CognitiveCategory } from '@/data/assessment-questions';
import { categoryConfig } from '@/data/assessment-questions';

interface AssessmentProgressProps {
  /** 현재 문항 번호 (1부터 시작) */
  currentQuestion: number;
  /** 전체 문항 수 */
  totalQuestions: number;
  /** 현재 카테고리 */
  currentCategory?: CognitiveCategory;
  /** 카테고리별 완료 여부 */
  completedCategories?: CognitiveCategory[];
  /** 간단 모드 (문항 번호만 표시) */
  compact?: boolean;
}

export default function AssessmentProgress({
  currentQuestion,
  totalQuestions,
  currentCategory,
  completedCategories = [],
  compact = false,
}: AssessmentProgressProps) {
  const progress = (currentQuestion / totalQuestions) * 100;

  // 모든 카테고리 목록
  const allCategories: CognitiveCategory[] = [
    'memory',
    'language',
    'calculation',
    'attention',
    'executive',
    'visuospatial',
  ];

  if (compact) {
    return (
      <div className="w-full">
        {/* 단계 표시 */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--neutral-600)]">
            진행 상황
          </span>
          <span className="text-sm font-bold text-[var(--primary)]">
            {currentQuestion} / {totalQuestions}
          </span>
        </div>

        {/* 진행 바 */}
        <div className="w-full h-2 bg-[var(--neutral-200)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 상단: 문항 번호 및 카테고리 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* 문항 번호 */}
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-[var(--primary)]">
              {currentQuestion}
            </span>
            <span className="text-lg text-[var(--neutral-400)]">/</span>
            <span className="text-lg text-[var(--neutral-500)]">
              {totalQuestions}
            </span>
          </div>

          {/* 현재 카테고리 */}
          {currentCategory && (
            <div className="flex items-center gap-2 px-3 py-1 bg-[var(--primary-lighter)] rounded-full">
              <span className="text-lg">{categoryConfig[currentCategory].icon}</span>
              <span className="text-sm font-medium text-[var(--primary)]">
                {categoryConfig[currentCategory].name}
              </span>
            </div>
          )}
        </div>

        {/* 진행률 퍼센트 */}
        <span className="text-lg font-semibold text-[var(--neutral-600)]">
          {Math.round(progress)}%
        </span>
      </div>

      {/* 메인 진행 바 */}
      <div className="w-full h-3 bg-[var(--neutral-200)] rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-[var(--primary-deep)] via-[var(--primary)] to-[var(--primary-light)] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 카테고리 인디케이터 */}
      <div className="flex items-center justify-between mt-4 px-1">
        {allCategories.map((category) => {
          const config = categoryConfig[category];
          const isCompleted = completedCategories.includes(category);
          const isCurrent = currentCategory === category;

          return (
            <div
              key={category}
              className="flex flex-col items-center gap-1"
              title={config.name}
            >
              {/* 카테고리 아이콘 */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg
                  transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-[var(--success)] text-white'
                      : isCurrent
                        ? 'bg-[var(--primary)] text-white ring-4 ring-[var(--primary-lighter)]'
                        : 'bg-[var(--neutral-200)] text-[var(--neutral-500)]'
                  }
                `}
              >
                {isCompleted ? '✓' : config.icon}
              </div>

              {/* 카테고리 이름 (작게) */}
              <span
                className={`
                  text-xs font-medium truncate max-w-[60px]
                  ${
                    isCurrent
                      ? 'text-[var(--primary)]'
                      : isCompleted
                        ? 'text-[var(--success)]'
                        : 'text-[var(--neutral-400)]'
                  }
                `}
              >
                {config.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
