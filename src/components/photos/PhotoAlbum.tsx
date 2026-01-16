/**
 * iPhone 스타일 사진 앨범 컴포넌트
 * 년도/월별 그룹핑 + 카테고리 필터링
 * TODO: [REAL_DATA] 실제 사진 업로드 후 연동
 */

'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import CategoryFilter from './CategoryFilter';
import YearSection from './YearSection';
import {
  groupPhotosByDate,
  filterPhotosByCategory,
} from '@/lib/utils/photoUtils';
import type { PhotoData, PhotoCategory } from '@/components/photos/PhotoCard';

interface PhotoAlbumProps {
  photos: PhotoData[];
  onPhotoClick?: (photo: PhotoData) => void;
  selectedPhotoId?: string;
  className?: string;
  showCategoryFilter?: boolean;
}

export default function PhotoAlbum({
  photos,
  onPhotoClick,
  selectedPhotoId,
  className,
  showCategoryFilter = true,
}: PhotoAlbumProps) {
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory | null>(null);

  // 카테고리별 사진 수 계산
  const photoCounts = useMemo(() => {
    const counts: Record<PhotoCategory | 'all', number> = {
      all: photos.length,
      family: 0,
      travel: 0,
      event: 0,
      nature: 0,
      daily: 0,
      friends: 0,
    };

    photos.forEach((photo) => {
      const category = photo.category || 'daily';
      counts[category]++;
    });

    return counts;
  }, [photos]);

  // 필터링된 사진
  const filteredPhotos = useMemo(() => {
    return filterPhotosByCategory(photos, selectedCategory);
  }, [photos, selectedCategory]);

  // 년도/월별 그룹핑
  const yearGroups = useMemo(() => {
    return groupPhotosByDate(filteredPhotos);
  }, [filteredPhotos]);

  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={cn('w-full', className)}>
      {/* 카테고리 필터 */}
      {showCategoryFilter && (
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm py-3 px-2 border-b">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            photoCounts={photoCounts}
          />
        </div>
      )}

      {/* 사진 목록 */}
      <div className="mt-4">
        {yearGroups.length === 0 ? (
          <EmptyState selectedCategory={selectedCategory} />
        ) : (
          <>
            {yearGroups.map((yearGroup) => (
              <YearSection
                key={yearGroup.year}
                yearGroup={yearGroup}
                onPhotoClick={onPhotoClick}
                selectedPhotoId={selectedPhotoId}
              />
            ))}

            {/* 맨 위로 버튼 */}
            <div className="flex justify-center py-8">
              <button
                onClick={scrollToTop}
                className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                맨 위로
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  selectedCategory: PhotoCategory | null;
}

function EmptyState({ selectedCategory }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">📷</div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {selectedCategory
          ? '해당 카테고리의 사진이 없습니다'
          : '사진이 없습니다'}
      </h3>
      <p className="text-sm text-muted-foreground">
        {selectedCategory
          ? '다른 카테고리를 선택해보세요'
          : '사진을 업로드해주세요'}
      </p>
    </div>
  );
}

export { PhotoAlbum };
