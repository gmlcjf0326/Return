'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { initTensorFlow } from '@/lib/ai/tensorflow';

// 자세 타입
export type PostureType =
  | 'upright'     // 바른 자세
  | 'leaning_left'  // 왼쪽으로 기울어짐
  | 'leaning_right' // 오른쪽으로 기울어짐
  | 'slouching'   // 구부정한 자세
  | 'unknown';    // 감지 불가

// 자세 기록
export interface PostureRecord {
  timestamp: number;
  posture: PostureType;
  tiltAngle: number; // 기울기 각도 (도)
  questionIndex?: number;
}

// 자세 통계
export interface PostureStats {
  uprightPercentage: number;
  leftTiltPercentage: number;
  rightTiltPercentage: number;
  slouchingPercentage: number;
  totalTiltCount: number;
  avgTiltDuration: number; // ms
}

// 훅 옵션
interface UsePoseDetectionOptions {
  enabled?: boolean;
  detectionInterval?: number;
  tiltThreshold?: number; // 기울기 임계값 (도)
  onPostureChange?: (posture: PostureType, angle: number) => void;
}

// 훅 반환 타입
interface UsePoseDetectionReturn {
  isLoading: boolean;
  isActive: boolean;
  currentPosture: PostureType;
  currentTiltAngle: number;
  postureTimeline: PostureRecord[];
  postureStats: PostureStats;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  startDetection: () => Promise<boolean>;
  stopDetection: () => void;
  clearTimeline: () => void;
  recordPostureForQuestion: (questionIndex: number) => void;
}

