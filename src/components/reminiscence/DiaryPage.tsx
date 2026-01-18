/**
 * 그림일기 페이지 컴포넌트
 * 상단: AI 생성 이미지
 * 하단: 원고지 형태 일기장 텍스트
 */

'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { ManuscriptPaper } from './ManuscriptPaper';
import { imageStyleInfo, type DiaryImageStyle } from '@/lib/ai/imageGeneration';
import { getCategoryLabel, getCategoryIcon } from '@/data/photoCategories';
import type { PhotoData } from '@/components/photos/PhotoCard';

interface DiaryPageProps {
  /** 원본 사진 데이터 */
  photoData: PhotoData;
  /** AI 생성 이미지 URL (없으면 원본 사진 사용) */
  generatedImageUrl?: string;
  /** 일기 내용 (대화 요약) */
  diaryText: string;
  /** 날짜 (YYYY-MM-DD 또는 표시할 문자열) */
  date: string;
  /** 현재 선택된 이미지 스타일 */
  selectedStyle?: DiaryImageStyle;
  /** 스타일 변경 핸들러 */
  onStyleChange?: (style: DiaryImageStyle) => void;
  /** 이미지 재생성 핸들러 */
  onRegenerateImage?: () => void;
  /** 플레이스홀더 이미지인지 여부 */
  isPlaceholder?: boolean;
  /** 이미지 생성 중인지 여부 */
  isGenerating?: boolean;
  /** 원고지 글자 수 설정 */
  manuscriptConfig?: {
    charsPerRow?: number;
    maxRows?: number;
    vertical?: boolean;
    fontSize?: 'small' | 'normal' | 'large';
  };
  /** 추가 클래스 */
  className?: string;
}

export default function DiaryPage({
  photoData,
  generatedImageUrl,
  diaryText,
  date,
  selectedStyle = 'pencil',
  onStyleChange,
  onRegenerateImage,
  isPlaceholder = true,
  isGenerating = false,
  manuscriptConfig = {},
  className,
}: DiaryPageProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const category = photoData.category || 'daily';

  // 표시할 이미지 URL 결정
  const displayImage = showOriginal || imageError
    ? photoData.fileUrl
    : (generatedImageUrl || photoData.fileUrl);

  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
    } catch {
      return dateStr;
    }
  };

  // 이미지 로드 에러 핸들러
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <div
      className={cn(
        'diary-page bg-white rounded-2xl shadow-lg overflow-hidden',
        'border-4 border-amber-100',
        className
      )}
    >
      {/* 상단: 그림 영역 */}
      <div className="diary-image-section relative">
        {/* 이미지 */}
        <div className="relative aspect-[4/3] bg-amber-50">
          {isGenerating ? (
            // 로딩 상태
            <div className="absolute inset-0 flex items-center justify-center bg-amber-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4 mx-auto" />
                <p className="text-amber-700">그림을 그리는 중...</p>
              </div>
            </div>
          ) : (
            <Image
              src={displayImage}
              alt="그림일기 이미지"
              fill
              className={cn(
                'object-cover transition-all duration-500',
                !showOriginal && !imageError && 'sepia-[0.1] saturate-[1.1]'
              )}
              onError={handleImageError}
            />
          )}

          {/* 스타일 라벨 (플레이스홀더일 때) */}
          {isPlaceholder && !showOriginal && !isGenerating && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                {imageStyleInfo[selectedStyle].icon} {imageStyleInfo[selectedStyle].label} 스타일
              </span>
            </div>
          )}

          {/* 원본/그림 토글 버튼 */}
          {!isGenerating && (
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="absolute top-3 right-3 bg-white/90 hover:bg-white text-sm px-3 py-1.5 rounded-full shadow-md transition-all"
            >
              {showOriginal ? '그림 보기' : '원본 보기'}
            </button>
          )}
        </div>

        {/* 스타일 선택 바 */}
        {onStyleChange && (
          <div className="flex justify-center gap-2 py-3 bg-amber-50/50 border-t border-amber-100">
            {(Object.keys(imageStyleInfo) as DiaryImageStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => onStyleChange(style)}
                disabled={isGenerating}
                className={cn(
                  'px-4 py-2 text-sm rounded-full transition-all',
                  selectedStyle === style
                    ? 'bg-primary text-white shadow-md scale-105'
                    : 'bg-white hover:bg-amber-100 text-amber-800',
                  isGenerating && 'opacity-50 cursor-not-allowed'
                )}
              >
                {imageStyleInfo[style].icon} {imageStyleInfo[style].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 하단: 원고지 일기장 */}
      <div className="diary-text-section p-4 md:p-6">
        {/* 날짜 헤더 */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
            <span className="text-amber-600">📅</span>
            <span className="font-bold text-amber-900">{formatDate(date)}</span>
          </div>
        </div>

        {/* 원고지 */}
        <ManuscriptPaper
          text={diaryText}
          title="오늘의 추억"
          charsPerRow={manuscriptConfig.charsPerRow || 20}
          maxRows={manuscriptConfig.maxRows || 8}
          vertical={manuscriptConfig.vertical || false}
          fontSize={manuscriptConfig.fontSize || 'normal'}
        />

        {/* 메타데이터 */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-amber-700">
          {/* 카테고리 */}
          <span className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full">
            {getCategoryIcon(category)}
            {getCategoryLabel(category)}
          </span>

          {/* 장소 */}
          {photoData.autoTags?.scene && (
            <span className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full">
              📍 {photoData.autoTags.scene}
            </span>
          )}

          {/* 분위기 */}
          {photoData.autoTags?.mood && (
            <span className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full">
              ✨ {photoData.autoTags.mood}
            </span>
          )}
        </div>

        {/* 재생성 버튼 */}
        {onRegenerateImage && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerateImage}
              disabled={isGenerating}
              className="text-primary border-primary hover:bg-primary/10"
            >
              {isGenerating ? '생성 중...' : '그림 다시 그리기'}
            </Button>
          </div>
        )}
      </div>

      {/* 테이프 장식 */}
      <div className="absolute -top-2 left-8 w-20 h-6 bg-amber-200/70 rotate-[-2deg] rounded shadow-sm" />
      <div className="absolute -top-2 right-8 w-16 h-6 bg-amber-200/70 rotate-[3deg] rounded shadow-sm" />
    </div>
  );
}

export { DiaryPage };
