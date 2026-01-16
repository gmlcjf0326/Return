'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAudioRecording, formatRecordingDuration, type RecordingResult } from '@/hooks/useAudioRecording';
import Button from '@/components/ui/Button';

// 음성 훈련 과제 타입
interface VoiceExercise {
  id: string;
  type: 'read' | 'repeat' | 'describe' | 'free';
  title: string;
  instruction: string;
  targetText?: string;
  hint?: string;
  difficulty: 1 | 2 | 3;
  maxDuration: number;
}

// 음성 훈련 과제 목록
const voiceExercises: VoiceExercise[] = [
  {
    id: 'read-1',
    type: 'read',
    title: '문장 읽기',
    instruction: '다음 문장을 또렷하게 읽어주세요.',
    targetText: '오늘 날씨가 참 좋습니다.',
    hint: '천천히, 또렷하게 읽어주세요.',
    difficulty: 1,
    maxDuration: 30,
  },
  {
    id: 'read-2',
    type: 'read',
    title: '문장 읽기',
    instruction: '다음 문장을 또렷하게 읽어주세요.',
    targetText: '가족과 함께하는 시간은 소중합니다.',
    hint: '천천히, 또렷하게 읽어주세요.',
    difficulty: 1,
    maxDuration: 30,
  },
  {
    id: 'repeat-1',
    type: 'repeat',
    title: '단어 따라하기',
    instruction: '다음 단어들을 기억하고 따라 말해주세요.',
    targetText: '사과, 의자, 시계',
    hint: '세 단어를 순서대로 말해주세요.',
    difficulty: 2,
    maxDuration: 30,
  },
  {
    id: 'repeat-2',
    type: 'repeat',
    title: '단어 따라하기',
    instruction: '다음 단어들을 기억하고 따라 말해주세요.',
    targetText: '바다, 산, 강, 하늘, 꽃',
    hint: '기억나는 단어를 모두 말해주세요.',
    difficulty: 2,
    maxDuration: 45,
  },
  {
    id: 'describe-1',
    type: 'describe',
    title: '상황 설명하기',
    instruction: '오늘 아침에 무엇을 드셨나요? 자유롭게 말씀해주세요.',
    hint: '드신 음식이나 상황을 편하게 말씀해주세요.',
    difficulty: 3,
    maxDuration: 60,
  },
  {
    id: 'free-1',
    type: 'free',
    title: '자유 발화',
    instruction: '가장 좋아하는 계절과 그 이유를 말씀해주세요.',
    hint: '생각나는 대로 편하게 말씀해주세요.',
    difficulty: 3,
    maxDuration: 60,
  },
];

interface VoiceTrainingProps {
  onComplete?: (score: number, exerciseCount: number) => void;
  initialDifficulty?: 1 | 2 | 3;
}

