'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { initTensorFlow } from '@/lib/ai/tensorflow';

// 타입만 import (런타임 번들에 포함되지 않음)
import type * as faceLandmarksDetectionTypes from '@tensorflow-models/face-landmarks-detection';

// 감정 타입 및 상수 (constants 파일에서 re-export)
export type { EmotionType } from '@/lib/constants/emotionConstants';
export { emotionLabels, emotionIcons, emotionColors } from '@/lib/constants/emotionConstants';
import type { EmotionType } from '@/lib/constants/emotionConstants';

// 감정 기록
export interface EmotionRecord {
  timestamp: number;
  emotion: EmotionType;
  confidence: number;
  questionIndex?: number;
}

// 감정 분포 통계
export interface EmotionDistribution {
  emotion: EmotionType;
  count: number;
  percentage: number;
}

// 얼굴 감지 결과
export interface FaceDetectionResult {
  isDetected: boolean;
  emotion: EmotionType;
  confidence: number;
  landmarks?: {
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    nose: { x: number; y: number };
    mouth: { x: number; y: number };
  };
}

// 훅 옵션
interface UseFaceDetectionOptions {
  enabled?: boolean;
  detectionInterval?: number; // ms
  onEmotionChange?: (emotion: EmotionType, confidence: number) => void;
}

// 훅 반환 타입
interface UseFaceDetectionReturn {
  isLoading: boolean;
  isActive: boolean;
  isPermissionGranted: boolean;
  currentEmotion: EmotionType;
  emotionTimeline: EmotionRecord[];
  emotionDistribution: EmotionDistribution[];
  dominantEmotion: EmotionType;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  startDetection: () => Promise<boolean>;
  stopDetection: () => void;
  clearTimeline: () => void;
  recordEmotionForQuestion: (questionIndex: number) => void;
}

