'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePoseDetection, type Keypoint } from '@/hooks/usePoseDetection';
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

// MoveNet 키포인트 인덱스 상수
const KEYPOINT_IDX = {
  nose: 0,
  left_eye: 1,
  right_eye: 2,
  left_ear: 3,
  right_ear: 4,
  left_shoulder: 5,
  right_shoulder: 6,
  left_elbow: 7,
  right_elbow: 8,
  left_wrist: 9,
  right_wrist: 10,
  left_hip: 11,
  right_hip: 12,
  left_knee: 13,
  right_knee: 14,
  left_ankle: 15,
  right_ankle: 16,
};

// 실시간 피드백 메시지 타입
export interface PoseFeedback {
  message: string;
  type: 'success' | 'warning' | 'info';
  score: number;
}

// 두 키포인트 간 거리 계산
function getDistance(kp1: Keypoint, kp2: Keypoint): number {
  return Math.sqrt(Math.pow(kp1.x - kp2.x, 2) + Math.pow(kp1.y - kp2.y, 2));
}

// 키포인트 유효성 확인
function isValidKeypoint(kp: Keypoint | undefined, minScore = 0.3): kp is Keypoint {
  return !!kp && (kp.score || 0) >= minScore;
}

// 평균 감지 신뢰도 계산
function getAverageConfidence(keypoints: Keypoint[]): number {
  if (keypoints.length === 0) return 0;
  return keypoints.reduce((sum, kp) => sum + (kp.score || 0), 0) / keypoints.length;
}

// ===== 동작별 평가 함수들 =====

// 왼손 들기 평가
function evaluateHandRaiseLeft(keypoints: Keypoint[]): { score: number; feedback: PoseFeedback } {
  const leftShoulder = keypoints[KEYPOINT_IDX.left_shoulder];
  const leftWrist = keypoints[KEYPOINT_IDX.left_wrist];
  const leftElbow = keypoints[KEYPOINT_IDX.left_elbow];
  const nose = keypoints[KEYPOINT_IDX.nose];

  if (!isValidKeypoint(leftShoulder) || !isValidKeypoint(leftWrist)) {
    return { score: 0, feedback: { message: '왼팔이 보이지 않습니다', type: 'warning', score: 0 } };
  }

  // 손목이 어깨보다 위에 있는지 확인
  const isAboveShoulder = leftWrist.y < leftShoulder.y;

  if (!isAboveShoulder) {
    return { score: 25, feedback: { message: '왼손을 더 높이 들어주세요', type: 'warning', score: 25 } };
  }

  // 손목이 머리(코) 위에 있는지 확인
  const isAboveHead = isValidKeypoint(nose) && leftWrist.y < nose.y;

  // 팔 펴짐 정도 확인 (어깨-팔꿈치-손목이 일직선에 가까운지)
  let armExtension = 0.8;
  if (isValidKeypoint(leftElbow)) {
    const shoulderToElbow = getDistance(leftShoulder, leftElbow);
    const elbowToWrist = getDistance(leftElbow, leftWrist);
    const shoulderToWrist = getDistance(leftShoulder, leftWrist);
    // 삼각형 부등식을 이용한 직선 정도 계산
    armExtension = shoulderToWrist / (shoulderToElbow + elbowToWrist + 0.01);
  }

  // 높이에 따른 점수 계산
  const heightDiff = leftShoulder.y - leftWrist.y;
  const heightScore = Math.min(heightDiff / 150, 1) * 40; // 최대 40점

  let score = 40 + heightScore + armExtension * 20; // 기본 40 + 높이 40 + 팔펴짐 20

  if (isAboveHead) {
    score = Math.min(score + 10, 100);
    return { score: Math.round(score), feedback: { message: '아주 잘하고 있어요!', type: 'success', score: Math.round(score) } };
  }

  return { score: Math.round(score), feedback: { message: '좋아요! 조금 더 높이 들어보세요', type: 'info', score: Math.round(score) } };
}

