'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { initTensorFlow } from '@/lib/ai/tensorflow';
import * as poseDetection from '@tensorflow-models/pose-detection';

// 키포인트 타입
export interface Keypoint {
  x: number;
  y: number;
  score?: number;
  name?: string;
}

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
  onKeypointsDetected?: (keypoints: Keypoint[]) => void;
}

// 훅 반환 타입
interface UsePoseDetectionReturn {
  isLoading: boolean;
  isActive: boolean;
  currentPosture: PostureType;
  currentTiltAngle: number;
  postureTimeline: PostureRecord[];
  postureStats: PostureStats;
  keypoints: Keypoint[];
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  startDetection: () => Promise<boolean>;
  stopDetection: () => void;
  clearTimeline: () => void;
  recordPostureForQuestion: (questionIndex: number) => void;
  drawKeypoints: () => void;
}

// MoveNet 키포인트 인덱스
const KEYPOINT_NAMES = [
  'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
  'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
];

// 스켈레톤 연결 정의 (키포인트 인덱스 쌍)
const SKELETON_CONNECTIONS: [number, number][] = [
  [0, 1], [0, 2],           // nose -> eyes
  [1, 3], [2, 4],           // eyes -> ears
  [5, 6],                   // shoulders
  [5, 7], [7, 9],           // left arm
  [6, 8], [8, 10],          // right arm
  [5, 11], [6, 12],         // torso
  [11, 12],                 // hips
  [11, 13], [13, 15],       // left leg
  [12, 14], [14, 16],       // right leg
];

