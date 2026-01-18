'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSpeechRecognition, calculateSimilarity } from '@/hooks/useSpeechRecognition';
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
  maxAttempts: number;
  successThreshold: number; // 성공 기준 유사도 (%)
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
    maxAttempts: 3,
    successThreshold: 70,
  },
  {
    id: 'read-2',
    type: 'read',
    title: '문장 읽기',
    instruction: '다음 문장을 또렷하게 읽어주세요.',
    targetText: '가족과 함께하는 시간은 소중합니다.',
    hint: '천천히, 또렷하게 읽어주세요.',
    difficulty: 1,
    maxAttempts: 3,
    successThreshold: 70,
  },
  {
    id: 'repeat-1',
    type: 'repeat',
    title: '단어 따라하기',
    instruction: '다음 단어들을 기억하고 따라 말해주세요.',
    targetText: '사과, 의자, 시계',
    hint: '세 단어를 순서대로 말해주세요.',
    difficulty: 2,
    maxAttempts: 3,
    successThreshold: 60,
  },
  {
    id: 'repeat-2',
    type: 'repeat',
    title: '단어 따라하기',
    instruction: '다음 단어들을 기억하고 따라 말해주세요.',
    targetText: '바다, 산, 강, 하늘, 꽃',
    hint: '기억나는 단어를 모두 말해주세요.',
    difficulty: 2,
    maxAttempts: 3,
    successThreshold: 50,
  },
  {
    id: 'describe-1',
    type: 'describe',
    title: '상황 설명하기',
    instruction: '오늘 아침에 무엇을 드셨나요? 자유롭게 말씀해주세요.',
    hint: '드신 음식이나 상황을 편하게 말씀해주세요.',
    difficulty: 3,
    maxAttempts: 1,
    successThreshold: 0, // 자유 발화는 유사도 검사 안함
  },
  {
    id: 'free-1',
    type: 'free',
    title: '자유 발화',
    instruction: '가장 좋아하는 계절과 그 이유를 말씀해주세요.',
    hint: '생각나는 대로 편하게 말씀해주세요.',
    difficulty: 3,
    maxAttempts: 1,
    successThreshold: 0,
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
  const [showResult, setShowResult] = useState(false);

  // 과제별 상태
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [currentSimilarity, setCurrentSimilarity] = useState<number | null>(null);
  const [attemptStatus, setAttemptStatus] = useState<'idle' | 'listening' | 'success' | 'fail'>('idle');
  const [displayedText, setDisplayedText] = useState('');
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

  // 타이머 참조
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevIsListeningRef = useRef<boolean>(false);
  const handleNextRef = useRef<(score?: number) => void>(() => {});

  // 현재 난이도에 맞는 과제 필터링
  const filteredExercises = voiceExercises.filter(e => e.difficulty <= initialDifficulty + 1);
  const currentExercise = filteredExercises[currentExerciseIndex];

  // 음성 인식 훅
  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'ko-KR',
    continuous: false,
    interimResults: true,
  });

  // 타이머 정리
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
      if (retryCountdownTimerRef.current) {
        clearInterval(retryCountdownTimerRef.current);
      }
    };
  }, []);

  // 재시도 카운트다운 처리
  useEffect(() => {
    if (retryCountdown === null) return;

    if (retryCountdown > 0) {
      retryCountdownTimerRef.current = setTimeout(() => {
        setRetryCountdown(retryCountdown - 1);
      }, 1000);
    } else {
      // 카운트다운 완료 - 자동으로 다시 시작
      setRetryCountdown(null);
      setCurrentAttempt(prev => prev + 1);
      resetTranscript();
      setDisplayedText('');
      setCurrentSimilarity(null);
      setAttemptStatus('listening');
      startListening();
    }

    return () => {
      if (retryCountdownTimerRef.current) {
        clearTimeout(retryCountdownTimerRef.current);
      }
    };
  }, [retryCountdown, resetTranscript, startListening]);

  // 실시간 텍스트 표시 업데이트
  useEffect(() => {
    const fullText = transcript + interimTranscript;
    setDisplayedText(fullText);
  }, [transcript, interimTranscript]);

  // 인식 완료 시 유사도 계산 (isListening이 true → false로 전환될 때만)
  useEffect(() => {
    const wasListening = prevIsListeningRef.current;
    prevIsListeningRef.current = isListening;

    // isListening이 true에서 false로 전환되고, attemptStatus가 listening일 때만 처리
    if (wasListening && !isListening && attemptStatus === 'listening') {
      // transcript가 비어있으면 idle로 복귀
      if (!transcript) {
        setAttemptStatus('idle');
        return;
      }

      const targetText = currentExercise?.targetText;

      if (targetText) {
        const similarity = calculateSimilarity(transcript, targetText);
        setCurrentSimilarity(similarity);

        if (similarity >= currentExercise.successThreshold) {
          setAttemptStatus('success');
          // 2초 후 자동으로 다음으로 이동
          autoAdvanceTimerRef.current = setTimeout(() => {
            handleNextRef.current(similarity);
          }, 2000);
        } else if (currentAttempt >= currentExercise.maxAttempts) {
          setAttemptStatus('fail');
          // 2초 후 자동으로 다음으로 이동
          autoAdvanceTimerRef.current = setTimeout(() => {
            handleNextRef.current(similarity);
          }, 2000);
        } else {
          // 실패했지만 재시도 가능 - 다시 시작 버튼 표시
          setAttemptStatus('fail');
        }
      } else {
        // 자유 발화는 무조건 성공
        setAttemptStatus('success');
        setCurrentSimilarity(100);
        autoAdvanceTimerRef.current = setTimeout(() => {
          handleNextRef.current(100);
        }, 2000);
      }
    }
  }, [isListening, transcript, attemptStatus, currentExercise, currentAttempt]);

  // 음성 인식 시작
  const handleStartListening = useCallback((isRetry: boolean = false) => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
    if (retryCountdownTimerRef.current) {
      clearTimeout(retryCountdownTimerRef.current);
    }
    setRetryCountdown(null);

    // 재시도인 경우 시도 횟수 증가
    if (isRetry) {
      setCurrentAttempt(prev => prev + 1);
    }

    resetTranscript();
    setDisplayedText('');
    setCurrentSimilarity(null);
    setAttemptStatus('listening');
    startListening();
  }, [resetTranscript, startListening]);

  // 음성 인식 중지
  const handleStopListening = useCallback(() => {
    stopListening();
    // transcript가 비어있으면 idle 상태로 복귀
    if (!transcript && !interimTranscript) {
      setAttemptStatus('idle');
    }
  }, [stopListening, transcript, interimTranscript]);

  // 다시 시도
  const handleRetry = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
    if (retryCountdownTimerRef.current) {
      clearTimeout(retryCountdownTimerRef.current);
    }
    setRetryCountdown(null);
    setCurrentAttempt(prev => prev + 1);
    resetTranscript();
    setDisplayedText('');
    setCurrentSimilarity(null);
    setAttemptStatus('idle');
  }, [resetTranscript]);

  // 다음 과제로 이동
  const handleNext = useCallback((score: number = currentSimilarity || 0) => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
    if (retryCountdownTimerRef.current) {
      clearTimeout(retryCountdownTimerRef.current);
    }
    setRetryCountdown(null);

    if (!currentExercise) return;

    setTotalScore(prev => prev + score);
    setCompletedExercises(prev => [...prev, currentExercise.id]);

    if (currentExerciseIndex < filteredExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentAttempt(1);
      setCurrentSimilarity(null);
      setAttemptStatus('idle');
      resetTranscript();
      setDisplayedText('');
    } else {
      setShowResult(true);
      if (onComplete) {
        const avgScore = Math.round((totalScore + score) / (completedExercises.length + 1));
        onComplete(avgScore, completedExercises.length + 1);
      }
    }
  }, [currentExercise, currentExerciseIndex, filteredExercises.length, totalScore, completedExercises, currentSimilarity, resetTranscript, onComplete]);

  // handleNextRef 업데이트
  handleNextRef.current = handleNext;

  // 지원하지 않는 브라우저
  if (!isSupported) {
    return (
      <div className="p-6 bg-red-50 rounded-xl border-2 border-red-200 text-center">
        <span className="text-4xl mb-2 block">🚫</span>
        <p className="text-red-700 font-medium">
          이 브라우저는 음성 인식을 지원하지 않습니다.
        </p>
        <p className="text-red-600 text-sm mt-1">
          Chrome 또는 Edge 브라우저를 사용해주세요.
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
            setCurrentAttempt(1);
            setCurrentSimilarity(null);
            setAttemptStatus('idle');
            setRetryCountdown(null);
            resetTranscript();
            setDisplayedText('');
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

  // 유사도에 따른 색상
  const getSimilarityColor = (similarity: number | null) => {
    if (similarity === null) return 'text-[var(--neutral-500)]';
    if (similarity >= 70) return 'text-green-600';
    if (similarity >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

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
          <p className="text-2xl text-[var(--primary-deep)] font-medium p-4 bg-blue-50 rounded-xl break-words">
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

      {/* 실시간 인식 UI */}
      <div className="p-6 bg-[var(--neutral-50)] rounded-xl border-2 border-[var(--neutral-200)]">
        {/* 상태 표시 */}
        <div className="text-center mb-6">
          <div
            className={`
              inline-flex items-center justify-center w-24 h-24 rounded-full mb-4
              transition-all duration-300
              ${isListening
                ? 'bg-red-100 animate-pulse'
                : attemptStatus === 'success'
                  ? 'bg-green-100'
                  : attemptStatus === 'fail'
                    ? 'bg-yellow-100'
                    : 'bg-[var(--neutral-200)]'}
            `}
          >
            {isListening ? (
              <span className="text-5xl">🎙️</span>
            ) : attemptStatus === 'success' ? (
              <span className="text-5xl">✅</span>
            ) : attemptStatus === 'fail' ? (
              <span className="text-5xl">🔄</span>
            ) : (
              <span className="text-5xl">🎤</span>
            )}
          </div>

          {/* 시도 횟수 */}
          {currentExercise.maxAttempts > 1 && (
            <div className="text-sm text-[var(--neutral-500)] mb-2">
              시도: {currentAttempt} / {currentExercise.maxAttempts}
            </div>
          )}

          {/* 상태 메시지 */}
          <div className="text-lg font-medium text-[var(--neutral-700)]">
            {isListening ? (
              <span className="text-red-500 animate-pulse">듣고 있어요...</span>
            ) : attemptStatus === 'success' ? (
              <span className="text-green-600">성공!</span>
            ) : attemptStatus === 'fail' && currentAttempt >= currentExercise.maxAttempts ? (
              <span className="text-yellow-600">다음으로 넘어갑니다</span>
            ) : attemptStatus === 'fail' ? (
              <span className="text-yellow-600">아래 버튼을 눌러 다시 시도해보세요</span>
            ) : (
              <span>아래 버튼을 눌러 시작하세요</span>
            )}
          </div>
        </div>

        {/* 실시간 타이핑 영역 */}
        <div className="min-h-[80px] p-4 bg-white rounded-xl border-2 border-[var(--neutral-200)] mb-4">
          <p className="text-lg text-[var(--neutral-700)] break-words">
            {displayedText || (
              <span className="text-[var(--neutral-400)] italic">
                여기에 음성이 텍스트로 표시됩니다...
              </span>
            )}
            {isListening && <span className="animate-pulse">|</span>}
          </p>
        </div>

        {/* 유사도 표시 */}
        {currentSimilarity !== null && currentExercise.targetText && (
          <div className={`text-center mb-4 text-xl font-bold ${getSimilarityColor(currentSimilarity)}`}>
            일치율: {currentSimilarity}%
            {currentSimilarity >= currentExercise.successThreshold ? (
              <span className="ml-2">🎉</span>
            ) : null}
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="flex justify-center gap-3">
          {/* 대기 상태 - 시작하기 버튼 */}
          {attemptStatus === 'idle' && (
            <button
              onClick={() => handleStartListening()}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg
                bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)]
                transition-all duration-200 active:scale-95"
            >
              <span className="text-xl">🎤</span>
              시작하기
            </button>
          )}

          {/* 듣는 중 - 인식 중지 버튼 */}
          {isListening && (
            <button
              onClick={handleStopListening}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg
                bg-red-500 text-white hover:bg-red-600
                transition-all duration-200 active:scale-95"
            >
              <span className="w-4 h-4 bg-white rounded-sm"></span>
              인식 중지
            </button>
          )}

          {/* 실패 + 재시도 가능 - 다시 시작 버튼 */}
          {attemptStatus === 'fail' && currentAttempt < currentExercise.maxAttempts && !isListening && (
            <button
              onClick={() => handleStartListening(true)}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg
                bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)]
                transition-all duration-200 active:scale-95"
            >
              <span className="text-xl">🔄</span>
              다시 시작
            </button>
          )}

          {/* 성공 또는 최대 시도 횟수 도달 - 다음 버튼 */}
          {(attemptStatus === 'success' || (attemptStatus === 'fail' && currentAttempt >= currentExercise.maxAttempts)) && !isListening && (
            <button
              onClick={() => handleNext()}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg
                bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)]
                transition-all duration-200 active:scale-95"
            >
              {currentExerciseIndex < filteredExercises.length - 1 ? '다음 과제' : '완료'}
            </button>
          )}
        </div>
      </div>

      {/* 힌트 */}
      {currentExercise.hint && (
        <p className="text-sm text-[var(--neutral-500)] text-center">{currentExercise.hint}</p>
      )}
    </div>
  );
}
