'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoUploader } from '@/components/photos';
import { PhotoCard } from '@/components/photos';
import type { PhotoData } from '@/components/photos/PhotoCard';
import { usePhotoStore } from '@/store/photoStore';
import { useSessionStore } from '@/store/sessionStore';
import { Button, Card } from '@/components/ui';

export default function PhotosPage() {
  const router = useRouter();
  const { sessionId, ensureSession } = useSessionStore();
  const { photos, addPhotos, updatePhoto, removePhoto, selectPhoto, selectedPhotoId } = usePhotoStore();

  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 세션 확인
  useEffect(() => {
    ensureSession();
  }, [ensureSession]);

  // 서버에서 사진 목록 불러오기
  useEffect(() => {
    const fetchPhotos = async () => {
      if (!sessionId) return;

      try {
        const response = await fetch(`/api/photos?sessionId=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.photos && data.photos.length > 0) {
            // 서버 데이터와 로컬 데이터 동기화
            const localPhotoIds = new Set(photos.map(p => p.id));

            // 서버에만 있는 사진 추가
            const newPhotos = data.photos.filter((p: PhotoData) => !localPhotoIds.has(p.id));
            if (newPhotos.length > 0) {
              addPhotos(newPhotos);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch photos:', err);
      }
    };

    fetchPhotos();
  }, [sessionId]);

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
  }, [removePhoto]);

  // 회상 대화 시작
  const handleStartReminiscence = useCallback(() => {
    if (selectedPhotoId) {
      router.push(`/training/reminiscence?photoId=${selectedPhotoId}`);
    }
  }, [router, selectedPhotoId]);

  // 선택된 사진 정보
  const selectedPhoto = photos.find(p => p.id === selectedPhotoId);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">사진 관리</h1>
              <p className="text-sm text-slate-500 mt-1">
                추억이 담긴 사진을 업로드하고 AI 분석을 받아보세요
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
            >
              홈으로
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 업로드 및 갤러리 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 업로드 영역 */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                사진 업로드
              </h2>
              <PhotoUploader
                onUpload={handleUpload}
                maxFiles={10}
                maxSizeMB={10}
                disabled={isUploading}
              />
              {isUploading && (
                <div className="mt-4 flex items-center justify-center text-primary-600">
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

            {/* 갤러리 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  내 사진 ({photos.length}장)
                </h2>
                {photos.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const unanalyzed = photos.find(p => !p.isAnalyzed);
                      if (unanalyzed) {
                        handleAnalyze(unanalyzed.id);
                      }
                    }}
                    disabled={isAnalyzing !== null}
                  >
                    {isAnalyzing ? '분석 중...' : '미분석 사진 분석'}
                  </Button>
                )}
              </div>

              {photos.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <svg
                    className="mx-auto h-12 w-12 text-slate-400 mb-4"
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
                  <p>아직 업로드된 사진이 없습니다.</p>
                  <p className="text-sm mt-1">위에서 사진을 업로드해주세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                        selectedPhotoId === photo.id
                          ? 'border-primary-500 ring-2 ring-primary-200'
                          : 'border-transparent hover:border-slate-300'
                      }`}
                      onClick={() => selectPhoto(photo.id)}
                    >
                      <PhotoCard
                        photo={photo}
                        onAnalyze={() => handleAnalyze(photo.id)}
                        onDelete={() => handleDelete(photo.id)}
                        isAnalyzing={isAnalyzing === photo.id}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* 오른쪽: 선택된 사진 상세 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  사진 상세
                </h2>

                {selectedPhoto ? (
                  <div className="space-y-4">
                    {/* 미리보기 */}
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={selectedPhoto.fileUrl}
                        alt={selectedPhoto.fileName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* 파일 정보 */}
                    <div className="text-sm text-slate-600">
                      <p className="font-medium text-slate-800">{selectedPhoto.fileName}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        업로드: {new Date(selectedPhoto.uploadedAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>

                    {/* AI 분석 결과 */}
                    {selectedPhoto.isAnalyzed && selectedPhoto.autoTags ? (
                      <div className="space-y-3 pt-4 border-t border-slate-200">
                        <h3 className="font-medium text-slate-800">AI 분석 결과</h3>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded-lg">
                            <span className="text-slate-500">장면</span>
                            <p className="font-medium">{selectedPhoto.autoTags.scene}</p>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg">
                            <span className="text-slate-500">인원</span>
                            <p className="font-medium">{selectedPhoto.autoTags.peopleCount}명</p>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg">
                            <span className="text-slate-500">시대</span>
                            <p className="font-medium">{selectedPhoto.autoTags.estimatedEra}</p>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg">
                            <span className="text-slate-500">분위기</span>
                            <p className="font-medium">{selectedPhoto.autoTags.mood}</p>
                          </div>
                        </div>

                        {selectedPhoto.autoTags.description && (
                          <div className="p-3 bg-primary-50 rounded-lg">
                            <p className="text-sm text-primary-800">
                              {selectedPhoto.autoTags.description}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-sm text-slate-500 mb-3">
                          AI 분석을 통해 사진의 내용을 자동으로 파악합니다.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleAnalyze(selectedPhoto.id)}
                          disabled={isAnalyzing !== null}
                        >
                          {isAnalyzing === selectedPhoto.id ? '분석 중...' : 'AI 분석 시작'}
                        </Button>
                      </div>
                    )}

                    {/* 회상 대화 시작 버튼 */}
                    <div className="pt-4">
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleStartReminiscence}
                        disabled={!selectedPhoto.isAnalyzed}
                      >
                        이 사진으로 회상 대화 시작
                      </Button>
                      {!selectedPhoto.isAnalyzed && (
                        <p className="text-xs text-slate-500 text-center mt-2">
                          AI 분석 후 회상 대화를 시작할 수 있습니다
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <svg
                      className="mx-auto h-12 w-12 text-slate-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <p>사진을 선택하면</p>
                    <p>상세 정보를 볼 수 있습니다</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