export function usePoseDetection(options: UsePoseDetectionOptions = {}): UsePoseDetectionReturn {
  const {
    enabled = true,
    detectionInterval = 100, // 더 빠른 감지를 위해 100ms로 변경
    tiltThreshold = 15,
    onPostureChange,
    onKeypointsDetected,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentPosture, setCurrentPosture] = useState<PostureType>('unknown');
  const [currentTiltAngle, setCurrentTiltAngle] = useState(0);
  const [postureTimeline, setPostureTimeline] = useState<PostureRecord[]>([]);
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);
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

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        console.log('[PoseDetection] Video track settings:', settings);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.filter = 'none';
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

  // MoveNet 모델 초기화
  const initDetector = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[PoseDetection] Initializing MoveNet detector...');

      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
        }
      );

      detectorRef.current = detector;
      console.log('[PoseDetection] MoveNet detector initialized');
      return true;
    } catch (error) {
      console.error('[PoseDetection] Failed to initialize detector:', error);
      return false;
    }
  }, []);

  // 키포인트를 캔버스에 그리기
  const drawKeypoints = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || keypoints.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기를 비디오에 맞춤
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 미러링을 위한 변환
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);

    // 스켈레톤 그리기 (선)
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 3;

    for (const [startIdx, endIdx] of SKELETON_CONNECTIONS) {
      const start = keypoints[startIdx];
      const end = keypoints[endIdx];

      if (start && end && (start.score || 0) > 0.3 && (end.score || 0) > 0.3) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    }

    // 키포인트 그리기 (원)
    for (const kp of keypoints) {
      if ((kp.score || 0) > 0.3) {
        // 외곽선
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#00FF00';
        ctx.fill();

        // 내부
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }
    }

    ctx.restore();
  }, [keypoints]);

  // 자세 분석 (실제 키포인트 기반)
  const analyzePostureFromKeypoints = useCallback((kps: Keypoint[]): { posture: PostureType; angle: number } => {
    // 어깨 키포인트 찾기
    const leftShoulder = kps[5];
    const rightShoulder = kps[6];

    if (!leftShoulder || !rightShoulder ||
        (leftShoulder.score || 0) < 0.3 || (rightShoulder.score || 0) < 0.3) {
      return { posture: 'unknown', angle: 0 };
    }

    // 어깨 기울기 계산
    const deltaY = rightShoulder.y - leftShoulder.y;
    const deltaX = rightShoulder.x - leftShoulder.x;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    let posture: PostureType;
    if (Math.abs(angle) > tiltThreshold) {
      posture = angle > 0 ? 'leaning_right' : 'leaning_left';
    } else {
      posture = 'upright';
    }

    return { posture, angle };
  }, [tiltThreshold]);

  // 실시간 포즈 감지 루프
  const detectPose = useCallback(async () => {
    if (!isActive || !videoRef.current || !detectorRef.current) {
      return;
    }

    try {
      const poses = await detectorRef.current.estimatePoses(videoRef.current);

      if (poses.length > 0 && poses[0].keypoints) {
        const detectedKeypoints = poses[0].keypoints.map((kp, idx) => ({
          x: kp.x,
          y: kp.y,
          score: kp.score,
          name: KEYPOINT_NAMES[idx],
        }));

        setKeypoints(detectedKeypoints);

        // 콜백 호출
        if (onKeypointsDetected) {
          onKeypointsDetected(detectedKeypoints);
        }

        // 자세 분석
        const { posture, angle } = analyzePostureFromKeypoints(detectedKeypoints);

        if (posture !== 'unknown') {
          setCurrentPosture(posture);
          setCurrentTiltAngle(angle);

          // 타임라인에 기록
          const record: PostureRecord = {
            timestamp: Date.now(),
            posture,
            tiltAngle: angle,
            questionIndex: currentQuestionIndexRef.current,
          };
          setPostureTimeline(prev => [...prev.slice(-100), record]); // 최근 100개만 유지

          if (onPostureChange) {
            onPostureChange(posture, angle);
          }
        }
      }
    } catch (error) {
      console.error('[PoseDetection] Detection error:', error);
    }

    // 다음 프레임 예약
    if (isActive) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
    }
  }, [isActive, analyzePostureFromKeypoints, onKeypointsDetected, onPostureChange]);

  // 키포인트 변경 시 캔버스에 그리기
  useEffect(() => {
    if (keypoints.length > 0) {
      drawKeypoints();
    }
  }, [keypoints, drawKeypoints]);

  // 감지 시작
  const startDetection = useCallback(async (): Promise<boolean> => {
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

      // 비디오가 로드될 때까지 대기
      await new Promise<void>((resolve) => {
        if (videoRef.current) {
          if (videoRef.current.readyState >= 2) {
            resolve();
          } else {
            videoRef.current.onloadeddata = () => resolve();
          }
        } else {
          resolve();
        }
      });

      // MoveNet 초기화
      const detectorInitialized = await initDetector();
      if (!detectorInitialized) {
        console.warn('[PoseDetection] Using simulation mode');
      }

      setIsActive(true);
      setIsLoading(false);

      // 감지 루프 시작
      animationFrameRef.current = requestAnimationFrame(detectPose);

      return true;
    } catch (error) {
      console.error('[PoseDetection] Failed to start:', error);
      setIsLoading(false);
      return false;
    }
  }, [startWebcam, initDetector, detectPose]);

  // 감지 중지
  const stopDetection = useCallback(() => {
    setIsActive(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (detectorRef.current) {
      detectorRef.current.dispose();
      detectorRef.current = null;
    }

    stopWebcam();
    setKeypoints([]);
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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
      stopWebcam();
    };
  }, [stopWebcam]);

  // isActive 변경 시 감지 루프 관리
  useEffect(() => {
    if (isActive && !animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isActive, detectPose]);

  return {
    isLoading,
    isActive,
    currentPosture,
    currentTiltAngle,
    postureTimeline,
    postureStats,
    keypoints,
    videoRef,
    canvasRef,
    startDetection,
    stopDetection,
    clearTimeline,
    recordPostureForQuestion,
    drawKeypoints,
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

  let tiltSequences: number[] = [];
  let currentTiltStart: number | null = null;

  timeline.forEach((record, index) => {
    switch (record.posture) {
      case 'upright':
        upright++;
        if (currentTiltStart !== null) {
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
  tolerance: number;
}

// 자세 비교 결과
export interface PoseComparisonResult {
  isMatching: boolean;
  matchScore: number;
  matchedPoints: string[];
  unmatchedPoints: string[];
}

/**
 * 목표 자세와 현재 자세 비교
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

    const minConfidence = targetPoint.minConfidence || 0.5;
    if (currentPoint.confidence < minConfidence) {
      unmatchedPoints.push(pointName);
      continue;
    }

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
    isMatching: matchScore >= 70,
    matchScore,
    matchedPoints,
    unmatchedPoints,
  };
}

/**
 * 간단한 동작 감지 (시뮬레이션용)
 */
export function detectSimpleMovement(
  movementType: string,
  _videoElement: HTMLVideoElement | null
): { detected: boolean; confidence: number } {
  const detected = Math.random() > 0.2;
  const confidence = detected ? 0.7 + Math.random() * 0.3 : 0.2 + Math.random() * 0.3;
  return { detected, confidence };
}

/**
 * 동작 일치도 점수 계산
 */
export function calculateMovementScore(
  targetMovement: string,
  detectionHistory: Array<{ detected: boolean; confidence: number; timestamp: number }>,
  duration: number
): number {
  if (detectionHistory.length === 0) return 0;

  const successRate = detectionHistory.filter(d => d.detected).length / detectionHistory.length;
  const avgConfidence = detectionHistory.reduce((sum, d) => sum + d.confidence, 0) / detectionHistory.length;
  const baseScore = successRate * 80 + avgConfidence * 20;

  return Math.round(Math.min(baseScore, 100));
}

export default usePoseDetection;
