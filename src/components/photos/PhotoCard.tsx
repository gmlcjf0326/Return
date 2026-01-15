'use client';

import { useState } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';

export interface PhotoData {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  autoTags?: {
    scene?: string;
    peopleCount?: number;
    estimatedEra?: string;
    locationType?: string;
    mood?: string;
    objects?: string[];
    description?: string;
  };
  userTags?: string[];
  isAnalyzed: boolean;
  isAnalyzing?: boolean;
}

interface PhotoCardProps {
  photo: PhotoData;
  onSelect?: (photo: PhotoData) => void;
  onAnalyze?: (photoId: string) => void;
  onDelete?: (photoId: string) => void;
  selected?: boolean;
  isAnalyzing?: boolean;
}

export type { PhotoCardProps };

export default function PhotoCard({
  photo,
  onSelect,
  onAnalyze,
  onDelete,
  selected = false,
  isAnalyzing = false,
}: PhotoCardProps) {
  // Use prop isAnalyzing if provided, otherwise fallback to photo.isAnalyzing
  const analyzing = isAnalyzing || photo.isAnalyzing;
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    onSelect?.(photo);
  };

  const handleAnalyze = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAnalyze?.(photo.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 사진을 삭제하시겠습니까?')) {
      onDelete?.(photo.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative group rounded-xl overflow-hidden cursor-pointer
        transition-all duration-200
        ${selected
          ? 'ring-4 ring-[var(--primary)] shadow-lg scale-[1.02]'
          : 'hover:shadow-md'
        }
      `}
    >
      {/* 이미지 */}
      <div className="aspect-square bg-[var(--neutral-100)]">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🖼️
          </div>
        ) : (
          <img
            src={photo.fileUrl}
            alt={photo.fileName}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* 상태 배지 */}
      <div className="absolute top-2 left-2">
        {analyzing ? (
          <StatusBadge status="pending">분석 중...</StatusBadge>
        ) : photo.isAnalyzed ? (
          <StatusBadge status="normal">분석 완료</StatusBadge>
        ) : (
          <StatusBadge status="inactive">미분석</StatusBadge>
        )}
      </div>

      {/* 호버 오버레이 */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent
          transition-opacity duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {/* 하단 정보 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          {/* 태그 */}
          {photo.autoTags && (
            <div className="flex flex-wrap gap-1 mb-2">
              {photo.autoTags.scene && (
                <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full">
                  {photo.autoTags.scene}
                </span>
              )}
              {photo.autoTags.mood && (
                <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full">
                  {photo.autoTags.mood}
                </span>
              )}
              {photo.autoTags.estimatedEra && (
                <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full">
                  {photo.autoTags.estimatedEra}
                </span>
              )}
            </div>
          )}

          {/* 파일명 */}
          <p className="text-sm truncate">{photo.fileName}</p>
        </div>

        {/* 액션 버튼 */}
        <div className="absolute top-2 right-2 flex gap-1">
          {!photo.isAnalyzed && !analyzing && onAnalyze && (
            <button
              onClick={handleAnalyze}
              className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center hover:bg-[var(--primary-deep)] transition-colors"
              title="AI 분석"
            >
              🔍
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="w-8 h-8 bg-[var(--danger)] text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
              title="삭제"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* 선택 체크 */}
      {selected && (
        <div className="absolute top-2 right-2 w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center">
          ✓
        </div>
      )}
    </div>
  );
}
