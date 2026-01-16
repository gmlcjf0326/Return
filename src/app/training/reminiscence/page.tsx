/**
 * 회상 대화 페이지
 * TODO: [REAL_DATA] 실제 데이터 연동
 * TODO: [LLM_API] 실제 LLM API 연동
 */

'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ChatInterface, PhotoContext } from '@/components/reminiscence';
import type { ChatMessage } from '@/components/reminiscence';
import { usePhotoStore } from '@/store/photoStore';
import { useSessionStore } from '@/store/sessionStore';
import { Button, Card } from '@/components/ui';
import type { PhotoData } from '@/components/photos/PhotoCard';
import { findSameDatePhotos, findRelatedPhotos, formatPhotoDate } from '@/lib/utils/photoUtils';
import { getCategoryLabel, getCategoryIcon, getCategoryColor } from '@/data/photoCategories';

function ReminiscenceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const photoId = searchParams.get('photoId');

  const { session, initSession } = useSessionStore();
  const sessionId = session?.id;
  const { photos, getPhotoById, initializeDummyData } = usePhotoStore();

  const [currentPhoto, setCurrentPhoto] = useState<PhotoData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hintQuestion, setHintQuestion] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  // 관련 사진
  const [sameDatePhotos, setSameDatePhotos] = useState<PhotoData[]>([]);
  const [relatedPhotos, setRelatedPhotos] = useState<PhotoData[]>([]);

  // 세션 확인 및 더미 데이터 초기화
  useEffect(() => {
    initSession();
    // TODO: [REAL_DATA] 실제 데이터 연동 시 제거
    initializeDummyData();
  }, [initSession, initializeDummyData]);

  // 사진 로드 및 관련 사진 찾기
  useEffect(() => {
    if (photoId && photos.length > 0) {
      const photo = getPhotoById(photoId);
      if (photo) {
        setCurrentPhoto(photo);
        // 같은 날짜 사진 찾기
        setSameDatePhotos(findSameDatePhotos(photos, photo));
        // 같은 카테고리 관련 사진 찾기
        setRelatedPhotos(findRelatedPhotos(photos, photo, 4));
      }
    }
  }, [photoId, photos, getPhotoById]);

  // 회상 세션 초기화
  useEffect(() => {
    const initializeSession = async () => {
      if (!currentPhoto || !sessionId || isInitialized) return;

      setIsLoading(true);
      try {
        const response = await fetch('/api/reminiscence/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoId: currentPhoto.id,
            sessionId,
            // 더미 데이터 지원을 위해 photoData 전달
            photoData: currentPhoto,
          }),
        });

        if (!response.ok) {
          throw new Error('세션 시작에 실패했습니다.');
        }

        const data = await response.json();

        if (data.initialMessage) {
          setMessages([
            {
              id: `msg-${Date.now()}`,
              role: 'assistant',
              content: data.initialMessage,
              timestamp: new Date(),
            },
          ]);
        }

        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize session:', err);
        setError(err instanceof Error ? err.message : '세션을 시작할 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [currentPhoto, sessionId, isInitialized]);

  // 메시지 전송
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!currentPhoto || !sessionId) return;

      // 사용자 메시지 추가
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setShowHint(false);

      setIsLoading(true);
      try {
        const response = await fetch('/api/reminiscence/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoId: currentPhoto.id,
            sessionId,
            message: content,
            conversationHistory: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            // 더미 데이터 지원을 위해 photoData 전달
            photoData: currentPhoto,
          }),
        });

        if (!response.ok) {
          throw new Error('메시지 전송에 실패했습니다.');
        }

        const data = await response.json();

        if (data.response) {
          const assistantMessage: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            content: data.response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }

        // 힌트 질문 업데이트
        if (data.hintQuestion) {
          setHintQuestion(data.hintQuestion);
        }
      } catch (err) {
        console.error('Failed to send message:', err);
        const errorMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'system',
          content: '메시지 전송에 실패했습니다. 다시 시도해주세요.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPhoto, sessionId, messages]
  );

  // 다른 사진으로 전환
  const handlePhotoSelect = useCallback((photo: PhotoData) => {
    router.push(`/training/reminiscence?photoId=${photo.id}`);
  }, [router]);

  // 사진 변경
  const handlePhotoChange = useCallback(() => {
    router.push('/photos');
  }, [router]);

  // 새 대화 시작
  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setIsInitialized(false);
    setHintQuestion(null);
    setShowHint(false);
  }, []);

  // 대화 완료 → 그림일기 페이지로 이동
  const handleCompleteConversation = useCallback(() => {
    if (!currentPhoto || messages.length < 2) return;

    // 대화 내용을 세션스토리지에 저장 (결과 페이지에서 사용)
    const conversationData = {
      photoId: currentPhoto.id,
      photoData: currentPhoto,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      })),
    };

    sessionStorage.setItem('reminiscence-result', JSON.stringify(conversationData));
    router.push('/training/reminiscence/result');
  }, [currentPhoto, messages, router]);

  // 사진이 없는 경우
  if (!photoId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-6">📷</div>
          <h2 className="text-xl font-bold mb-2">
            사진을 선택해주세요
          </h2>
          <p className="text-muted-foreground mb-6">
            회상 대화를 시작하려면 먼저 사진을 선택해야 합니다.
          </p>
          <Button variant="primary" onClick={() => router.push('/photos')}>
            사진 선택하러 가기
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="w-9 h-9 rounded-lg bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] flex items-center justify-center transition-colors"
                aria-label="뒤로 가기"
              >
                <svg className="w-5 h-5 text-[var(--neutral-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold">회상 대화</h1>
                <p className="text-sm text-muted-foreground">
                  사진을 보며 추억을 이야기해보세요
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleNewConversation}>
                새 대화
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                홈으로
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 에러 메시지 */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/photos')}
              className="ml-4"
            >
              사진 관리로 이동
            </Button>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 사진 영역 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 현재 사진 */}
            {currentPhoto && (
              <Card className="p-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-4">
                  <Image
                    src={currentPhoto.fileUrl}
                    alt={currentPhoto.fileName}
                    fill
                    className="object-cover"
                  />
                  {currentPhoto.isDummy && (
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      더미 데이터
                    </div>
                  )}
                </div>

                {/* 사진 정보 */}
                <div className="space-y-2">
                  {currentPhoto.takenDate && (
                    <p className="text-sm font-medium">
                      📅 {formatPhotoDate(currentPhoto.takenDate)}
                    </p>
                  )}
                  {currentPhoto.category && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getCategoryColor(currentPhoto.category) }}
                    >
                      {getCategoryIcon(currentPhoto.category)}
                      {getCategoryLabel(currentPhoto.category)}
                    </span>
                  )}
                </div>

                {/* 사진 변경 버튼 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePhotoChange}
                  className="w-full mt-4"
                >
                  다른 사진 선택
                </Button>
              </Card>
            )}

            {/* 같은 날 다른 사진 */}
            {sameDatePhotos.length > 0 && (
              <Card className="p-4">
                <h3 className="text-sm font-medium mb-3">같은 날 다른 사진</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {sameDatePhotos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => handlePhotoSelect(photo)}
                      className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                    >
                      <Image
                        src={photo.fileUrl}
                        alt={photo.fileName}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* 관련 사진 */}
            {relatedPhotos.length > 0 && (
              <Card className="p-4">
                <h3 className="text-sm font-medium mb-3">
                  {currentPhoto?.category && getCategoryIcon(currentPhoto.category)} 관련 사진
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {relatedPhotos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => handlePhotoSelect(photo)}
                      className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                    >
                      <Image
                        src={photo.fileUrl}
                        alt={photo.fileName}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* 오른쪽: 채팅 영역 */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-250px)] flex flex-col overflow-hidden">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                disabled={!isInitialized || !!error}
                placeholder="사진에 대해 이야기해주세요..."
              />

              {/* 힌트 질문 */}
              {hintQuestion && (
                <div className="border-t p-3 bg-muted/50">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>💡</span>
                    <span>힌트가 필요하시면 클릭하세요</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showHint ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showHint && (
                    <p className="mt-2 text-sm p-2 bg-primary/10 rounded-lg text-primary">
                      {hintQuestion}
                    </p>
                  )}
                </div>
              )}
            </Card>

            {/* 대화 완료 버튼 */}
            {messages.length >= 4 && (
              <div className="mt-6 p-4 bg-white rounded-xl border border-[var(--neutral-200)]">
                <Button
                  variant="primary"
                  className="w-full"
                  size="lg"
                  onClick={handleCompleteConversation}
                >
                  대화 완료하고 그림일기 만들기
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 대화 진행률 표시 */}
      {messages.length > 0 && messages.length < 6 && (
        <div className="fixed bottom-4 right-4 bg-card rounded-xl shadow-lg p-4 border max-w-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">💬</span>
            </div>
            <div>
              <p className="text-sm font-medium">대화 진행 중</p>
              <p className="text-xs text-muted-foreground">
                {messages.length}/6 메시지 ({Math.round((messages.length / 6) * 100)}%)
              </p>
            </div>
          </div>
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min((messages.length / 6) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReminiscencePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      }
    >
      <ReminiscenceContent />
    </Suspense>
  );
}
