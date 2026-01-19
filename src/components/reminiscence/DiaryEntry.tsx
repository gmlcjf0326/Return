/**
 * 그림일기 항목 컴포넌트
 * 이미지 + 텍스트 + 메타데이터를 표시
 * TODO: [IMAGE_API] 실제 이미지 생성 API 연동
 */

'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { DiaryImageStyle } from '@/lib/ai/imageGeneration';
import { getCategoryLabel, getCategoryIcon } from '@/data/photoCategories';
import type { PhotoData } from '@/components/photos/PhotoCard';

interface DiaryEntryProps {
  photoData: PhotoData;
  generatedImageUrl?: string;
  summary: string;
  date: string;
  selectedStyle: DiaryImageStyle;
  isPlaceholder?: boolean;
  className?: string;
}

export default function DiaryEntry({
  photoData,
  generatedImageUrl,
  summary,
  date,
  selectedStyle,
  isPlaceholder = true,
  className,
}: DiaryEntryProps) {
  const category = photoData.category || 'daily';
  // AI 생성 이미지가 있고 플레이스홀더가 아니면 AI 이미지 사용, 아니면 원본 사진
  const displayImage = (generatedImageUrl && !isPlaceholder)
    ? generatedImageUrl
    : photoData.fileUrl;
  const isAiGenerated = generatedImageUrl && !isPlaceholder;

  return (
    <div className={cn('p-6 md:p-8', className)}>
      {/* 날짜 헤더 */}
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground">📅</p>
        <h2 className="text-xl font-bold mt-1">{date}</h2>
      </div>

      {/* 이미지 영역 */}
      <div className="relative mx-auto max-w-md mb-6">
        {/* 이미지 프레임 */}
        <div className="relative aspect-square rounded-xl overflow-hidden border-4 border-amber-200 shadow-lg">
          <Image
            src={displayImage}
            alt="그림일기 이미지"
            fill
            className="object-cover transition-all duration-500 sepia-[0.15] saturate-[1.1]"
          />

          {/* 이미지 타입 표시 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end justify-center pb-4">
            <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">
              {isAiGenerated ? '🎨 AI 그림' : '📷 원본 사진'} • {getCategoryLabel(category)}
            </span>
          </div>
        </div>

        {/* 테이프 장식 */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-amber-100/80 rotate-1 rounded" />
        <div className="absolute -bottom-3 right-4 w-16 h-5 bg-amber-100/80 -rotate-2 rounded" />
      </div>

      {/* 일기 내용 */}
      <div className="max-w-md mx-auto">
        {/* 내용 */}
        <div className="bg-white/50 rounded-lg p-4 mb-4 border border-amber-100">
          <p
            className="text-lg leading-relaxed"
            style={{ fontFamily: 'var(--font-handwriting, cursive)' }}
          >
            ✏️ "{summary}"
          </p>
        </div>

        {/* 메타데이터 */}
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          {/* 카테고리 */}
          <span className="flex items-center gap-1">
            {getCategoryIcon(category)}
            {getCategoryLabel(category)}
          </span>

          {/* 장소 */}
          {photoData.autoTags?.scene && (
            <>
              <span>•</span>
              <span>📍 {photoData.autoTags.scene}</span>
            </>
          )}

          {/* 분위기 */}
          {photoData.autoTags?.mood && (
            <>
              <span>•</span>
              <span>✨ {photoData.autoTags.mood}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export { DiaryEntry };