// 오른손 들기 평가
function evaluateHandRaiseRight(keypoints: Keypoint[]): { score: number; feedback: PoseFeedback } {
  const rightShoulder = keypoints[KEYPOINT_IDX.right_shoulder];
  const rightWrist = keypoints[KEYPOINT_IDX.right_wrist];
  const rightElbow = keypoints[KEYPOINT_IDX.right_elbow];
  const nose = keypoints[KEYPOINT_IDX.nose];

  if (!isValidKeypoint(rightShoulder) || !isValidKeypoint(rightWrist)) {
    return { score: 0, feedback: { message: '오른팔이 보이지 않습니다', type: 'warning', score: 0 } };
  }

  const isAboveShoulder = rightWrist.y < rightShoulder.y;

  if (!isAboveShoulder) {
    return { score: 25, feedback: { message: '오른손을 더 높이 들어주세요', type: 'warning', score: 25 } };
  }

  const isAboveHead = isValidKeypoint(nose) && rightWrist.y < nose.y;

  let armExtension = 0.8;
  if (isValidKeypoint(rightElbow)) {
    const shoulderToElbow = getDistance(rightShoulder, rightElbow);
    const elbowToWrist = getDistance(rightElbow, rightWrist);
    const shoulderToWrist = getDistance(rightShoulder, rightWrist);
    armExtension = shoulderToWrist / (shoulderToElbow + elbowToWrist + 0.01);
  }

  const heightDiff = rightShoulder.y - rightWrist.y;
  const heightScore = Math.min(heightDiff / 150, 1) * 40;

  let score = 40 + heightScore + armExtension * 20;

  if (isAboveHead) {
    score = Math.min(score + 10, 100);
    return { score: Math.round(score), feedback: { message: '아주 잘하고 있어요!', type: 'success', score: Math.round(score) } };
  }

  return { score: Math.round(score), feedback: { message: '좋아요! 조금 더 높이 들어보세요', type: 'info', score: Math.round(score) } };
}

// 양손 들기 평가
function evaluateHandRaiseBoth(keypoints: Keypoint[]): { score: number; feedback: PoseFeedback } {
  const leftResult = evaluateHandRaiseLeft(keypoints);
  const rightResult = evaluateHandRaiseRight(keypoints);

  // 양손 모두 제대로 들어야 함
  const avgScore = (leftResult.score + rightResult.score) / 2;

  if (leftResult.score < 40 && rightResult.score < 40) {
    return { score: Math.round(avgScore), feedback: { message: '양손을 머리 위로 들어주세요', type: 'warning', score: Math.round(avgScore) } };
  }

  if (leftResult.score < 40) {
    return { score: Math.round(avgScore), feedback: { message: '왼손을 더 높이 들어주세요', type: 'info', score: Math.round(avgScore) } };
  }

  if (rightResult.score < 40) {
    return { score: Math.round(avgScore), feedback: { message: '오른손을 더 높이 들어주세요', type: 'info', score: Math.round(avgScore) } };
  }

  if (avgScore >= 80) {
    return { score: Math.round(avgScore), feedback: { message: '완벽해요!', type: 'success', score: Math.round(avgScore) } };
  }

  return { score: Math.round(avgScore), feedback: { message: '좋아요! 팔을 더 쭉 펴보세요', type: 'info', score: Math.round(avgScore) } };
}

