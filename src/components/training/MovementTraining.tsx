'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePoseDetection, type Keypoint, type HandKeypoint } from '@/hooks/usePoseDetection';
import { poseGuides, type MovementType, type PoseGuide } from '@/data/pose-guides';
import Button from '@/components/ui/Button';

// 훈련용 동작 목록 (고정 자세만 - 동적 동작 제거)
const trainingMovements: MovementType[] = [
  'smile',           // 미소 짓기
  'thumbs_up',       // 엄지 척
  'hand_raise_right', // 오른손 들기
  'hand_raise_left',  // 왼손 들기
  'hand_raise_both',  // 양손 들기
  'arms_spread',      // 팔 벌리기
  'close_eyes',       // 눈 감기
  'open_mouth',       // 입 벌리기
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
  isPassed: boolean;  // 통과 여부 (점수 제거)
}

// 두 키포인트 간 거리 계산
function getDistance(kp1: Keypoint, kp2: Keypoint): number {
  return Math.sqrt(Math.pow(kp1.x - kp2.x, 2) + Math.pow(kp1.y - kp2.y, 2));
}

// 키포인트 유효성 확인
function isValidKeypoint(kp: Keypoint | undefined, minScore = 0.4): kp is Keypoint {
  return !!kp && (kp.score || 0) >= minScore;
}

// 평균 감지 신뢰도 계산
function getAverageConfidence(keypoints: Keypoint[]): number {
  if (keypoints.length === 0) return 0;
  return keypoints.reduce((sum, kp) => sum + (kp.score || 0), 0) / keypoints.length;
}

// ===== 동작별 평가 함수들 =====

// 왼손 들기 평가 (Pass/Fail: 손목이 어깨보다 위에 있으면 통과)
function evaluateHandRaiseLeft(keypoints: Keypoint[]): { isPassed: boolean; feedback: PoseFeedback } {
  const leftShoulder = keypoints[KEYPOINT_IDX.left_shoulder];
  const leftWrist = keypoints[KEYPOINT_IDX.left_wrist];

  if (!isValidKeypoint(leftShoulder) || !isValidKeypoint(leftWrist)) {
    return { isPassed: false, feedback: { message: '왼팔이 보이지 않습니다', type: 'warning', isPassed: false } };
  }

  // 통과 조건: 손목이 어깨보다 위에 있음
  const isAboveShoulder = leftWrist.y < leftShoulder.y;

  if (isAboveShoulder) {
    return { isPassed: true, feedback: { message: '잘하고 있어요!', type: 'success', isPassed: true } };
  }

  return { isPassed: false, feedback: { message: '왼손을 더 높이 들어주세요', type: 'warning', isPassed: false } };
}

// 오른손 들기 평가 (Pass/Fail: 손목이 어깨보다 위에 있으면 통과)
function evaluateHandRaiseRight(keypoints: Keypoint[]): { isPassed: boolean; feedback: PoseFeedback } {
  const rightShoulder = keypoints[KEYPOINT_IDX.right_shoulder];
  const rightWrist = keypoints[KEYPOINT_IDX.right_wrist];

  if (!isValidKeypoint(rightShoulder) || !isValidKeypoint(rightWrist)) {
    return { isPassed: false, feedback: { message: '오른팔이 보이지 않습니다', type: 'warning', isPassed: false } };
  }

  // 통과 조건: 손목이 어깨보다 위에 있음
  const isAboveShoulder = rightWrist.y < rightShoulder.y;

  if (isAboveShoulder) {
    return { isPassed: true, feedback: { message: '잘하고 있어요!', type: 'success', isPassed: true } };
  }

  return { isPassed: false, feedback: { message: '오른손을 더 높이 들어주세요', type: 'warning', isPassed: false } };
}

