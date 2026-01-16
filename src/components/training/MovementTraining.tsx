'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { poseGuides, type MovementType, type PoseGuide } from '@/data/pose-guides';
import Button from '@/components/ui/Button';

// 훈련용 동작 목록 (쉬운 것부터)
const trainingMovements: MovementType[] = [
  'smile',
  'thumbs_up',
  'wave_hand',
  'hand_raise_right',
  'hand_raise_left',
  'hand_raise_both',
  'arms_spread',
  'close_eyes',
  'open_mouth',
  'clap_hands',
];

// 동작 일치도 계산 (시뮬레이션)
function calculatePoseMatchScore(
  guide: PoseGuide,
  duration: number
): number {
  // 실제 구현에서는 TensorFlow.js pose-detection 결과와 비교
  // 여기서는 시뮬레이션으로 랜덤 점수 생성
  const baseScore = 60 + Math.random() * 40;
  const durationBonus = Math.min(duration / guide.targetDuration, 1) * 10;
  return Math.min(Math.round(baseScore + durationBonus), 100);
}

interface MovementTrainingProps {
  onComplete?: (avgScore: number, completedCount: number) => void;
  exerciseCount?: number;
}

export default function MovementTraining({
  onComplete,
  exerciseCount = 5,
}: MovementTrainingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'countdown' | 'active' | 'result'>('ready');
  const [countdown, setCountdown] = useState(3);
  const [matchProgress, setMatchProgress] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // 훈련할 동작들 선택 (랜덤하게 섞어서 지정된 개수만큼)
  const [selectedMovements] = useState<MovementType[]>(() => {
    const shuffled = [...trainingMovements].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, exerciseCount);
  });

  const currentMovement = selectedMovements[currentIndex];
  const guide = poseGuides[currentMovement];

  const matchStartTimeRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isLoading,
    isActive,
    currentPosture,
    videoRef,
    startDetection,
    stopDetection,
  } = usePoseDetection({
    enabled: true,
    detectionInterval: 200,
  });

  // 카운트다운 처리
  useEffect(() => {
    if (phase !== 'countdown') return;

    const timer = setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1);
      } else {
        setPhase('active');
        matchStartTimeRef.current = Date.now();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, countdown]);

  // 동작 수행 중 진행 상태 업데이트
  useEffect(() => {
    if (phase !== 'active') {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return;
    }

    progressIntervalRef.current = setInterval(() => {
      if (!matchStartTimeRef.current) return;

      const elapsed = Date.now() - matchStartTimeRef.current;
      const progress = Math.min((elapsed / guide.targetDuration) * 100, 100);
      setMatchProgress(progress);

      // 목표 시간 달성
      if (elapsed >= guide.targetDuration) {
        const score = calculatePoseMatchScore(guide, elapsed);
        setCurrentScore(score);
        setScores(prev => [...prev, score]);
        setPhase('result');
        stopDetection();
      }
    }, 100);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [phase, guide, stopDetection]);

  // 시작 버튼 클릭
  const handleStart = useCallback(async () => {
    setCameraError(null);
    const success = await startDetection();
    if (success) {
      setCountdown(3);
      setPhase('countdown');
      setMatchProgress(0);
      setCurrentScore(null);
    } else {
      setCameraError('카메라에 접근할 수 없습니다. 카메라 권한을 허용해주세요.');
    }
  }, [startDetection]);

  // 다음 동작으로
  const handleNext = useCallback(() => {
    if (currentIndex < selectedMovements.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setPhase('ready');
      setMatchProgress(0);
      setCurrentScore(null);
      matchStartTimeRef.current = null;
    } else {
      // 훈련 완료
      setShowFinalResult(true);
      if (onComplete) {
        const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        onComplete(avgScore, scores.length);
      }
    }
  }, [currentIndex, selectedMovements.length, scores, onComplete]);

  // 다시 시도
  const handleRetry = useCallback(() => {
    setPhase('ready');
    setMatchProgress(0);
    setCurrentScore(null);
    matchStartTimeRef.current = null;
    // 마지막 점수 제거
    setScores(prev => prev.slice(0, -1));
  }, []);

  // 처음부터 다시
  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setPhase('ready');
    setMatchProgress(0);
    setScores([]);
    setCurrentScore(null);
    setShowFinalResult(false);
    matchStartTimeRef.current = null;
  }, []);

  // 점수에 따른 색상
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return '훌륭해요!';
    if (score >= 80) return '잘했어요!';
    if (score >= 60) return '좋아요!';
    return '다시 해볼까요?';
  };

  // 최종 결과 화면
  if (showFinalResult) {
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <span className="text-6xl mb-4 block">🤸</span>
          <h2 className="text-2xl font-bold text-[var(--neutral-800)] mb-2">
            동작 훈련 완료!
          </h2>
          <div className={`text-5xl font-bold ${getScoreColor(avgScore)} mb-4`}>
            {avgScore}점
          </div>
          <p className="text-[var(--neutral-600)]">
            총 {scores.length}개 동작을 완료했습니다.
          </p>
        </div>

        {/* 개별 점수 표시 */}
        <div className="grid grid-cols-5 gap-2">
          {scores.map((score, idx) => (
            <div
              key={idx}
              className="text-center p-3 bg-[var(--neutral-50)] rounded-lg"
            >
              <span className="text-2xl block mb-1">{poseGuides[selectedMovements[idx]].icon}</span>
              <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}점</span>
            </div>
          ))}
        </div>

        <Button onClick={handleRestart} fullWidth size="lg">
          다시 훈련하기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 진행 상황 */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[var(--neutral-500)]">
          {currentIndex + 1} / {selectedMovements.length}
        </span>
        <div className="flex gap-1">
          {selectedMovements.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full ${
                idx < currentIndex
                  ? 'bg-[var(--primary)]'
                  : idx === currentIndex
                  ? 'bg-[var(--primary-light)]'
                  : 'bg-[var(--neutral-200)]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 동작 가이드 카드 */}
      <div className="p-6 bg-[var(--neutral-50)] rounded-xl border-2 border-[var(--neutral-200)]">
        {/* 동작 아이콘 및 이름 */}
        <div className="text-center mb-4">
          <span className="text-6xl mb-2 block">{guide.icon}</span>
          <h3 className="text-2xl font-bold text-[var(--neutral-800)]">{guide.name}</h3>
          <p className="text-[var(--neutral-600)] mt-1">{guide.description}</p>
        </div>

        {/* 안내 메시지 */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-4">
          <p className="text-blue-800 text-lg text-center">{guide.instruction}</p>
        </div>

        {/* 카메라 에러 */}
        {cameraError && (
          <div className="p-4 bg-red-50 rounded-xl border border-red-200 mb-4">
            <p className="text-red-700 text-center">{cameraError}</p>
          </div>
        )}

        {/* 단계별 UI */}
        {phase === 'ready' && (
          <div className="text-center">
            <p className="text-[var(--neutral-600)] mb-4">
              카메라가 켜지면 동작을 따라해주세요
            </p>
            <button
              onClick={handleStart}
              disabled={isLoading}
              className={`
                px-8 py-4 rounded-xl font-bold text-lg
                bg-[var(--primary)] text-white
                hover:bg-[var(--primary-dark)] transition-all duration-200
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
              `}
            >
              {isLoading ? '카메라 준비 중...' : '시작하기'}
            </button>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="text-center py-8">
            <p className="text-[var(--neutral-600)] mb-4">준비하세요!</p>
            <div className="text-8xl font-bold text-[var(--primary)] animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {phase === 'active' && (
          <div className="space-y-4">
            {/* 카메라 피드 */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              <div className="absolute inset-0 pointer-events-none border-4 border-[var(--primary)] rounded-xl" />
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                동작을 유지하세요
              </div>
            </div>

            {/* 진행 바 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[var(--neutral-600)]">
                <span>진행도</span>
                <span>{Math.round(matchProgress)}%</span>
              </div>
              <div className="h-4 bg-[var(--neutral-200)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] transition-all duration-100"
                  style={{ width: `${matchProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {phase === 'result' && currentScore !== null && (
          <div className="text-center py-4">
            <div className="mb-4">
              <div className={`text-6xl font-bold ${getScoreColor(currentScore)}`}>
                {currentScore}점
              </div>
              <p className={`text-xl ${getScoreColor(currentScore)} mt-2`}>
                {getScoreLabel(currentScore)}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleRetry}
                className="px-6 py-3 rounded-xl font-medium text-lg
                  border-2 border-[var(--neutral-300)] text-[var(--neutral-600)]
                  hover:bg-[var(--neutral-100)] transition-all duration-200 active:scale-95"
              >
                다시 시도
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl font-medium text-lg
                  bg-[var(--primary)] text-white
                  hover:bg-[var(--primary-dark)] transition-all duration-200 active:scale-95"
              >
                {currentIndex < selectedMovements.length - 1 ? '다음 동작' : '완료'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