export default function VoiceTraining({
  onComplete,
  initialDifficulty = 1,
}: VoiceTrainingProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [showResult, setShowResult] = useState(false);

  // 현재 난이도에 맞는 과제 필터링
  const filteredExercises = voiceExercises.filter(e => e.difficulty <= initialDifficulty + 1);
  const currentExercise = filteredExercises[currentExerciseIndex];

  const {
    isSupported,
    state,
    duration,
    recording,
    error,
    startRecording,
    stopRecording,
    clearRecording,
  } = useAudioRecording({
    maxDuration: currentExercise?.maxDuration ? currentExercise.maxDuration * 1000 : 60000,
    onMaxDurationReached: () => {
      stopRecording();
    },
  });

  // 녹음 시작/중지 토글
  const handleToggleRecording = useCallback(async () => {
    if (state === 'recording') {
      await stopRecording();
    } else {
      if (recording) {
        clearRecording();
      }
      await startRecording();
    }
  }, [state, recording, startRecording, stopRecording, clearRecording]);

  // 다시 녹음
  const handleRetry = useCallback(() => {
    clearRecording();
  }, [clearRecording]);

  // 오디오 재생
  const handlePlay = useCallback(() => {
    const audioUrl = recording?.url;
    if (!audioUrl) return;

    if (isPlaying && audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.onended = () => {
      setIsPlaying(false);
      setAudioElement(null);
    };
    audio.play();
    setAudioElement(audio);
    setIsPlaying(true);
  }, [recording, isPlaying, audioElement]);

  // 다음 과제로 이동
  const handleNext = useCallback(() => {
    if (!currentExercise) return;

    // 점수 계산 (시뮬레이션 - 실제로는 AI 분석 필요)
    const exerciseScore = 70 + Math.floor(Math.random() * 30);
    setTotalScore(prev => prev + exerciseScore);
    setCompletedExercises(prev => [...prev, currentExercise.id]);

    if (currentExerciseIndex < filteredExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      clearRecording();
    } else {
      setShowResult(true);
      if (onComplete) {
        const avgScore = Math.round((totalScore + exerciseScore) / (completedExercises.length + 1));
        onComplete(avgScore, completedExercises.length + 1);
      }
    }
  }, [currentExercise, currentExerciseIndex, filteredExercises.length, totalScore, completedExercises, clearRecording, onComplete]);

  // 컴포넌트 언마운트 시 오디오 정리
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioElement]);

  // 지원하지 않는 브라우저
  if (!isSupported) {
    return (
      <div className="p-6 bg-red-50 rounded-xl border-2 border-red-200 text-center">
        <span className="text-4xl mb-2 block">🚫</span>
        <p className="text-red-700 font-medium">
          이 브라우저는 오디오 녹음을 지원하지 않습니다.
        </p>
        <p className="text-red-600 text-sm mt-1">
          Chrome, Edge, Safari 등 최신 브라우저를 사용해주세요.
        </p>
      </div>
    );
  }

  // 결과 화면
  if (showResult) {
    const avgScore = Math.round(totalScore / completedExercises.length);
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <span className="text-6xl mb-4 block">🎤</span>
          <h2 className="text-2xl font-bold text-[var(--neutral-800)] mb-2">
            음성 훈련 완료!
          </h2>
          <div className="text-5xl font-bold text-[var(--primary)] mb-4">
            {avgScore}점
          </div>
          <p className="text-[var(--neutral-600)]">
            총 {completedExercises.length}개 과제를 완료했습니다.
          </p>
        </div>

        <Button
          onClick={() => {
            setCurrentExerciseIndex(0);
            setCompletedExercises([]);
            setTotalScore(0);
            setShowResult(false);
            clearRecording();
          }}
          fullWidth
          size="lg"
        >
          다시 훈련하기
        </Button>
      </div>
    );
  }

  if (!currentExercise) {
    return null;
  }

  const hasRecording = recording;

  return (
    <div className="space-y-6">
      {/* 진행 상황 */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[var(--neutral-500)]">
          {currentExerciseIndex + 1} / {filteredExercises.length}
        </span>
        <div className="flex gap-1">
          {filteredExercises.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full ${
                idx < currentExerciseIndex
                  ? 'bg-[var(--primary)]'
                  : idx === currentExerciseIndex
                  ? 'bg-[var(--primary-light)]'
                  : 'bg-[var(--neutral-200)]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 과제 정보 */}
      <div className="text-center mb-6">
        <span className="inline-block px-3 py-1 bg-[var(--primary-lighter)] text-[var(--primary)] rounded-full text-sm font-medium mb-3">
          {currentExercise.title}
        </span>
        <h3 className="text-xl font-bold text-[var(--neutral-800)] mb-2">
          {currentExercise.instruction}
        </h3>
        {currentExercise.targetText && (
          <p className="text-2xl text-[var(--primary-deep)] font-medium p-4 bg-blue-50 rounded-xl">
            "{currentExercise.targetText}"
          </p>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* 녹음 UI */}
      <div className="p-6 bg-[var(--neutral-50)] rounded-xl border-2 border-[var(--neutral-200)]">
        <div className="text-center mb-6">
          <div
            className={`
              inline-flex items-center justify-center w-24 h-24 rounded-full mb-4
              transition-all duration-300
              ${state === 'recording' ? 'bg-red-100 animate-pulse' : hasRecording ? 'bg-green-100' : 'bg-[var(--neutral-200)]'}
            `}
          >
            {state === 'recording' ? (
              <span className="text-5xl">🎙️</span>
            ) : hasRecording ? (
              <span className="text-5xl">✅</span>
            ) : (
              <span className="text-5xl">🎤</span>
            )}
          </div>

          <div className="text-2xl font-mono font-bold text-[var(--neutral-700)]">
            {formatRecordingDuration(state === 'recording' ? duration : recording?.duration || 0)}
            {state === 'recording' && (
              <span className="text-red-500 ml-2 animate-pulse">REC</span>
            )}
          </div>

          <div className="text-sm text-[var(--neutral-500)] mt-1">
            최대 {currentExercise.maxDuration}초
          </div>
        </div>

        {state === 'recording' && (
          <div className="h-2 bg-[var(--neutral-200)] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-red-500 transition-all duration-100"
              style={{ width: `${Math.min((duration / (currentExercise.maxDuration * 1000)) * 100, 100)}%` }}
            />
          </div>
        )}

        <div className="flex justify-center gap-3">
          {!hasRecording || state === 'recording' ? (
            <button
              onClick={handleToggleRecording}
              className={`
                flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg
                transition-all duration-200 active:scale-95
                ${state === 'recording'
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
                }
              `}
            >
              {state === 'recording' ? (
                <>
                  <span className="w-4 h-4 bg-white rounded-sm"></span>
                  녹음 중지
                </>
              ) : (
                <>
                  <span className="text-xl">🎤</span>
                  녹음 시작
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 px-6 py-4 rounded-xl font-medium text-lg
                  border-2 border-[var(--primary)] text-[var(--primary)]
                  hover:bg-[var(--primary-lighter)] transition-all duration-200 active:scale-95"
              >
                <span className="text-xl">{isPlaying ? '⏸️' : '▶️'}</span>
                {isPlaying ? '일시정지' : '재생'}
              </button>

              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-6 py-4 rounded-xl font-medium text-lg
                  border-2 border-[var(--neutral-300)] text-[var(--neutral-600)]
                  hover:bg-[var(--neutral-100)] transition-all duration-200 active:scale-95"
              >
                <span className="text-xl">🔄</span>
                다시 녹음
              </button>
            </>
          )}
        </div>
      </div>

      {/* 힌트 */}
      {currentExercise.hint && (
        <p className="text-sm text-[var(--neutral-500)] text-center">{currentExercise.hint}</p>
      )}

      {/* 다음 버튼 */}
      <Button
        onClick={handleNext}
        disabled={!hasRecording || state === 'recording'}
        size="lg"
        fullWidth
      >
        {currentExerciseIndex < filteredExercises.length - 1 ? '다음 과제' : '훈련 완료'}
      </Button>
    </div>
  );
}