// 팔 벌리기 평가 (T자 포즈)
function evaluateArmsSpread(keypoints: Keypoint[]): { score: number; feedback: PoseFeedback } {
  const leftShoulder = keypoints[KEYPOINT_IDX.left_shoulder];
  const rightShoulder = keypoints[KEYPOINT_IDX.right_shoulder];
  const leftWrist = keypoints[KEYPOINT_IDX.left_wrist];
  const rightWrist = keypoints[KEYPOINT_IDX.right_wrist];

  if (!isValidKeypoint(leftShoulder) || !isValidKeypoint(rightShoulder) ||
      !isValidKeypoint(leftWrist) || !isValidKeypoint(rightWrist)) {
    return { score: 0, feedback: { message: '양팔이 보이지 않습니다', type: 'warning', score: 0 } };
  }

  // 손목이 어깨와 비슷한 높이에 있는지 확인 (T자 포즈)
  const leftHeightDiff = Math.abs(leftWrist.y - leftShoulder.y);
  const rightHeightDiff = Math.abs(rightWrist.y - rightShoulder.y);
  const avgHeightDiff = (leftHeightDiff + rightHeightDiff) / 2;

  // 손목이 어깨 바깥쪽에 있는지 확인
  const leftSpread = leftWrist.x < leftShoulder.x; // 카메라 기준 왼손은 왼쪽에
  const rightSpread = rightWrist.x > rightShoulder.x; // 오른손은 오른쪽에

  if (!leftSpread || !rightSpread) {
    return { score: 30, feedback: { message: '팔을 옆으로 더 벌려주세요', type: 'warning', score: 30 } };
  }

  // 어깨와 손목 사이 거리 (넓게 벌릴수록 높은 점수)
  const leftSpreadDistance = Math.abs(leftWrist.x - leftShoulder.x);
  const rightSpreadDistance = Math.abs(rightWrist.x - rightShoulder.x);
  const avgSpreadDistance = (leftSpreadDistance + rightSpreadDistance) / 2;

  // 수평 정도 점수 (높이 차이가 작을수록 좋음)
  const horizontalScore = Math.max(0, 1 - avgHeightDiff / 100) * 30;

  // 벌림 정도 점수
  const spreadScore = Math.min(avgSpreadDistance / 150, 1) * 40;

  const score = 30 + horizontalScore + spreadScore;

  if (avgHeightDiff > 50) {
    return { score: Math.round(score), feedback: { message: '팔을 어깨 높이로 맞춰주세요', type: 'info', score: Math.round(score) } };
  }

  if (score >= 80) {
    return { score: Math.round(score), feedback: { message: 'T자 포즈 완벽해요!', type: 'success', score: Math.round(score) } };
  }

  return { score: Math.round(score), feedback: { message: '좋아요! 팔을 더 넓게 벌려보세요', type: 'info', score: Math.round(score) } };
}

// 손 흔들기 평가 (손목의 움직임 감지)
function evaluateWaveHand(
  keypoints: Keypoint[],
  waveHistory: { x: number; timestamp: number }[]
): { score: number; feedback: PoseFeedback } {
  const rightWrist = keypoints[KEYPOINT_IDX.right_wrist];
  const rightShoulder = keypoints[KEYPOINT_IDX.right_shoulder];

  if (!isValidKeypoint(rightWrist) || !isValidKeypoint(rightShoulder)) {
    return { score: 0, feedback: { message: '오른손이 보이지 않습니다', type: 'warning', score: 0 } };
  }

  // 손목이 어깨 높이 이상에 있는지
  const isRaised = rightWrist.y < rightShoulder.y + 50;

  if (!isRaised) {
    return { score: 20, feedback: { message: '손을 어깨 높이로 들어주세요', type: 'warning', score: 20 } };
  }

  // 흔들기 동작 분석 (x 좌표 변화)
  if (waveHistory.length < 3) {
    return { score: 40, feedback: { message: '손을 좌우로 흔들어주세요', type: 'info', score: 40 } };
  }

  // x 좌표 변화량 계산
  let totalMovement = 0;
  let directionChanges = 0;
  let prevDirection = 0;

  for (let i = 1; i < waveHistory.length; i++) {
    const diff = waveHistory[i].x - waveHistory[i - 1].x;
    totalMovement += Math.abs(diff);

    const currentDirection = Math.sign(diff);
    if (currentDirection !== 0 && currentDirection !== prevDirection && prevDirection !== 0) {
      directionChanges++;
    }
    if (currentDirection !== 0) prevDirection = currentDirection;
  }

  // 방향 전환이 많을수록, 움직임이 클수록 높은 점수
  const movementScore = Math.min(totalMovement / 200, 1) * 30;
  const waveScore = Math.min(directionChanges / 4, 1) * 30;

  const score = 40 + movementScore + waveScore;

  if (directionChanges >= 3) {
    return { score: Math.round(score), feedback: { message: '손 흔들기 잘하고 있어요!', type: 'success', score: Math.round(score) } };
  }

  return { score: Math.round(score), feedback: { message: '손을 더 크게 흔들어주세요', type: 'info', score: Math.round(score) } };
}