export function useFaceDetection(options: UseFaceDetectionOptions = {}): UseFaceDetectionReturn {
  const {
    enabled = true,
    detectionInterval = 1000,
    onEmotionChange,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('neutral');
  const [emotionTimeline, setEmotionTimeline] = useState<EmotionRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestionIndexRef = useRef<number>(0);
  const detectorRef = useRef<faceLandmarksDetectionTypes.FaceLandmarksDetector | null>(null);

  // 감정 분포 계산
  const emotionDistribution = calculateEmotionDistribution(emotionTimeline);

  // 가장 많이 나타난 감정
  const dominantEmotion = emotionDistribution.length > 0
    ? emotionDistribution[0].emotion
    : 'neutral';

  // 웹캠 스트림 시작
  const startWebcam = useCallback(async (): Promise<boolean> => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      // Video track is ready

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // 그레이스케일 필터 방지
        videoRef.current.style.filter = 'none';
        // 비디오 크기 강제 설정 (TensorFlow 감지를 위해 필요)
        videoRef.current.width = 640;
        videoRef.current.height = 480;
        await videoRef.current.play();
      }

      streamRef.current = mediaStream;
      setStream(mediaStream); // 반응형 상태 업데이트
      setIsPermissionGranted(true);
      return true;
    } catch {
      setError('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
      setIsPermissionGranted(false);
      return false;
    }
  }, []);

  // 웹캠 스트림 중지
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // 얼굴 랜드마크 기반 실제 표정 분석
  const analyzeEmotionFromLandmarks = useCallback((keypoints: faceLandmarksDetectionTypes.Keypoint[]): EmotionType => {
    if (keypoints.length < 468) {
      return 'neutral';
    }

    // MediaPipe FaceMesh 랜드마크 인덱스 (468개 포인트)
    // 입 관련 랜드마크
    const upperLipTop = keypoints[13];      // 윗입술 위
    const lowerLipBottom = keypoints[14];   // 아랫입술 아래
    const mouthLeft = keypoints[61];        // 입 왼쪽 끝
    const mouthRight = keypoints[291];      // 입 오른쪽 끝
    const upperLipCenter = keypoints[0];    // 윗입술 중앙

    // 눈 관련 랜드마크
    const leftEyeTop = keypoints[159];      // 왼쪽 눈 위
    const leftEyeBottom = keypoints[145];   // 왼쪽 눈 아래
    const rightEyeTop = keypoints[386];     // 오른쪽 눈 위
    const rightEyeBottom = keypoints[374];  // 오른쪽 눈 아래

    // 눈썹 관련 랜드마크
    const leftEyebrowInner = keypoints[107];   // 왼쪽 눈썹 안쪽
    const leftEyebrowOuter = keypoints[70];    // 왼쪽 눈썹 바깥쪽
    const rightEyebrowInner = keypoints[336];  // 오른쪽 눈썹 안쪽
    const rightEyebrowOuter = keypoints[300];  // 오른쪽 눈썹 바깥쪽

    // 코 랜드마크 (기준점)
    const noseTip = keypoints[4];

    // 거리 계산 유틸리티
    const distance = (p1: faceLandmarksDetectionTypes.Keypoint, p2: faceLandmarksDetectionTypes.Keypoint) => {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };

    // 얼굴 크기 정규화를 위한 기준 거리 (눈 사이 거리)
    const leftEyeCenter = keypoints[33];
    const rightEyeCenter = keypoints[263];
    const faceWidth = distance(leftEyeCenter, rightEyeCenter);

    if (faceWidth < 10) return 'neutral'; // 얼굴이 너무 작음

    // 1. 입 벌림 정도 (입 높이 / 얼굴 너비)
    const mouthOpenRatio = distance(upperLipTop, lowerLipBottom) / faceWidth;

    // 2. 미소 정도 (입 너비 / 얼굴 너비 + 입꼬리 높이)
    const mouthWidth = distance(mouthLeft, mouthRight);
    const mouthWidthRatio = mouthWidth / faceWidth;
    const mouthCornerAvgY = (mouthLeft.y + mouthRight.y) / 2;
    const upperLipY = upperLipCenter.y;
    const smileRatio = (upperLipY - mouthCornerAvgY) / faceWidth; // 양수면 미소

    // 3. 눈 크게 뜸 정도
    const leftEyeOpen = distance(leftEyeTop, leftEyeBottom) / faceWidth;
    const rightEyeOpen = distance(rightEyeTop, rightEyeBottom) / faceWidth;
    const eyeOpenRatio = (leftEyeOpen + rightEyeOpen) / 2;

    // 4. 눈썹 찌푸림 정도 (눈썹 안쪽이 내려감)
    const leftBrowFrown = (leftEyebrowInner.y - leftEyeTop.y) / faceWidth;
    const rightBrowFrown = (rightEyebrowInner.y - rightEyeTop.y) / faceWidth;
    const browFrownRatio = (leftBrowFrown + rightBrowFrown) / 2;

    // 감정 판정 (우선순위 순서로 체크)

    // 놀람: 눈 크게 뜸 + 입 벌림
    if (eyeOpenRatio > 0.08 && mouthOpenRatio > 0.12) {
      return 'surprised';
    }

    // 행복: 미소 (입꼬리 올라감 + 입 너비)
    // 조건 완화: mouthWidthRatio 0.9 -> 0.7, smileRatio 체크 강화
    if (smileRatio > 0.005 && mouthWidthRatio > 0.7) {
      return 'happy';
    }

    // 슬픔: 입꼬리 내려감 (행복보다 먼저 체크하면 안됨)
    if (smileRatio < -0.015) {
      return 'sad';
    }

    // 불안/긴장: 눈썹 찌푸림 + 입 다물음
    if (browFrownRatio > 0.06 && mouthOpenRatio < 0.04) {
      return 'anxious';
    }

    // 혼란: 눈썹 비대칭 (조건 강화 - 너무 쉽게 감지되지 않도록)
    const browAsymmetry = Math.abs(leftBrowFrown - rightBrowFrown);
    if (browAsymmetry > 0.035 || (browFrownRatio > 0.04 && browFrownRatio < 0.06)) {
      return 'confused';
    }

    return 'neutral';
  }, []);

  // 감정 감지 루프 - 실제 얼굴 인식 사용
  const detectEmotion = useCallback(async () => {
    if (!isActive || !videoRef.current || !detectorRef.current) return;

    try {
      const video = videoRef.current;

      // 비디오가 준비되지 않았으면 대기
      if (video.readyState < 2) {
        // 최대 500ms 대기
        const waitForVideo = () => new Promise<boolean>((resolve) => {
          if (video.readyState >= 2) {
            resolve(true);
            return;
          }
          const timeout = setTimeout(() => resolve(false), 500);
          const onReady = () => {
            clearTimeout(timeout);
            video.removeEventListener('loadeddata', onReady);
            resolve(true);
          };
          video.addEventListener('loadeddata', onReady);
        });

        const isReady = await waitForVideo();
        if (!isReady) {
          return;
        }
      }

      // 얼굴 랜드마크 감지
      const faces = await detectorRef.current.estimateFaces(video, {
        flipHorizontal: false,
      });

      if (faces.length === 0) {
        // 얼굴이 감지되지 않음
        return;
      }

      const face = faces[0];
      const keypoints = face.keypoints;

      // 랜드마크 기반 감정 분석
      const emotion = analyzeEmotionFromLandmarks(keypoints);
      const confidence = face.box ? 0.85 : 0.7; // 얼굴 박스가 있으면 신뢰도 높음

      setCurrentEmotion(emotion);

      // 타임라인에 기록
      const record: EmotionRecord = {
        timestamp: Date.now(),
        emotion,
        confidence,
        questionIndex: currentQuestionIndexRef.current,
      };

      setEmotionTimeline(prev => [...prev, record]);

      // 콜백 호출
      if (onEmotionChange) {
        onEmotionChange(emotion, confidence);
      }
    } catch {
      // Detection error - continue
    }
  }, [isActive, analyzeEmotionFromLandmarks, onEmotionChange]);

  // 감지 시작 (지연 로딩)
  const startDetection = useCallback(async (): Promise<boolean> => {
    setError(null); // 이전 에러 초기화
    setIsLoading(true);

    try {
      // TensorFlow.js 초기화
      await initTensorFlow();

      // Face Landmarks Detection 모델 로드 (동적 import로 번들 크기 최적화)
      if (!detectorRef.current) {
        const faceLandmarksDetection = await import('@tensorflow-models/face-landmarks-detection');
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig: faceLandmarksDetectionTypes.MediaPipeFaceMeshTfjsModelConfig = {
          runtime: 'tfjs',
          refineLandmarks: true,
          maxFaces: 1,
        };
        detectorRef.current = await faceLandmarksDetection.createDetector(model, detectorConfig);
      }

      // 웹캠 시작
      const webcamStarted = await startWebcam();
      if (!webcamStarted) {
        setIsLoading(false);
        return false;
      }

      setIsActive(true);
      setIsLoading(false);

      return true;
    } catch {
      setError('얼굴 인식 모델을 로드하는데 실패했습니다.');
      setIsLoading(false);
      return false;
    }
  }, [startWebcam]);

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
    setEmotionTimeline([]);
  }, []);

  // 특정 문항의 감정 기록
  const recordEmotionForQuestion = useCallback((questionIndex: number) => {
    currentQuestionIndexRef.current = questionIndex;
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  // 감지 루프 업데이트 - async 함수 처리
  useEffect(() => {
    if (!isActive) {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      return;
    }

    // 중복 감지 방지 플래그
    let isDetecting = false;

    const runDetection = async () => {
      if (isDetecting) return;
      isDetecting = true;
      try {
        await detectEmotion();
      } catch {
        // Detection loop error - continue
      } finally {
        isDetecting = false;
      }
    };

    // 시작 시 즉시 실행
    runDetection();

    detectionIntervalRef.current = setInterval(runDetection, detectionInterval);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [isActive, detectEmotion, detectionInterval]);

  // 비디오 요소가 변경되었을 때 스트림 재할당
  // (화면 전환으로 새 video 요소가 마운트될 때 필요)
  useEffect(() => {
    if (!isActive) return;

    const checkAndAssignStream = () => {
      if (streamRef.current && videoRef.current) {
        // 현재 비디오 요소에 스트림이 없거나 다른 스트림이면 재할당
        if (videoRef.current.srcObject !== streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.style.filter = 'none';
          videoRef.current.play().catch(() => {
            // Video play failed - stream may have been stopped
          });
        }
      }
    };

    // 즉시 체크
    checkAndAssignStream();

    // 카메라 활성화 중에는 주기적으로 체크 (화면 전환 감지)
    // 스트림이 정상 할당되면 체크가 빠르게 종료됨
    const interval = setInterval(checkAndAssignStream, 200);

    return () => clearInterval(interval);
  }, [isActive]);

  return {
    isLoading,
    isActive,
    isPermissionGranted,
    currentEmotion,
    emotionTimeline,
    emotionDistribution,
    dominantEmotion,
    error,
    videoRef,
    stream, // 반응형 상태 사용
    startDetection,
    stopDetection,
    clearTimeline,
    recordEmotionForQuestion,
  };
}

// 감정 분포 계산 유틸리티
function calculateEmotionDistribution(timeline: EmotionRecord[]): EmotionDistribution[] {
  if (timeline.length === 0) return [];

  const counts: Record<EmotionType, number> = {
    neutral: 0,
    happy: 0,
    confused: 0,
    anxious: 0,
    sad: 0,
    surprised: 0,
    angry: 0,
  };

  timeline.forEach(record => {
    counts[record.emotion]++;
  });

  const total = timeline.length;

  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([emotion, count]) => ({
      emotion: emotion as EmotionType,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

// 감정 상수는 '@/lib/constants/emotionConstants'에서 re-export됨

export default useFaceDetection;