// 양손 들기 평가 (Pass/Fail: 양손 모두 어깨보다 위에 있으면 통과)
function evaluateHandRaiseBoth(keypoints: Keypoint[]): { isPassed: boolean; feedback: PoseFeedback } {
  const leftResult = evaluateHandRaiseLeft(keypoints);
  const rightResult = evaluateHandRaiseRight(keypoints);

  // 통과 조건: 양손 모두 통과
  if (leftResult.isPassed && rightResult.isPassed) {
    return { isPassed: true, feedback: { message: '완벽해요!', type: 'success', isPassed: true } };
  }

  if (!leftResult.isPassed && !rightResult.isPassed) {
    return { isPassed: false, feedback: { message: '양손을 머리 위로 들어주세요', type: 'warning', isPassed: false } };
  }

  if (!leftResult.isPassed) {
    return { isPassed: false, feedback: { message: '왼손을 더 높이 들어주세요', type: 'info', isPassed: false } };
  }

  return { isPassed: false, feedback: { message: '오른손을 더 높이 들어주세요', type: 'info', isPassed: false } };
}

// 팔 벌리기 평가 (Pass/Fail: 양팔이 옆으로 벌어지고 어깨 높이면 통과)
function evaluateArmsSpread(keypoints: Keypoint[]): { isPassed: boolean; feedback: PoseFeedback } {
  const leftShoulder = keypoints[KEYPOINT_IDX.left_shoulder];
  const rightShoulder = keypoints[KEYPOINT_IDX.right_shoulder];
  const leftWrist = keypoints[KEYPOINT_IDX.left_wrist];
  const rightWrist = keypoints[KEYPOINT_IDX.right_wrist];

  if (!isValidKeypoint(leftShoulder) || !isValidKeypoint(rightShoulder) ||
      !isValidKeypoint(leftWrist) || !isValidKeypoint(rightWrist)) {
    return { isPassed: false, feedback: { message: '양팔이 보이지 않습니다', type: 'warning', isPassed: false } };
  }

  // 손목이 어깨 바깥쪽에 있는지 확인
  const leftSpread = leftWrist.x < leftShoulder.x; // 카메라 기준 왼손은 왼쪽에
  const rightSpread = rightWrist.x > rightShoulder.x; // 오른손은 오른쪽에

  if (!leftSpread || !rightSpread) {
    return { isPassed: false, feedback: { message: '팔을 옆으로 더 벌려주세요', type: 'warning', isPassed: false } };
  }

  // 손목이 어깨와 비슷한 높이에 있는지 확인 (T자 포즈) - 여유 있게 80px
  const leftHeightDiff = Math.abs(leftWrist.y - leftShoulder.y);
  const rightHeightDiff = Math.abs(rightWrist.y - rightShoulder.y);
  const avgHeightDiff = (leftHeightDiff + rightHeightDiff) / 2;

  if (avgHeightDiff > 80) {
    return { isPassed: false, feedback: { message: '팔을 어깨 높이로 맞춰주세요', type: 'info', isPassed: false } };
  }

  // 통과 조건: 양팔 벌어지고 어깨 높이 유지
  return { isPassed: true, feedback: { message: 'T자 포즈 완벽해요!', type: 'success', isPassed: true } };
}

// 손 흔들기 평가 (Pass/Fail: 손목 방향 전환 2회 이상이면 통과)
function evaluateWaveHand(
  keypoints: Keypoint[],
  waveHistory: { x: number; timestamp: number }[]
): { isPassed: boolean; feedback: PoseFeedback } {
  const rightWrist = keypoints[KEYPOINT_IDX.right_wrist];
  const rightShoulder = keypoints[KEYPOINT_IDX.right_shoulder];

  if (!isValidKeypoint(rightWrist) || !isValidKeypoint(rightShoulder)) {
    return { isPassed: false, feedback: { message: '오른손이 보이지 않습니다', type: 'warning', isPassed: false } };
  }

  // 손목이 어깨 높이 이상에 있는지
  const isRaised = rightWrist.y < rightShoulder.y + 50;

  if (!isRaised) {
    return { isPassed: false, feedback: { message: '손을 어깨 높이로 들어주세요', type: 'warning', isPassed: false } };
  }

  // 흔들기 동작 분석 (x 좌표 변화)
  if (waveHistory.length < 3) {
    return { isPassed: false, feedback: { message: '손을 좌우로 흔들어주세요', type: 'info', isPassed: false } };
  }

  // x 좌표 방향 전환 횟수 계산
  let directionChanges = 0;
  let prevDirection = 0;

  for (let i = 1; i < waveHistory.length; i++) {
    const diff = waveHistory[i].x - waveHistory[i - 1].x;
    const currentDirection = Math.sign(diff);
    if (currentDirection !== 0 && currentDirection !== prevDirection && prevDirection !== 0) {
      directionChanges++;
    }
    if (currentDirection !== 0) prevDirection = currentDirection;
  }

  // 통과 조건: 방향 전환 2회 이상
  if (directionChanges >= 2) {
    return { isPassed: true, feedback: { message: '손 흔들기 잘하고 있어요!', type: 'success', isPassed: true } };
  }

  return { isPassed: false, feedback: { message: '손을 더 크게 흔들어주세요', type: 'info', isPassed: false } };
}