// 박수 평가 (양손 거리 변화)
function evaluateClapHands(
  keypoints: Keypoint[],
  clapHistory: { distance: number; timestamp: number }[]
): { score: number; feedback: PoseFeedback } {
  const leftWrist = keypoints[KEYPOINT_IDX.left_wrist];
  const rightWrist = keypoints[KEYPOINT_IDX.right_wrist];

  if (!isValidKeypoint(leftWrist) || !isValidKeypoint(rightWrist)) {
    return { score: 0, feedback: { message: '양손이 보이지 않습니다', type: 'warning', score: 0 } };
  }

  if (clapHistory.length < 5) {
    return { score: 30, feedback: { message: '박수를 쳐주세요', type: 'info', score: 30 } };
  }

  // 가까워졌다 멀어지는 패턴 감지 (박수)
  let clapCount = 0;
  let wasClose = false;
  const closeThreshold = 80;
  const farThreshold = 150;

  for (const record of clapHistory) {
    if (record.distance < closeThreshold && !wasClose) {
      wasClose = true;
    } else if (record.distance > farThreshold && wasClose) {
      clapCount++;
      wasClose = false;
    }
  }

  const score = 30 + Math.min(clapCount / 3, 1) * 70;

  if (clapCount >= 3) {
    return { score: Math.round(score), feedback: { message: '박수 잘 쳤어요!', type: 'success', score: Math.round(score) } };
  }

  if (clapCount >= 1) {
    return { score: Math.round(score), feedback: { message: '좋아요! 박수를 더 쳐주세요', type: 'info', score: Math.round(score) } };
  }

  return { score: Math.round(score), feedback: { message: '양손을 모았다 벌렸다 해주세요', type: 'info', score: Math.round(score) } };
}

// 엄지 척 평가 (손목 위치와 자세)
function evaluateThumbsUp(keypoints: Keypoint[]): { score: number; feedback: PoseFeedback } {
  const rightWrist = keypoints[KEYPOINT_IDX.right_wrist];
  const rightElbow = keypoints[KEYPOINT_IDX.right_elbow];
  const rightShoulder = keypoints[KEYPOINT_IDX.right_shoulder];

  if (!isValidKeypoint(rightWrist) || !isValidKeypoint(rightShoulder)) {
    return { score: 0, feedback: { message: '오른손이 보이지 않습니다', type: 'warning', score: 0 } };
  }

  // 팔꿈치가 구부러지고 손목이 어깨 앞쪽에 있는지 확인
  const isInFront = rightWrist.y < rightShoulder.y + 100;

  if (!isInFront) {
    return { score: 30, feedback: { message: '주먹을 앞으로 내밀어주세요', type: 'warning', score: 30 } };
  }

  // 팔꿈치 구부림 각도 확인
  let elbowBend = 0.7;
  if (isValidKeypoint(rightElbow)) {
    const shoulderToElbow = getDistance(rightShoulder, rightElbow);
    const elbowToWrist = getDistance(rightElbow, rightWrist);
    const shoulderToWrist = getDistance(rightShoulder, rightWrist);

    // 직선일수록 1에 가까움, 구부러질수록 낮아짐
    const straightness = shoulderToWrist / (shoulderToElbow + elbowToWrist + 0.01);
    elbowBend = 1 - straightness; // 구부러짐 정도
  }

  // 엄지 척 자세는 팔이 약간 구부러진 상태가 자연스러움
  const bendScore = elbowBend > 0.2 ? 40 : 20;
  const positionScore = 30;

  const score = 30 + bendScore + positionScore;

  if (score >= 80) {
    return { score: Math.round(score), feedback: { message: '엄지 척!', type: 'success', score: Math.round(score) } };
  }

  return { score: Math.round(score), feedback: { message: '좋아요! 엄지를 위로 올려주세요', type: 'info', score: Math.round(score) } };
}

// 일반 자세 평가 (포즈 감지만 확인)
function evaluateGeneralPose(keypoints: Keypoint[]): { score: number; feedback: PoseFeedback } {
  const avgConfidence = getAverageConfidence(keypoints);
  const validKeypointCount = keypoints.filter(kp => isValidKeypoint(kp)).length;

  if (validKeypointCount < 5) {
    return { score: 20, feedback: { message: '카메라에 더 가까이 와주세요', type: 'warning', score: 20 } };
  }

  const score = 50 + avgConfidence * 50;

  if (avgConfidence > 0.7) {
    return { score: Math.round(score), feedback: { message: '자세가 잘 인식되고 있어요', type: 'success', score: Math.round(score) } };
  }

  return { score: Math.round(score), feedback: { message: '자세를 유지해주세요', type: 'info', score: Math.round(score) } };
}

