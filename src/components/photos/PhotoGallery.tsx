'use client';

import { useState, useMemo } from 'react';
import PhotoCard, { PhotoData } from './PhotoCard';

type SortOption = 'newest' | 'oldest' | 'analyzed' | 'unanalyzed';
type FilterOption = 'all' | 'analyzed' | 'unanalyzed';

interface PhotoGalleryProps {
  photos: PhotoData[];
  onSelectPhoto?: (photo: PhotoData) => void;
  onAnalyzePhoto?: (photoId: string) => void;
  onDeletePhoto?: (photoId: string) => void;
  selectedPhotoId?: string;
  emptyMessage?: string;
}

export default function PhotoGallery({
  photos,
  onSelectPhoto,
  onAnalyzePhoto,
  onDeletePhoto,
  selectedPhotoId,
  emptyMessage = '아직 업로드된 사진이 없습니다.',
}: PhotoGalleryProps) {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 필터링 및 정렬
  const filteredPhotos = useMemo(() => {
    let result = [...photos];

    // 검색 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((photo) => {
        const tags = photo.autoTags;
        return (
          photo.fileName.toLowerCase().includes(term) ||
          tags?.scene?.toLowerCase().includes(term) ||
          tags?.mood?.toLowerCase().includes(term) ||
          tags?.estimatedEra?.toLowerCase().includes(term) ||
          tags?.description?.toLowerCase().includes(term) ||
          tags?.objects?.some((obj) => obj.toLowerCase().includes(term)) ||
          photo.userTags?.some((tag) => tag.toLowerCase().includes(term))
        );
      });
    }

    // 상태 필터
    if (filterBy === 'analyzed') {
      result = result.filter((p) => p.isAnalyzed);
    } else if (filterBy === 'unanalyzed') {
      result = result.filter((p) => !p.isAnalyzed);
    }

    // 정렬
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'oldest':
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case 'analyzed':
          return (b.isAnalyzed ? 1 : 0) - (a.isAnalyzed ? 1 : 0);
        case 'unanalyzed':
          return (a.isAnalyzed ? 1 : 0) - (b.isAnalyzed ? 1 : 0);
        default:
          return 0;
      }
    });

    return result;
  }, [photos, sortBy, filterBy, searchTerm]);

  // 통계
  const stats = useMemo(() => ({
    total: photos.length,
    analyzed: photos.filter((p) => p.isAnalyzed).length,
    unanalyzed: photos.filter((p) => !p.isAnalyzed).length,
  }), [photos]);

  return (
    <div className="space-y-4">
      {/* 헤더: 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* 검색 */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="사진 검색 (태그, 파일명...)"
            className="w-full pl-10 pr-4 py-2 border border-[var(--neutral-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neutral-400)]">
            🔍
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--neutral-400)] hover:text-[var(--neutral-600)]"
            >
              ×
            </button>
          )}
        </div>

        {/* 필터 및 정렬 */}
        <div className="flex gap-2">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
            className="px-3 py-2 border border-[var(--neutral-300)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">전체 ({stats.total})</option>
            <option value="analyzed">분석됨 ({stats.analyzed})</option>
            <option value="unanalyzed">미분석 ({stats.unanalyzed})</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border border-[var(--neutral-300)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="analyzed">분석됨 먼저</option>
            <option value="unanalyzed">미분석 먼저</option>
          </select>
        </div>
      </div>

      {/* 사진 그리드 */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onSelect={onSelectPhoto}
              onAnalyze={onAnalyzePhoto}
              onDelete={onDeletePhoto}
              selected={photo.id === selectedPhotoId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📷</div>
          <p className="text-[var(--neutral-500)]">
            {searchTerm || filterBy !== 'all'
              ? '검색 결과가 없습니다.'
              : emptyMessage}
          </p>
        </div>
      )}

      {/* 결과 수 */}
      {filteredPhotos.length > 0 && (
        <div className="text-center text-sm text-[var(--neutral-500)]">
          {searchTerm || filterBy !== 'all'
            ? `${filteredPhotos.length}개 검색됨`
            : `총 ${photos.length}개 사진`}
        </div>
      )}
    </div>
  );
}
