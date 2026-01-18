'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';

interface VoiceDemoProps {
  onClose: () => void;
}

const DEMO_SENTENCES = [
  {
    id: 1,
    type: 'read',
    text: '오늘 날씨가 참 좋습니다.',
    hint: '천천히 또박또박 읽어보세요',
  },
  {
    id: 2,
    type: 'repeat',
    text: '사과, 바나나, 포도',
    hint: '단어를 순서대로 따라 말해보세요',
  },
  {
    id: 3,
    type: 'read',
    text: '건강한 하루 되세요.',
    hint: '자연스럽게 읽어보세요',
  },
];

const TYPE_LABELS: Record<string, string> = {
  read: '문장 읽기',
  repeat: '단어 따라하기',
};

export default function VoiceDemo({ onClose }: VoiceDemoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 5) {
            setIsRecording(false);
            setCompleted([...completed, true]);
            if (currentIndex < DEMO_SENTENCES.length - 1) {
              setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
                setRecordingTime(0);
              }, 500);
            } else {
              setTimeout(() => setShowResult(true), 500);
            }
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, currentIndex, completed]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setCompleted([...completed, true]);
    if (currentIndex < DEMO_SENTENCES.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setRecordingTime(0);
      }, 500);
    } else {
      setTimeout(() => setShowResult(true), 500);
    }
  };

  const sentence = DEMO_SENTENCES[currentIndex];

  if (showResult) {
    return (
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🎤</span>
          </div>
          <h3 className="text-2xl font-bold text-[var(--neutral-800)] mb-2">완료!</h3>
          <p className="text-[var(--neutral-600)]">
            {DEMO_SENTENCES.length}개 문장을 모두 연습했습니다
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {DEMO_SENTENCES.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-xl bg-[var(--success-light)]"
            >
              <p className="text-xs text-[var(--neutral-500)] mb-1">
                {TYPE_LABELS[s.type]}
              </p>
              <p className="text-sm font-medium">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-[var(--neutral-100)] rounded-xl p-4 mb-6">
          <p className="text-sm text-[var(--neutral-600)]">
            실제 음성 훈련에서는 AI가 발음 정확도와 유창성을 분석하여 피드백을 제공합니다.
          </p>
        </div>

        <Button variant="primary" className="w-full" onClick={onClose}>
          닫기
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 진행률 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-[var(--neutral-500)] mb-2">
          <span className="px-2 py-1 bg-pink-100 text-pink-600 rounded-full text-xs">
            {TYPE_LABELS[sentence.type]}
          </span>
          <span>{currentIndex + 1}/{DEMO_SENTENCES.length}</span>
        </div>
        <div className="h-2 bg-[var(--neutral-200)] rounded-full overflow-hidden">
          <div
            className="h-full bg-pink-500 transition-all"
            style={{ width: `${((currentIndex + 1) / DEMO_SENTENCES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 문장 표시 */}
      <div className="mb-8 text-center">
        <div className="bg-pink-50 rounded-2xl p-8 mb-4">
          <p className="text-2xl font-bold text-[var(--neutral-800)] leading-relaxed">
            {sentence.text}
          </p>
        </div>
        <p className="text-sm text-[var(--neutral-500)]">{sentence.hint}</p>
      </div>

      {/* 녹음 버튼 */}
      <div className="flex flex-col items-center gap-4">
        {isRecording ? (
          <>
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </div>
            <p className="text-lg font-semibold text-red-500">녹음 중... {recordingTime}초</p>
            <Button variant="outline" onClick={handleStopRecording}>
              녹음 완료
            </Button>
          </>
        ) : (
          <>
            <button
              onClick={handleStartRecording}
              className="w-24 h-24 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
            <p className="text-sm text-[var(--neutral-500)]">버튼을 눌러 녹음을 시작하세요</p>
          </>
        )}
      </div>

      <p className="text-xs text-center text-[var(--neutral-400)] mt-6">
        * 체험 모드에서는 실제 녹음이 되지 않습니다
      </p>
    </div>
  );
}
