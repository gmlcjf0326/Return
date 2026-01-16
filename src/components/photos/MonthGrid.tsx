/**
 * 월별 사진 그리드 컴포넌트
 * iPhone 스타일 앨범에서 월별 섹션을 표시
 */

'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { PhotoData } from '@/components/photos/PhotoCard';
import { getCategoryIcon } from '@/data/photoCategories';

interface MonthGridProps {
  month: number;
  monthName: string;
  photos: PhotoData[];
  onPhotoClick?: (photo: PhotoData) => void;
  selectedPhotoId?: string;
  className?: string;
}

export default function MonthGrid({
  month,
  monthName,
  photos,
  onPhotoClick,
  selectedPhotoId,
  className,
}: MonthGridProps) {
  return (
    <div className={cn('mb-6', className)}>
      {/* 월 헤더 */}
      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
        <span>{monthName}</span>
        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
          {photos.length}장
        </span>
      </h3>

      {/* 사진 그리드 */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1">
        {photos.map((photo) => (
          <PhotoThumbnail
            key={photo.id}
            photo={photo}
            isSelected={selectedPhotoId === photo.id}
            onClick={() => onPhotoClick?.(photo)}
          />
        ))}
      </div>
    </div>
  );
}

interface PhotoThumbnailProps {
  photo: PhotoData;
  isSelected?: boolean;
  onClick?: () => void;
}

function PhotoThumbnail({ photo, isSelected, onClick }: PhotoThumbnailProps) {
  const categoryIcon = photo.category ? getCategoryIcon(photo.category) : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative aspect-square overflow-hidden rounded-sm',
        'transition-all duration-200',
        'hover:opacity-90 hover:scale-[1.02]',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* 사진 이미지 */}
      <Image
        src={photo.fileUrl}
        alt={photo.fileName}
        fill
        sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
        className="object-cover"
        loading="lazy"
      />

      {/* 더미 데이터 표시 */}
      {photo.isDummy && (
        <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1 rounded">
          더미
        </div>
      )}

      {/* 카테고리 아이콘 */}
      {categoryIcon && (
        <div className="absolute bottom-1 right-1 bg-black/50 text-white text-sm px-1 rounded">
          {categoryIcon}
        </div>
      )}

      {/* 선택 표시 */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
          <div className="bg-primary text-primary-foreground rounded-full p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
}

export { MonthGrid, PhotoThumbnail };