// 박수 평가 (Pass/Fail: 양손 가까워졌다 멀어지기 1회 이상이면 통과)
function evaluateClapHands(
  keypoints: Keypoint[],
  clapHistory: { distance: number; timestamp: number }[]
): { isPassed: boolean; feedback: PoseFeedback } {
  const leftWrist = keypoints[KEYPOINT_IDX.left_wrist];
  const rightWrist = keypoints[KEYPOINT_IDX.right_wrist];

  if (!isValidKeypoint(leftWrist) || !isValidKeypoint(rightWrist)) {
    return { isPassed: false, feedback: { message: '양손이 보이지 않습니다', type: 'warning', isPassed: false } };
  }

  if (clapHistory.length < 5) {
    return { isPassed: false, feedback: { message: '박수를 쳐주세요', type: 'info', isPassed: false } };
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

  // 통과 조건: 박수 1회 이상
  if (clapCount >= 1) {
    return { isPassed: true, feedback: { message: '박수 잘 쳤어요!', type: 'success', isPassed: true } };
  }

  return { isPassed: false, feedback: { message: '양손을 모았다 벌렸다 해주세요', type: 'info', isPassed: false } };
}

// 엄지 척 평가 (Pass/Fail: 손목이 어깨 앞쪽에 있고 팔꿈치가 구부러지면 통과)
function evaluateThumbsUp(keypoints: Keypoint[]): { isPassed: boolean; feedback: PoseFeedback } {
  const rightWrist = keypoints[KEYPOINT_IDX.right_wrist];
  const rightElbow = keypoints[KEYPOINT_IDX.right_elbow];
  const rightShoulder = keypoints[KEYPOINT_IDX.right_shoulder];

  if (!isValidKeypoint(rightWrist) || !isValidKeypoint(rightShoulder)) {
    return { isPassed: false, feedback: { message: '오른손이 보이지 않습니다', type: 'warning', isPassed: false } };
  }

  // 팔꿈치가 구부러지고 손목이 어깨 앞쪽에 있는지 확인
  const isInFront = rightWrist.y < rightShoulder.y + 100;

  if (!isInFront) {
    return { isPassed: false, feedback: { message: '주먹을 앞으로 내밀어주세요', type: 'warning', isPassed: false } };
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

  // 통과 조건: 팔이 약간 구부러진 상태
  if (elbowBend > 0.15) {
    return { isPassed: true, feedback: { message: '엄지 척!', type: 'success', isPassed: true } };
  }

  return { isPassed: false, feedback: { message: '좋아요! 엄지를 위로 올려주세요', type: 'info', isPassed: false } };
}

// 일반 자세 평가 (Pass/Fail: 키포인트 감지 신뢰도 0.5 이상이면 통과)
function evaluateGeneralPose(keypoints: Keypoint[]): { isPassed: boolean; feedback: PoseFeedback } {
  const avgConfidence = getAverageConfidence(keypoints);
  const validKeypointCount = keypoints.filter(kp => isValidKeypoint(kp)).length;

  if (validKeypointCount < 5) {
    return { isPassed: false, feedback: { message: '카메라에 더 가까이 와주세요', type: 'warning', isPassed: false } };
  }

  // 통과 조건: 평균 신뢰도 0.5 이상
  if (avgConfidence > 0.5) {
    return { isPassed: true, feedback: { message: '자세가 잘 인식되고 있어요', type: 'success', isPassed: true } };
  }

  return { isPassed: false, feedback: { message: '자세를 유지해주세요', type: 'info', isPassed: false } };
}

// 실제 동작 평가 함수 (Pass/Fail)
function calculatePoseMatch(
  guide: PoseGuide,
  keypoints: Keypoint[],
  waveHistory: { x: number; timestamp: number }[],
  clapHistory: { distance: number; timestamp: number }[]
): { isPassed: boolean; feedback: PoseFeedback } {
  // 키포인트가 없거나 불충분하면 미통과
  if (!keypoints || keypoints.length === 0) {
    return { isPassed: false, feedback: { message: '카메라에서 사람이 감지되지 않습니다', type: 'warning', isPassed: false } };
  }

  const avgConfidence = getAverageConfidence(keypoints);
  if (avgConfidence < 0.2) {
    return { isPassed: false, feedback: { message: '자세 인식이 불확실합니다. 조명을 확인해주세요', type: 'warning', isPassed: false } };
  }

  // 동작별 평가
  switch (guide.id) {
    case 'hand_raise_left':
      return evaluateHandRaiseLeft(keypoints);
    case 'hand_raise_right':
      return evaluateHandRaiseRight(keypoints);
    case 'hand_raise_both':
      return evaluateHandRaiseBoth(keypoints);
    case 'arms_spread':
      return evaluateArmsSpread(keypoints);
    case 'wave_hand':
      return evaluateWaveHand(keypoints, waveHistory);
    case 'clap_hands':
      return evaluateClapHands(keypoints, clapHistory);
    case 'thumbs_up':
      return evaluateThumbsUp(keypoints);
    // 얼굴 표정 동작은 포즈 감지로 평가하기 어려우므로 일반 평가
    case 'smile':
    case 'close_eyes':
    case 'open_mouth':
      return evaluateGeneralPose(keypoints);
    default:
      return evaluateGeneralPose(keypoints);
  }
}

interface MovementTrainingProps {
  onComplete?: (passedCount: number, totalCount: number) => void;
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
  const [results, setResults] = useState<boolean[]>([]);  // 통과 여부 배열 (점수 제거)
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [currentPassed, setCurrentPassed] = useState<boolean | null>(null);  // 현재 동작 통과 여부
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentFeedback, setCurrentFeedback] = useState<PoseFeedback | null>(null);
  const [isCurrentlyPassing, setIsCurrentlyPassing] = useState<boolean>(false);  // 실시간 통과 상태

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
    leftHandKeypoints,
    rightHandKeypoints,
    faceKeypoints,
    videoRef,
    canvasRef,
    startDetection,
    stopDetection,
  } = usePoseDetection({
    enabled: true,
    detectionInterval: 100, // 더 빠른 감지를 위해 100ms
    enableHandDetection: true, // 손 감지 활성화 (엄지 척, 손 흔들기 등 동작 인식 향상)
    enableFaceDetection: true, // 얼굴 인식 활성화 (초록색 박스로 표시)
  });

  // 인식된 키포인트 수 계산
  const detectedKeypointsCount = keypoints.filter(kp => (kp.score || 0) > 0.4).length;
  const detectedHandKeypointsCount = leftHandKeypoints.length + rightHandKeypoints.length;
  const detectedFaceKeypointsCount = faceKeypoints.length;

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
        if (rightWrist && (rightWrist.score || 0) > 0.4) {
          waveHistoryRef.current.push({ x: rightWrist.x, timestamp: Date.now() });
          // 최근 30개만 유지
          if (waveHistoryRef.current.length > 30) {
            waveHistoryRef.current = waveHistoryRef.current.slice(-30);
          }
        }

        // 박수 히스토리 (양손 거리)
        if (leftWrist && rightWrist &&
            (leftWrist.score || 0) > 0.4 && (rightWrist.score || 0) > 0.4) {
          const distance = getDistance(leftWrist, rightWrist);
          clapHistoryRef.current.push({ distance, timestamp: Date.now() });
          // 최근 30개만 유지
          if (clapHistoryRef.current.length > 30) {
            clapHistoryRef.current = clapHistoryRef.current.slice(-30);
          }
        }
      }

      // 실시간 통과 여부 및 피드백 계산
      const { isPassed, feedback } = calculatePoseMatch(
        guide,
        keypoints,
        waveHistoryRef.current,
        clapHistoryRef.current
      );
      setIsCurrentlyPassing(isPassed);
      setCurrentFeedback(feedback);

      // 목표 시간 달성
      if (elapsed >= guide.targetDuration) {
        // 최종 통과 여부는 실시간으로 계산된 결과 사용
        setCurrentPassed(isPassed);
        setResults(prev => [...prev, isPassed]);
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

  // 컴포넌트 마운트 시 카메라 스트림 시작
  useEffect(() => {
    startDetection();
    return () => {
      stopDetection();
    };
  }, []);

  // 시작 버튼 클릭
  const handleStart = useCallback(async () => {
    setCameraError(null);
    // 히스토리 초기화
    waveHistoryRef.current = [];
    clapHistoryRef.current = [];
    setCurrentFeedback(null);
    setIsCurrentlyPassing(false);

    const success = await startDetection();
    if (success) {
      setCountdown(3);
      setPhase('countdown');
      setMatchProgress(0);
      setCurrentPassed(null);
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
      setCurrentPassed(null);
      setCurrentFeedback(null);
      setIsCurrentlyPassing(false);
      matchStartTimeRef.current = null;
      // 히스토리 초기화
      waveHistoryRef.current = [];
      clapHistoryRef.current = [];
    } else {
      // 훈련 완료
      setShowFinalResult(true);
      if (onComplete) {
        const passedCount = results.filter(r => r).length;
        onComplete(passedCount, results.length);
      }
    }
  }, [currentIndex, selectedMovements.length, results, onComplete]);

  // 다시 시도
  const handleRetry = useCallback(() => {
    setPhase('ready');
    setMatchProgress(0);
    setCurrentPassed(null);
    setCurrentFeedback(null);
    setIsCurrentlyPassing(false);
    matchStartTimeRef.current = null;
    // 히스토리 초기화
    waveHistoryRef.current = [];
    clapHistoryRef.current = [];
    // 마지막 결과 제거
    setResults(prev => prev.slice(0, -1));
  }, []);

  // 처음부터 다시
  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setPhase('ready');
    setMatchProgress(0);
    setResults([]);
    setCurrentPassed(null);
    setCurrentFeedback(null);
    setIsCurrentlyPassing(false);
    setShowFinalResult(false);
    matchStartTimeRef.current = null;
    // 히스토리 초기화
    waveHistoryRef.current = [];
    clapHistoryRef.current = [];
  }, []);

  // 최종 결과 화면
  if (showFinalResult) {
    const passedCount = results.filter(r => r).length;
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <span className="text-6xl mb-4 block">🤸</span>
          <h2 className="text-2xl font-bold text-[var(--neutral-800)] mb-2">
            동작 훈련 완료!
          </h2>
          <div className="text-5xl font-bold text-[var(--primary)] mb-4">
            {passedCount} / {results.length}
          </div>
          <p className="text-[var(--neutral-600)]">
            {passedCount}개 동작을 성공적으로 완료했습니다.
          </p>
        </div>

        {/* 개별 결과 표시 */}
        <div className="grid grid-cols-5 gap-2">
          {results.map((passed, idx) => (
            <div
              key={idx}
              className={`text-center p-3 rounded-lg ${passed ? 'bg-green-50' : 'bg-yellow-50'}`}
            >
              <span className="text-2xl block mb-1">{poseGuides[selectedMovements[idx]].icon}</span>
              <span className={`text-2xl ${passed ? 'text-green-600' : 'text-yellow-600'}`}>
                {passed ? '✓' : '✗'}
              </span>
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

      {/* 카메라 에러 */}
      {cameraError && (
        <div className="p-4 bg-red-50 rounded-xl border border-red-200 mb-4">
          <p className="text-red-700 text-center">{cameraError}</p>
        </div>
      )}

      {/* 통합 레이아웃 - ready/countdown/active 상태에서 카메라 영역 한 번만 렌더링 */}
      {/* PC: 수직 레이아웃 (위: 카메라 / 아래: 정보 패널) - 겹침 문제 해결 */}
      {(phase === 'ready' || phase === 'countdown' || phase === 'active') && (
        <div className="flex flex-col gap-6">
          {/* 카메라 영역 - 상단 전체 너비 */}
          <div className="w-full">
            <div className="relative w-full max-w-4xl mx-auto aspect-[4/5] sm:aspect-[3/4] md:aspect-video bg-[var(--neutral-200)] rounded-xl overflow-hidden">
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

              {/* phase별 오버레이 - 조건부 렌더링 */}

              {/* 카메라 로딩 오버레이 (ready 상태) */}
              {isLoading && phase === 'ready' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <div className="text-white text-center max-w-xs">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xl font-semibold mb-2">AI 모델 로딩 중...</p>
                    <p className="text-sm text-white/70 mb-4">자세 인식 모델을 준비하고 있습니다</p>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                    <p className="text-xs text-white/50 mt-3">처음 실행 시 약 3-5초 소요됩니다</p>
                  </div>
                </div>
              )}

              {/* 카운트다운 오버레이 */}
              {phase === 'countdown' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                  <p className="text-white/80 mb-2 text-lg">준비하세요!</p>
                  <div className="text-8xl font-bold text-white animate-pulse">
                    {countdown}
                  </div>
                </div>
              )}

              {/* active 상태 테두리 */}
              {phase === 'active' && (
                <div className="absolute inset-0 pointer-events-none border-4 border-[var(--primary)] rounded-xl" />
              )}

              {/* 감지 상태 표시 (좌상단) - active 상태 */}
              {phase === 'active' && (
                <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-2 rounded-lg text-sm">
                  동작을 유지하세요
                </div>
              )}

              {/* 인식 상태 표시 (우상단) - 모든 상태에서 표시 */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <div className="bg-black/60 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${detectedKeypointsCount > 10 ? 'bg-green-400 animate-pulse' : detectedKeypointsCount > 5 ? 'bg-yellow-400' : 'bg-red-400'}`} />
                  <span>신체: {detectedKeypointsCount}/17</span>
                </div>
                {phase === 'active' && detectedHandKeypointsCount > 0 && (
                  <div className="bg-black/60 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    <span>손: {detectedHandKeypointsCount}/42</span>
                  </div>
                )}
                {phase === 'active' && detectedFaceKeypointsCount > 0 && (
                  <div className="bg-black/60 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                    <span>얼굴 감지됨</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 정보 패널 - 카메라 아래에 배치 */}
          <div className="w-full max-w-4xl mx-auto">
            {/* 정보 카드들을 그리드로 배치 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 동작 가이드 카드 (모든 상태 공통) */}
              <div className="p-5 bg-[var(--neutral-50)] rounded-xl border-2 border-[var(--neutral-200)]">
                <div className="text-center">
                  <span className="text-5xl mb-2 block">{guide.icon}</span>
                  <h3 className="text-xl font-bold text-[var(--neutral-800)]">{guide.name}</h3>
                  <p className="text-sm text-[var(--neutral-600)] mt-1">{guide.description}</p>
                </div>
              </div>

              {/* 안내 메시지 (모든 상태 공통) */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-center">
                <p className="text-blue-800 text-center">{guide.instruction}</p>
              </div>

              {/* ready 상태 전용 */}
              {phase === 'ready' && (
                <div className="flex flex-col gap-4">
                  {/* 안내 텍스트 */}
                  <div className="p-4 bg-[var(--neutral-50)] rounded-xl border border-[var(--neutral-200)]">
                    <p className="text-[var(--neutral-600)] text-center text-sm">
                      카메라에서 자신의 모습을 확인하고<br />
                      준비가 되면 시작 버튼을 눌러주세요
                    </p>
                  </div>

                  {/* 시작 버튼 */}
                  <button
                    onClick={handleStart}
                    disabled={isLoading}
                    className={`
                      w-full px-6 py-4 rounded-xl font-bold text-lg
                      bg-[var(--primary)] text-white
                      hover:bg-[var(--primary-deep)] transition-all duration-200
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
                    `}
                  >
                    {isLoading ? 'AI 모델 로딩 중...' : '시작하기'}
                  </button>
                </div>
              )}

              {/* active 상태 전용 - 통과 상태/진행도 */}
              {phase === 'active' && (
                <>
                  {/* 실시간 통과 상태 */}
                  <div className="p-5 bg-white rounded-xl border-2 border-[var(--neutral-200)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--neutral-600)]">현재 상태</span>
                      {isCurrentlyPassing ? (
                        <div className="text-3xl font-bold text-green-600">통과!</div>
                      ) : (
                        <div className="text-3xl font-bold text-yellow-600">조금 더...</div>
                      )}
                    </div>
                    {/* 진행도 바 */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-[var(--neutral-500)] mb-1">
                        <span>진행도</span>
                        <span>{Math.round(matchProgress)}%</span>
                      </div>
                      <div className="h-3 bg-[var(--neutral-200)] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-100 ${isCurrentlyPassing ? 'bg-green-500' : 'bg-[var(--primary)]'}`}
                          style={{ width: `${matchProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* active 상태: 피드백 및 감지 상태 (별도 행) */}
            {phase === 'active' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* 실시간 피드백 메시지 */}
                {currentFeedback && (
                  <div
                    className={`p-4 rounded-xl text-center font-medium transition-all duration-200 ${
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

                {/* 감지 상태 요약 */}
                <div className="p-4 bg-[var(--neutral-50)] rounded-xl border border-[var(--neutral-200)]">
                  <h4 className="text-sm font-medium text-[var(--neutral-700)] mb-3">감지 상태</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <span className="block text-[var(--neutral-600)]">신체</span>
                      <span className={`font-medium ${detectedKeypointsCount > 10 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {detectedKeypointsCount}/17
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[var(--neutral-600)]">손</span>
                      <span className={`font-medium ${detectedHandKeypointsCount > 0 ? 'text-orange-600' : 'text-[var(--neutral-400)]'}`}>
                        {detectedHandKeypointsCount > 0 ? `${detectedHandKeypointsCount}/42` : '-'}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[var(--neutral-600)]">얼굴</span>
                      <span className={`font-medium ${detectedFaceKeypointsCount > 0 ? 'text-pink-600' : 'text-[var(--neutral-400)]'}`}>
                        {detectedFaceKeypointsCount > 0 ? 'O' : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* hidden 비디오 요소 - result 상태에서 스트림 유지용 */}
      {phase === 'result' && (
        <div className="fixed left-[-9999px] top-[-9999px]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-[640px] h-[480px]"
          />
          <canvas ref={canvasRef} className="w-[640px] h-[480px]" />
        </div>
      )}

      {/* Result 상태 */}
      {phase === 'result' && currentPassed !== null && (
        <div className="p-6 bg-[var(--neutral-50)] rounded-xl border-2 border-[var(--neutral-200)]">
          <div className="text-center py-4">
            <span className="text-5xl mb-4 block">{guide.icon}</span>
            <div className="mb-4">
              <div className="text-6xl">
                {currentPassed ? '✅' : '❌'}
              </div>
              <p className={`text-xl mt-2 ${currentPassed ? 'text-green-600' : 'text-yellow-600'}`}>
                {currentPassed ? '동작 완료!' : '다시 해볼까요?'}
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
                  hover:bg-[var(--primary-deep)] transition-all duration-200 active:scale-95"
              >
                {currentIndex < selectedMovements.length - 1 ? '다음 동작' : '완료'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
