/**
 * 사진 관리 페이지
 * iPhone 스타일 앨범 레이아웃 + 카테고리 필터링
 * TODO: [REAL_DATA] 실제 사진 업로드 연동
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PhotoUploader } from '@/components/photos';
import PhotoAlbum from '@/components/photos/PhotoAlbum';
import type { PhotoData } from '@/components/photos/PhotoCard';
import { usePhotoStore } from '@/store/photoStore';
import { useSessionStore } from '@/store/sessionStore';
import { Button, Card } from '@/components/ui';
import { getCategoryLabel, getCategoryIcon, getCategoryColor } from '@/data/photoCategories';
import { formatPhotoDate } from '@/lib/utils/photoUtils';

type ViewMode = 'album' | 'upload';

export default function PhotosPage() {
  const router = useRouter();
  const { session, initSession } = useSessionStore();
  const sessionId = session?.id;
  const {
    photos,
    addPhotos,
    updatePhoto,
    removePhoto,
    selectPhoto,
    selectedPhotoId,
    initializeDummyData,
  } = usePhotoStore();

  const [viewMode, setViewMode] = useState<ViewMode>('album');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 세션 확인 및 더미 데이터 초기화 - 마운트 시 1회만 실행
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    initSession();
    // TODO: [REAL_DATA] 실제 데이터 연동 시 이 호출 제거
    initializeDummyData();
  }, []);

  // 사진 업로드 처리
  const handleUpload = useCallback(async (files: File[]) => {
    if (!sessionId) {
      setError('세션이 없습니다. 페이지를 새로고침해주세요.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('업로드에 실패했습니다.');
      }

      const data = await response.json();
      if (data.photos) {
        addPhotos(data.photos);
      }
      // 업로드 후 앨범 뷰로 전환
      setViewMode('album');
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  }, [sessionId, addPhotos]);

  // AI 자동 분석
  const handleAnalyze = useCallback(async (photoId: string) => {
    setIsAnalyzing(photoId);
    setError(null);

    try {
      const response = await fetch(`/api/photos/${photoId}/auto-tag`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('분석에 실패했습니다.');
      }

      const data = await response.json();
      if (data.autoTags) {
        updatePhoto(photoId, {
          autoTags: data.autoTags,
          isAnalyzed: true,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(null);
    }
  }, [updatePhoto]);

  // 사진 삭제
  const handleDelete = useCallback(async (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);

    // 더미 데이터는 로컬에서만 삭제
    if (photo?.isDummy) {
      removePhoto(photoId);
      return;
    }

    try {
      const response = await fetch(`/api/photos?id=${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        removePhoto(photoId);
      }
    } catch (err) {
      console.error('Failed to delete photo:', err);
    }
  }, [photos, removePhoto]);

  // 회상 대화 시작
  const handleStartReminiscence = useCallback(() => {
    if (selectedPhotoId) {
      router.push(`/training/reminiscence?photoId=${selectedPhotoId}`);
    }
  }, [router, selectedPhotoId]);

  // 사진 클릭
  const handlePhotoClick = useCallback((photo: PhotoData) => {
    selectPhoto(photo.id);
  }, [selectPhoto]);

  // 선택된 사진 정보
  const selectedPhoto = photos.find(p => p.id === selectedPhotoId);

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-card border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">📷 사진 관리</h1>
              <p className="text-sm text-muted-foreground mt-1">
                추억이 담긴 사진을 탐색하고 회상 대화를 시작해보세요
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* 뷰 모드 토글 */}
              <div className="flex rounded-lg border overflow-hidden">
                <button
                  onClick={() => setViewMode('album')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === 'album'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-accent'
                  }`}
                >
                  앨범
                </button>
                <button
                  onClick={() => setViewMode('upload')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === 'upload'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-accent'
                  }`}
                >
                  업로드
                </button>
              </div>
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
              >
                홈으로
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
            {error}
          </div>
        )}

        {viewMode === 'upload' ? (
          /* 업로드 뷰 */
          <Card className="p-6 max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">
              새 사진 업로드
            </h2>
            <PhotoUploader
              onUpload={handleUpload}
              maxFiles={10}
              maxSizeMB={10}
              disabled={isUploading}
            />
            {isUploading && (
              <div className="mt-4 flex items-center justify-center text-primary">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                업로드 중...
              </div>
            )}
          </Card>
        ) : (
          /* 앨범 뷰 */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: 사진 앨범 */}
            <div className="lg:col-span-2">
              <PhotoAlbum
                photos={photos}
                onPhotoClick={handlePhotoClick}
                selectedPhotoId={selectedPhotoId || undefined}
                showCategoryFilter={true}
              />
            </div>

            {/* 오른쪽: 선택된 사진 상세 */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    사진 상세
                  </h2>

                  {selectedPhoto ? (
                    <div className="space-y-4">
                      {/* 미리보기 */}
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                        <Image
                          src={selectedPhoto.fileUrl}
                          alt={selectedPhoto.fileName}
                          fill
                          className="object-cover"
                        />
                        {selectedPhoto.isDummy && (
                          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            더미 데이터
                          </div>
                        )}
                      </div>

                      {/* 파일 정보 */}
                      <div className="text-sm">
                        <p className="font-medium">{selectedPhoto.fileName}</p>
                        {selectedPhoto.takenDate && (
                          <p className="text-muted-foreground mt-1">
                            촬영일: {formatPhotoDate(selectedPhoto.takenDate)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          업로드: {new Date(selectedPhoto.uploadedAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>

                      {/* 카테고리 태그 */}
                      {selectedPhoto.category && (
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium text-white"
                            style={{ backgroundColor: getCategoryColor(selectedPhoto.category) }}
                          >
                            {getCategoryIcon(selectedPhoto.category)}
                            {getCategoryLabel(selectedPhoto.category)}
                          </span>
                        </div>
                      )}

                      {/* AI 분석 결과 */}
                      {selectedPhoto.isAnalyzed && selectedPhoto.autoTags ? (
                        <div className="space-y-3 pt-4 border-t">
                          <h3 className="font-medium">AI 분석 결과</h3>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-2 bg-muted rounded-lg">
                              <span className="text-muted-foreground text-xs">장면</span>
                              <p className="font-medium">{selectedPhoto.autoTags.scene}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <span className="text-muted-foreground text-xs">인원</span>
                              <p className="font-medium">{selectedPhoto.autoTags.peopleCount}명</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <span className="text-muted-foreground text-xs">시대</span>
                              <p className="font-medium">{selectedPhoto.autoTags.estimatedEra}</p>
                            </div>
                            <div className="p-2 bg-muted rounded-lg">
                              <span className="text-muted-foreground text-xs">분위기</span>
                              <p className="font-medium">{selectedPhoto.autoTags.mood}</p>
                            </div>
                          </div>

                          {selectedPhoto.autoTags.description && (
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <p className="text-sm text-primary">
                                {selectedPhoto.autoTags.description}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="pt-4 border-t">
                          <p className="text-sm text-muted-foreground mb-3">
                            AI 분석을 통해 사진의 내용을 자동으로 파악합니다.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleAnalyze(selectedPhoto.id)}
                            disabled={isAnalyzing !== null || selectedPhoto.isDummy}
                          >
                            {isAnalyzing === selectedPhoto.id ? '분석 중...' : 'AI 분석 시작'}
                          </Button>
                          {selectedPhoto.isDummy && (
                            <p className="text-xs text-muted-foreground text-center mt-2">
                              더미 데이터는 이미 분석되어 있습니다
                            </p>
                          )}
                        </div>
                      )}

                      {/* 액션 버튼 */}
                      <div className="pt-4 space-y-2">
                        <Button
                          variant="primary"
                          className="w-full"
                          onClick={handleStartReminiscence}
                        >
                          이 사진으로 회상 대화 시작
                        </Button>

                        {!selectedPhoto.isDummy && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(selectedPhoto.id)}
                          >
                            사진 삭제
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="text-5xl mb-4">👆</div>
                      <p>사진을 선택하면</p>
                      <p>상세 정보를 볼 수 있습니다</p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
