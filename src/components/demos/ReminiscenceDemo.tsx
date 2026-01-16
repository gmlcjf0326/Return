'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

const DEMO_CONVERSATION: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: '안녕하세요! 이 사진을 함께 보면서 이야기를 나눠볼까요? 이 사진은 언제 찍은 건가요?',
  },
  {
    id: '2',
    role: 'user',
    content: '아, 이건 작년 가을에 찍은 사진이에요. 단풍 구경 갔을 때요.',
  },
  {
    id: '3',
    role: 'assistant',
    content: '단풍 구경이요! 정말 좋은 추억이네요. 누구와 함께 가셨나요?',
  },
  {
    id: '4',
    role: 'user',
    content: '가족들이랑 같이 갔어요. 아이들이 정말 좋아했어요.',
  },
  {
    id: '5',
    role: 'assistant',
    content: '가족들과 함께한 시간이었군요! 그 날 가장 기억에 남는 순간은 무엇이었나요?',
  },
];

interface ReminiscenceDemoProps {
  onClose: () => void;
}

export default function ReminiscenceDemo({ onClose }: ReminiscenceDemoProps) {
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < DEMO_CONVERSATION.length && !showComplete) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setDisplayedMessages((prev) => [...prev, DEMO_CONVERSATION[currentIndex]]);
        setIsTyping(false);
        setCurrentIndex((prev) => prev + 1);
      }, 1500);

      return () => clearTimeout(timer);
    } else if (currentIndex >= DEMO_CONVERSATION.length) {
      setShowComplete(true);
    }
  }, [currentIndex, showComplete]);

  const handleSkip = () => {
    setDisplayedMessages(DEMO_CONVERSATION);
    setCurrentIndex(DEMO_CONVERSATION.length);
    setShowComplete(true);
  };

  if (showComplete) {
    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💬</span>
          </div>
          <h3 className="text-xl font-bold text-[var(--neutral-800)] mb-2">
            회상 대화 체험 완료!
          </h3>
          <p className="text-sm text-[var(--neutral-600)]">
            이렇게 사진을 보면서 추억을 나누며 기억력을 자극합니다
          </p>
        </div>

        <div className="bg-[var(--neutral-100)] rounded-xl p-4 mb-6">
          <h4 className="font-medium text-[var(--neutral-700)] mb-2">회상치료의 효과</h4>
          <ul className="text-sm text-[var(--neutral-600)] space-y-1">
            <li>장기 기억 활성화</li>
            <li>정서적 안정감 제공</li>
            <li>의사소통 능력 향상</li>
            <li>자아 정체성 강화</li>
          </ul>
        </div>

        <Button variant="primary" className="w-full" onClick={onClose}>
          닫기
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 사진 미리보기 */}
      <div className="mb-4">
        <div className="relative aspect-video bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl overflow-hidden flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl">🍂</span>
            <p className="text-sm text-amber-700 mt-2">단풍 사진 예시</p>
          </div>
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
            데모 이미지
          </div>
        </div>
      </div>

      {/* 대화 영역 */}
      <div className="h-64 overflow-y-auto space-y-3 mb-4 p-2">
        {displayedMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-[var(--primary)] text-white rounded-br-sm'
                  : 'bg-[var(--neutral-100)] text-[var(--neutral-700)] rounded-bl-sm'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[var(--neutral-100)] text-[var(--neutral-700)] p-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[var(--neutral-400)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[var(--neutral-400)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[var(--neutral-400)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={handleSkip}>
          건너뛰기
        </Button>
        <Button variant="ghost" className="flex-1" onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
}
