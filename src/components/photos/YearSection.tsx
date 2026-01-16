/**
 * 년도별 섹션 컴포넌트
 * iPhone 스타일 앨범에서 년도별 섹션을 표시 (스티키 헤더)
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import MonthGrid from './MonthGrid';
import type { YearGroup } from '@/lib/utils/photoUtils';
import type { PhotoData } from '@/components/photos/PhotoCard';

interface YearSectionProps {
  yearGroup: YearGroup;
  onPhotoClick?: (photo: PhotoData) => void;
  selectedPhotoId?: string;
  defaultExpanded?: boolean;
  className?: string;
}

export default function YearSection({
  yearGroup,
  onPhotoClick,
  selectedPhotoId,
  defaultExpanded = true,
  className,
}: YearSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className={cn('mb-8', className)}>
      {/* 년도 헤더 (스티키) */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-3 border-b">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-2 hover:bg-accent/50 rounded-lg py-1 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">{yearGroup.year}년</span>
            <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {yearGroup.totalPhotos}장
            </span>
          </div>

          {/* 확장/축소 아이콘 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              'transition-transform duration-200',
              isExpanded ? 'rotate-180' : ''
            )}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* 월별 그리드 */}
      {isExpanded && (
        <div className="mt-4 px-2">
          {yearGroup.months.map((monthGroup) => (
            <MonthGrid
              key={`${yearGroup.year}-${monthGroup.month}`}
              month={monthGroup.month}
              monthName={monthGroup.monthName}
              photos={monthGroup.photos}
              onPhotoClick={onPhotoClick}
              selectedPhotoId={selectedPhotoId}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export { YearSection };
