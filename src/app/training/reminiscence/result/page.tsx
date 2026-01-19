/**
 * 그림일기 결과 페이지
 * 회상 대화 완료 후 스케치북 스타일로 결과 표시
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SketchbookFrame, DiaryEntry } from '@/components/reminiscence';
import { Button, Card } from '@/components/ui';
import {
  type DiaryImageStyle,
  type GeneratedImage,
  DEFAULT_DIARY_STYLE,
} from '@/lib/ai/imageGeneration';
import { formatPhotoDate } from '@/lib/utils/photoUtils';
import type { PhotoData } from '@/components/photos/PhotoCard';

interface ConversationData {
  photoId: string;
  photoData: PhotoData;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
}

export default function ReminiscenceResultPage() {
  const router = useRouter();

  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  // 스타일은 색연필 스케치로 고정
  const selectedStyle: DiaryImageStyle = DEFAULT_DIARY_STYLE;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageProgress, setImageProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // 세션 스토리지에서 대화 데이터 로드 및 그림일기 생성
  useEffect(() => {
    const loadConversationData = async () => {
      try {
        setImageProgress(0);
        setProgressMessage('대화 데이터 불러오는 중...');

        const stored = sessionStorage.getItem('reminiscence-result');
        if (!stored) {
          setError('대화 데이터를 찾을 수 없습니다.');
          return;
        }

        setImageProgress(20);
        const data: ConversationData = JSON.parse(stored);
        setConversationData(data);

        // API를 통해 그림일기 생성 (서버에서 AI 이미지 생성)
        setProgressMessage('AI가 대화를 분석하고 있어요...');
        setImageProgress(40);

        const response = await fetch('/api/reminiscence/diary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoData: data.photoData,
            messages: data.messages,
            style: selectedStyle,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate diary');
        }

        setImageProgress(60);
        setProgressMessage('그림일기를 그리고 있어요...');

        const result = await response.json();

        if (result.success) {
          setSummary(result.summary);
          setGeneratedImage(result.image);
          console.log('Diary generated successfully, isPlaceholder:', result.image?.isPlaceholder);
        } else {
          throw new Error(result.error || 'Unknown error');
        }

        setImageProgress(100);
        setProgressMessage('완료!');
      } catch (err) {
        console.error('Failed to load conversation data:', err);
        setError('결과를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 1회만 실행

  // 저장 기능 (TODO: 실제 저장 로직)
  const handleSave = useCallback(() => {
    // TODO: 실제 저장 로직 구현
    alert('저장 기능은 추후 구현 예정입니다.');
  }, []);

  // 공유 기능 (TODO: 실제 공유 로직)
  const handleShare = useCallback(() => {
    // TODO: 실제 공유 로직 구현
    if (navigator.share) {
      navigator.share({
        title: '오늘의 회상 그림일기',
        text: summary,
      });
    } else {
      alert('공유 기능은 추후 구현 예정입니다.');
    }
  }, [summary]);

  // 새 대화 시작
  const handleNewConversation = useCallback(() => {
    sessionStorage.removeItem('reminiscence-result');
    router.push('/photos');
  }, [router]);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
          <div className="text-6xl mb-4 animate-bounce">🎨</div>
          <p className="text-lg text-amber-800 mb-4">{progressMessage || '그림일기를 만들고 있어요...'}</p>

          {/* 진행률 바 */}
          <div className="w-full h-3 bg-amber-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${imageProgress}%` }}
            />
          </div>
          <p className="text-sm text-amber-600">{imageProgress}%</p>
        </div>
      </div>
    );
  }

  // 에러
  if (error || !conversationData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">😢</div>
          <h2 className="text-xl font-bold mb-2">
            {error || '대화 데이터를 찾을 수 없습니다'}
          </h2>
          <p className="text-muted-foreground mb-6">
            회상 대화를 먼저 완료해주세요.
          </p>
          <Button variant="primary" onClick={() => router.push('/photos')}>
            사진 선택하러 가기
          </Button>
        </Card>
      </div>
    );
  }

  const photoData = conversationData.photoData;
  const date = photoData.takenDate
    ? formatPhotoDate(photoData.takenDate)
    : new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">📖 오늘의 회상 그림일기</h1>
              <p className="text-sm text-muted-foreground">{date}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              홈으로
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 스케치북 프레임 */}
        <SketchbookFrame variant="cream" className="mb-8">
          <DiaryEntry
            photoData={photoData}
            generatedImageUrl={generatedImage?.url}
            summary={summary}
            date={date}
            selectedStyle={selectedStyle}
            isPlaceholder={generatedImage?.isPlaceholder ?? true}
          />
        </SketchbookFrame>

        {/* 대화 내용 미리보기 */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-medium mb-4">💬 오늘의 대화</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {conversationData.messages
              .filter(m => m.role !== 'system')
              .map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary/10 ml-8'
                      : 'bg-muted mr-8'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">
                      {msg.role === 'user' ? '👤' : '🤖'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {msg.role === 'user' ? '나' : 'AI 상담사'}
                    </span>
                  </div>
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))}
          </div>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            variant="primary"
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            💾 저장하기
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            📤 공유하기
          </Button>
          <Button
            variant="outline"
            onClick={handleNewConversation}
            className="flex items-center gap-2"
          >
            🔄 새 대화 시작
          </Button>
        </div>

        {/* 안내 메시지 */}
        {generatedImage?.isPlaceholder && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              💡 현재는 원본 사진이 표시됩니다.
              <br />
              <span className="text-xs">
                AI 이미지 생성을 위해 GEMINI_API_KEY가 필요합니다.
              </span>
            </p>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>리메모리 - 소중한 추억을 함께 나누는 공간</p>
      </footer>
    </div>
  );
}