export function usePoseDetection(options: UsePoseDetectionOptions = {}): UsePoseDetectionReturn {
  const {
    enabled = true,
    detectionInterval = 500,
    tiltThreshold = 15,
    onPostureChange,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentPosture, setCurrentPosture] = useState<PostureType>('unknown');
  const [currentTiltAngle, setCurrentTiltAngle] = useState(0);
  const [postureTimeline, setPostureTimeline] = useState<PostureRecord[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestionIndexRef = useRef<number>(0);

  // 자세 통계 계산
  const postureStats = calculatePostureStats(postureTimeline);

  // 웹캠 스트림 시작
  const startWebcam = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      streamRef.current = stream;
      return true;
    } catch (error) {
      console.error('[PoseDetection] Webcam access denied:', error);
      return false;
    }
  }, []);

  // 웹캠 스트림 중지
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // 자세 분석 (시뮬레이션)
  // 실제 구현에서는 pose-detection 모델로 어깨/머리 위치 분석
  const analyzePosture = useCallback((): { posture: PostureType; angle: number } => {
    // 랜덤 기울기 시뮬레이션 (-30 ~ +30도)
    // 대부분 바른 자세, 가끔 기울어짐
    const isUpright = Math.random() > 0.2; // 80% 확률로 바른 자세

    if (isUpright) {
      const angle = (Math.random() - 0.5) * 10; // -5 ~ +5도
      return { posture: 'upright', angle };
    }

    // 기울어진 경우
    const angle = (Math.random() - 0.5) * 40; // -20 ~ +20도

    let posture: PostureType;
    if (Math.abs(angle) > tiltThreshold) {
      posture = angle < 0 ? 'leaning_left' : 'leaning_right';
    } else {
      posture = 'upright';
    }

    return { posture, angle };
  }, [tiltThreshold]);

  // 자세 감지 루프
  const detectPosture = useCallback(() => {
    if (!isActive || !videoRef.current) return;

    const { posture, angle } = analyzePosture();

    setCurrentPosture(posture);
    setCurrentTiltAngle(angle);

    // 타임라인에 기록
    const record: PostureRecord = {
      timestamp: Date.now(),
      posture,
      tiltAngle: angle,
      questionIndex: currentQuestionIndexRef.current,
    };

    setPostureTimeline(prev => [...prev, record]);

    // 콜백 호출
    if (onPostureChange) {
      onPostureChange(posture, angle);
    }
  }, [isActive, analyzePosture, onPostureChange]);

  // 감지 시작
  const startDetection = useCallback(async (): Promise<boolean> => {
    if (!enabled) return false;

    setIsLoading(true);

    try {
      // TensorFlow.js 초기화
      await initTensorFlow();

      // 웹캠 시작
      const webcamStarted = await startWebcam();
      if (!webcamStarted) {
        setIsLoading(false);
        return false;
      }

      setIsActive(true);
      setIsLoading(false);

      // 감지 인터벌 시작
      detectionIntervalRef.current = setInterval(detectPosture, detectionInterval);

      return true;
    } catch (error) {
      console.error('[PoseDetection] Failed to start:', error);
      setIsLoading(false);
      return false;
    }
  }, [enabled, startWebcam, detectPosture, detectionInterval]);

  // 감지 중지
  const stopDetection = useCallback(() => {
    setIsActive(false);

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    stopWebcam();
  }, [stopWebcam]);

  // 타임라인 초기화
  const clearTimeline = useCallback(() => {
    setPostureTimeline([]);
  }, []);

  // 특정 문항의 자세 기록
  const recordPostureForQuestion = useCallback((questionIndex: number) => {
    currentQuestionIndexRef.current = questionIndex;
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  // 감지 루프 업데이트
  useEffect(() => {
    if (isActive && !detectionIntervalRef.current) {
      detectionIntervalRef.current = setInterval(detectPosture, detectionInterval);
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [isActive, detectPosture, detectionInterval]);

  return {
    isLoading,
    isActive,
    currentPosture,
    currentTiltAngle,
    postureTimeline,
    postureStats,
    videoRef,
    startDetection,
    stopDetection,
    clearTimeline,
    recordPostureForQuestion,
  };
}

// 자세 통계 계산 유틸리티
function calculatePostureStats(timeline: PostureRecord[]): PostureStats {
  if (timeline.length === 0) {
    return {
      uprightPercentage: 0,
      leftTiltPercentage: 0,
      rightTiltPercentage: 0,
      slouchingPercentage: 0,
      totalTiltCount: 0,
      avgTiltDuration: 0,
    };
  }

  const total = timeline.length;
  let upright = 0;
  let leftTilt = 0;
  let rightTilt = 0;
  let slouching = 0;

  // 기울어짐 구간 계산
  let tiltSequences: number[] = [];
  let currentTiltStart: number | null = null;

  timeline.forEach((record, index) => {
    switch (record.posture) {
      case 'upright':
        upright++;
        if (currentTiltStart !== null) {
          // 기울어짐 구간 종료
          tiltSequences.push(record.timestamp - currentTiltStart);
          currentTiltStart = null;
        }
        break;
      case 'leaning_left':
        leftTilt++;
        if (currentTiltStart === null) {
          currentTiltStart = record.timestamp;
        }
        break;
      case 'leaning_right':
        rightTilt++;
        if (currentTiltStart === null) {
          currentTiltStart = record.timestamp;
        }
        break;
      case 'slouching':
        slouching++;
        break;
    }

    // 마지막 기록에서 기울어짐 중이면 종료
    if (index === timeline.length - 1 && currentTiltStart !== null) {
      tiltSequences.push(record.timestamp - currentTiltStart);
    }
  });

  const avgTiltDuration = tiltSequences.length > 0
    ? tiltSequences.reduce((a, b) => a + b, 0) / tiltSequences.length
    : 0;

  return {
    uprightPercentage: Math.round((upright / total) * 100),
    leftTiltPercentage: Math.round((leftTilt / total) * 100),
    rightTiltPercentage: Math.round((rightTilt / total) * 100),
    slouchingPercentage: Math.round((slouching / total) * 100),
    totalTiltCount: tiltSequences.length,
    avgTiltDuration: Math.round(avgTiltDuration),
  };
}

// 자세 이름 한글화
export const postureLabels: Record<PostureType, string> = {
  upright: '바른 자세',
  leaning_left: '왼쪽 기울임',
  leaning_right: '오른쪽 기울임',
  slouching: '구부정함',
  unknown: '감지 불가',
};

// 자세 아이콘
export const postureIcons: Record<PostureType, string> = {
  upright: '🧘',
  leaning_left: '↖️',
  leaning_right: '↗️',
  slouching: '🪑',
  unknown: '❓',
};

// 자세 색상
export const postureColors: Record<PostureType, string> = {
  upright: '#10B981',
  leaning_left: '#F59E0B',
  leaning_right: '#F59E0B',
  slouching: '#EF4444',
  unknown: '#6B7280',
};

// 목표 자세 정의
export interface TargetPose {
  name: string;
  keypoints: Record<string, { x: number; y: number; minConfidence?: number }>;
  tolerance: number; // 허용 오차 (픽셀)
}

// 자세 비교 결과
export interface PoseComparisonResult {
  isMatching: boolean;
  matchScore: number; // 0-100
  matchedPoints: string[];
  unmatchedPoints: string[];
}

/**
 * 목표 자세와 현재 자세 비교
 * @param target 목표 자세 정의
 * @param currentKeypoints 현재 감지된 키포인트
 * @returns 비교 결과
 */
export function comparePose(
  target: TargetPose,
  currentKeypoints: Record<string, { x: number; y: number; confidence: number }>
): PoseComparisonResult {
  const targetPoints = Object.keys(target.keypoints);
  const matchedPoints: string[] = [];
  const unmatchedPoints: string[] = [];

  for (const pointName of targetPoints) {
    const targetPoint = target.keypoints[pointName];
    const currentPoint = currentKeypoints[pointName];

    if (!currentPoint) {
      unmatchedPoints.push(pointName);
      continue;
    }

    // 신뢰도 확인
    const minConfidence = targetPoint.minConfidence || 0.5;
    if (currentPoint.confidence < minConfidence) {
      unmatchedPoints.push(pointName);
      continue;
    }

    // 위치 비교 (허용 오차 내)
    const distance = Math.sqrt(
      Math.pow(currentPoint.x - targetPoint.x, 2) +
      Math.pow(currentPoint.y - targetPoint.y, 2)
    );

    if (distance <= target.tolerance) {
      matchedPoints.push(pointName);
    } else {
      unmatchedPoints.push(pointName);
    }
  }

  const matchScore = targetPoints.length > 0
    ? Math.round((matchedPoints.length / targetPoints.length) * 100)
    : 0;

  return {
    isMatching: matchScore >= 70, // 70% 이상 일치하면 성공
    matchScore,
    matchedPoints,
    unmatchedPoints,
  };
}

/**
 * 간단한 동작 감지 (시뮬레이션용)
 * 실제 구현에서는 TensorFlow.js pose-detection 사용
 */
export function detectSimpleMovement(
  movementType: string,
  _videoElement: HTMLVideoElement | null
): { detected: boolean; confidence: number } {
  // 시뮬레이션: 80% 확률로 동작 감지 성공
  const detected = Math.random() > 0.2;
  const confidence = detected ? 0.7 + Math.random() * 0.3 : 0.2 + Math.random() * 0.3;

  return { detected, confidence };
}

/**
 * 동작 일치도 점수 계산
 * @param targetMovement 목표 동작 타입
 * @param detectionHistory 감지 이력
 * @param duration 수행 시간 (ms)
 * @returns 점수 (0-100)
 */
export function calculateMovementScore(
  targetMovement: string,
  detectionHistory: Array<{ detected: boolean; confidence: number; timestamp: number }>,
  duration: number
): number {
  if (detectionHistory.length === 0) return 0;

  // 감지 성공률
  const successRate = detectionHistory.filter(d => d.detected).length / detectionHistory.length;

  // 평균 신뢰도
  const avgConfidence = detectionHistory.reduce((sum, d) => sum + d.confidence, 0) / detectionHistory.length;

  // 기본 점수 = 성공률 * 80 + 신뢰도 * 20
  const baseScore = successRate * 80 + avgConfidence * 20;

  return Math.round(Math.min(baseScore, 100));
}

export default usePoseDetection;