// 실제 동작 점수 계산 함수
function calculatePoseMatchScore(
  guide: PoseGuide,
  duration: number,
  keypoints: Keypoint[],
  waveHistory: { x: number; timestamp: number }[],
  clapHistory: { distance: number; timestamp: number }[]
): { score: number; feedback: PoseFeedback } {
  // 키포인트가 없거나 불충분하면 낮은 점수
  if (!keypoints || keypoints.length === 0) {
    return { score: 0, feedback: { message: '카메라에서 사람이 감지되지 않습니다', type: 'warning', score: 0 } };
  }

  const avgConfidence = getAverageConfidence(keypoints);
  if (avgConfidence < 0.2) {
    return { score: 0, feedback: { message: '자세 인식이 불확실합니다. 조명을 확인해주세요', type: 'warning', score: 0 } };
  }

  // 동작별 평가
  let result: { score: number; feedback: PoseFeedback };

  switch (guide.id) {
    case 'hand_raise_left':
      result = evaluateHandRaiseLeft(keypoints);
      break;
    case 'hand_raise_right':
      result = evaluateHandRaiseRight(keypoints);
      break;
    case 'hand_raise_both':
      result = evaluateHandRaiseBoth(keypoints);
      break;
    case 'arms_spread':
      result = evaluateArmsSpread(keypoints);
      break;
    case 'wave_hand':
      result = evaluateWaveHand(keypoints, waveHistory);
      break;
    case 'clap_hands':
      result = evaluateClapHands(keypoints, clapHistory);
      break;
    case 'thumbs_up':
      result = evaluateThumbsUp(keypoints);
      break;
    // 얼굴 표정 동작은 포즈 감지로 평가하기 어려우므로 일반 평가
    case 'smile':
    case 'close_eyes':
    case 'open_mouth':
      result = evaluateGeneralPose(keypoints);
      break;
    default:
      result = evaluateGeneralPose(keypoints);
  }

  // 지속 시간 보너스 (최대 10점)
  const durationBonus = Math.min(duration / guide.targetDuration, 1) * 10;
  const finalScore = Math.min(Math.round(result.score + durationBonus), 100);

  return {
    score: finalScore,
    feedback: { ...result.feedback, score: finalScore }
  };
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
  const [currentFeedback, setCurrentFeedback] = useState<PoseFeedback | null>(null);
  const [realtimeScore, setRealtimeScore] = useState<number>(0);

  // 훈련할 동작들 선택 (랜덤하게 섞어서 지정된 개수만큼)
  const [selectedMovements] = useState<MovementType[]>(() => {
    const shuffled = [...trainingMovements].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, exerciseCount);
  });

  const currentMovement = selectedMovements[currentIndex];
  const guide = poseGuides[currentMovement];

  const matchStartTimeRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 동적 동작 추적용 히스토리 (손 흔들기, 박수)
  const waveHistoryRef = useRef<{ x: number; timestamp: number }[]>([]);
  const clapHistoryRef = useRef<{ distance: number; timestamp: number }[]>([]);

  const {
    isLoading,
    keypoints,
    videoRef,
    canvasRef,
    startDetection,
    stopDetection,
  } = usePoseDetection({
    enabled: true,
    detectionInterval: 100, // 더 빠른 감지를 위해 100ms
  });

  // 인식된 키포인트 수 계산
  const detectedKeypointsCount = keypoints.filter(kp => (kp.score || 0) > 0.3).length;

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

      // 동적 동작 히스토리 업데이트
      if (keypoints.length > 0) {
        const rightWrist = keypoints[KEYPOINT_IDX.right_wrist];
        const leftWrist = keypoints[KEYPOINT_IDX.left_wrist];

        // 손 흔들기 히스토리 (오른손 x좌표)
        if (rightWrist && (rightWrist.score || 0) > 0.3) {
          waveHistoryRef.current.push({ x: rightWrist.x, timestamp: Date.now() });
          // 최근 30개만 유지
          if (waveHistoryRef.current.length > 30) {
            waveHistoryRef.current = waveHistoryRef.current.slice(-30);
          }
        }

        // 박수 히스토리 (양손 거리)
        if (leftWrist && rightWrist &&
            (leftWrist.score || 0) > 0.3 && (rightWrist.score || 0) > 0.3) {
          const distance = getDistance(leftWrist, rightWrist);
          clapHistoryRef.current.push({ distance, timestamp: Date.now() });
          // 최근 30개만 유지
          if (clapHistoryRef.current.length > 30) {
            clapHistoryRef.current = clapHistoryRef.current.slice(-30);
          }
        }
      }

      // 실시간 점수 및 피드백 계산
      const { score, feedback } = calculatePoseMatchScore(
        guide,
        elapsed,
        keypoints,
        waveHistoryRef.current,
        clapHistoryRef.current
      );
      setRealtimeScore(score);
      setCurrentFeedback(feedback);

      // 목표 시간 달성
      if (elapsed >= guide.targetDuration) {
        // 최종 점수는 실시간으로 계산된 점수 사용
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
  }, [phase, guide, stopDetection, keypoints]);

  // 시작 버튼 클릭
  const handleStart = useCallback(async () => {
    setCameraError(null);
    // 히스토리 초기화
    waveHistoryRef.current = [];
    clapHistoryRef.current = [];
    setCurrentFeedback(null);
    setRealtimeScore(0);

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
      setCurrentFeedback(null);
      setRealtimeScore(0);
      matchStartTimeRef.current = null;
      // 히스토리 초기화
      waveHistoryRef.current = [];
      clapHistoryRef.current = [];
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
    setCurrentFeedback(null);
    setRealtimeScore(0);
    matchStartTimeRef.current = null;
    // 히스토리 초기화
    waveHistoryRef.current = [];
    clapHistoryRef.current = [];
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
    setCurrentFeedback(null);
    setRealtimeScore(0);
    setShowFinalResult(false);
    matchStartTimeRef.current = null;
    // 히스토리 초기화
    waveHistoryRef.current = [];
    clapHistoryRef.current = [];
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

        {/* 카메라 피드 컨테이너 - 비디오 요소를 항상 DOM에 유지하여 스트림 할당 가능하게 함 */}
        <div
          className={`space-y-4 transition-opacity duration-200 ${
            phase === 'countdown' || phase === 'active'
              ? 'opacity-100'
              : 'opacity-0 pointer-events-none'
          }`}
          style={{
            // ready/result 상태에서는 화면 밖으로 이동하되 크기는 유지 (비디오 스트림 작동 보장)
            ...(phase === 'ready' || phase === 'result' ? {
              position: 'fixed',
              left: '-9999px',
              top: '-9999px',
            } : {})
          }}
        >
          <div className="relative aspect-video bg-[var(--neutral-200)] rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
              style={{ filter: 'none' }}
            />
            {/* 스켈레톤 오버레이 캔버스 */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: 'scaleX(1)' }}
            />
            {/* 카운트다운 오버레이 */}
            {phase === 'countdown' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                <p className="text-white/80 mb-2">준비하세요!</p>
                <div className="text-8xl font-bold text-white animate-pulse">
                  {countdown}
                </div>
              </div>
            )}
            {/* active 상태 테두리 및 안내 */}
            {phase === 'active' && (
              <>
                <div className="absolute inset-0 pointer-events-none border-4 border-[var(--primary)] rounded-xl" />
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  동작을 유지하세요
                </div>
                {/* 인식 상태 표시 */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${detectedKeypointsCount > 10 ? 'bg-green-400 animate-pulse' : detectedKeypointsCount > 5 ? 'bg-yellow-400' : 'bg-red-400'}`} />
                  <span>
                    {detectedKeypointsCount > 10 ? '인식 중' : detectedKeypointsCount > 5 ? '일부 인식' : '인식 대기'}
                  </span>
                </div>
                {/* 감지된 키포인트 수 */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                  관절 감지: {detectedKeypointsCount}/17
                </div>
              </>
            )}
          </div>

          {/* 진행 바 - active 상태에서만 표시 */}
          {phase === 'active' && (
            <div className="space-y-3">
              {/* 실시간 점수 표시 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--neutral-600)]">현재 점수</span>
                <span className={`text-2xl font-bold ${getScoreColor(realtimeScore)}`}>
                  {realtimeScore}점
                </span>
              </div>

              {/* 실시간 피드백 메시지 */}
              {currentFeedback && (
                <div
                  className={`p-3 rounded-xl text-center font-medium transition-all duration-200 ${
                    currentFeedback.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : currentFeedback.type === 'warning'
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {currentFeedback.message}
                </div>
              )}

              {/* 진행도 바 */}
              <div className="space-y-1">
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
        </div>

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
