'use client';

import { useState } from 'react';
import type { PhotoData } from '@/components/photos/PhotoCard';
import { Button } from '@/components/ui';

interface PhotoContextProps {
  photo: PhotoData | null;
  onPhotoChange?: () => void;
  className?: string;
}

export function PhotoContext({ photo, onPhotoChange, className = '' }: PhotoContextProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!photo) {
    return (
      <div className={`bg-slate-50 rounded-xl p-6 text-center ${className}`}>
        <svg
          className="mx-auto h-16 w-16 text-slate-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-slate-500">사진이 선택되지 않았습니다</p>
        {onPhotoChange && (
          <Button variant="outline" size="sm" onClick={onPhotoChange} className="mt-4">
            사진 선택하기
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
      {/* 헤더 */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-primary-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="font-medium text-slate-700">현재 사진</span>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* 콘텐츠 */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* 사진 미리보기 */}
          <div className="aspect-video rounded-lg overflow-hidden bg-slate-100">
            <img
              src={photo.fileUrl}
              alt={photo.fileName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* AI 분석 정보 */}
          {photo.isAnalyzed && photo.autoTags ? (
            <div className="space-y-3">
              {/* 설명 */}
              {photo.autoTags.description && (
                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-800 leading-relaxed">
                    {photo.autoTags.description}
                  </p>
                </div>
              )}

              {/* 태그 정보 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                    />
                  </svg>
                  <span className="text-xs text-slate-600">{photo.autoTags.scene}</span>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span className="text-xs text-slate-600">{photo.autoTags.peopleCount}명</span>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-xs text-slate-600">{photo.autoTags.estimatedEra}</span>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-xs text-slate-600">{photo.autoTags.mood}</span>
                </div>
              </div>

              {/* 장소 */}
              {photo.autoTags.locationType && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{photo.autoTags.locationType}</span>
                </div>
              )}

              {/* 감지된 물체 */}
              {photo.autoTags.objects && photo.autoTags.objects.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {photo.autoTags.objects.map((obj, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                    >
                      {obj}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-slate-400">
              <p className="text-sm">AI 분석이 필요합니다</p>
            </div>
          )}

          {/* 사진 변경 버튼 */}
          {onPhotoChange && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPhotoChange}
              className="w-full"
            >
              다른 사진 선택
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default PhotoContext;
