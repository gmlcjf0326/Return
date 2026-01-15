'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatInterface, PhotoContext } from '@/components/reminiscence';
import type { ChatMessage } from '@/components/reminiscence';
import { usePhotoStore } from '@/store/photoStore';
import { useSessionStore } from '@/store/sessionStore';
import { Button, Card } from '@/components/ui';
import type { PhotoData } from '@/components/photos/PhotoCard';

function ReminiscenceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const photoId = searchParams.get('photoId');

  const { session, initSession } = useSessionStore();
  const sessionId = session?.id;
  const { photos, getPhotoById } = usePhotoStore();

  const [currentPhoto, setCurrentPhoto] = useState<PhotoData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 세션 확인
  useEffect(() => {
    initSession();
  }, [initSession]);

  // 사진 로드
  useEffect(() => {
    if (photoId) {
      const photo = getPhotoById(photoId);
      if (photo) {
        setCurrentPhoto(photo);
      }
    }
  }, [photoId, getPhotoById]);

  // 회상 세션 초기화
  useEffect(() => {
    const initializeSession = async () => {
      if (!currentPhoto || !sessionId || isInitialized) return;
      if (!currentPhoto.isAnalyzed) {
        setError('사진이 아직 분석되지 않았습니다. 먼저 사진을 분석해주세요.');
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/reminiscence/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoId: currentPhoto.id,
            sessionId,
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
      } catch (err) {
        console.error('Failed to send message:', err);
        // 에러 메시지 표시
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

  // 사진 변경
  const handlePhotoChange = useCallback(() => {
    router.push('/photos');
  }, [router]);

  // 새 대화 시작
  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setIsInitialized(false);
  }, []);

  // 사진이 없는 경우
  if (!photoId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <svg
            className="mx-auto h-16 w-16 text-slate-300 mb-6"
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
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            사진을 선택해주세요
          </h2>
          <p className="text-slate-500 mb-6">
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
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-1"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                뒤로
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">회상 대화</h1>
                <p className="text-sm text-slate-500">
                  사진을 보며 추억을 이야기해보세요
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewConversation}
              >
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
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* 왼쪽: 사진 컨텍스트 */}
          <div className="lg:col-span-1">
            <PhotoContext
              photo={currentPhoto}
              onPhotoChange={handlePhotoChange}
              className="h-full"
            />
          </div>

          {/* 오른쪽: 채팅 영역 */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col overflow-hidden">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                disabled={!isInitialized || !!error}
                placeholder="사진에 대해 이야기해주세요..."
              />
            </Card>
          </div>
        </div>
      </main>

      {/* 도움말 팁 */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-white rounded-xl shadow-lg p-4 max-w-xs border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">대화 팁</p>
              <p className="text-xs text-slate-500 mt-1">
                사진 속 인물, 장소, 그때의 감정 등 자유롭게 이야기해보세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReminiscencePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">로딩 중...</p>
          </div>
        </div>
      }
    >
      <ReminiscenceContent />
    </Suspense>
  );
}
