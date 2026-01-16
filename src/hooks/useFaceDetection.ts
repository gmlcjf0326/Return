'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { initTensorFlow } from '@/lib/ai/tensorflow';

// 감정 타입
export type EmotionType =
  | 'neutral'    // 중립/집중
  | 'happy'      // 행복/만족
  | 'confused'   // 혼란/당황
  | 'anxious'    // 불안/긴장
  | 'sad'        // 슬픔
  | 'surprised'  // 놀람
  | 'angry';     // 화남

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
  videoRef: React.RefObject<HTMLVideoElement | null>;
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestionIndexRef = useRef<number>(0);

  // 감정 분포 계산
  const emotionDistribution = calculateEmotionDistribution(emotionTimeline);

  // 가장 많이 나타난 감정
  const dominantEmotion = emotionDistribution.length > 0
    ? emotionDistribution[0].emotion
    : 'neutral';

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
      setIsPermissionGranted(true);
      return true;
    } catch (error) {
      console.error('[FaceDetection] Webcam access denied:', error);
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
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // 간단한 표정 분석 (실제로는 더 복잡한 모델 사용)
  // 여기서는 랜덤 시뮬레이션으로 대체 (실제 구현에서는 face-landmarks-detection 모델 사용)
  const analyzeEmotion = useCallback((): EmotionType => {
    // 실제 구현에서는 얼굴 랜드마크를 분석하여 감정 추론
    // 여기서는 간단한 시뮬레이션
    const emotions: EmotionType[] = ['neutral', 'happy', 'confused', 'anxious', 'surprised'];
    const weights = [0.5, 0.15, 0.15, 0.1, 0.1]; // 중립이 가장 많이 나오도록

    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < emotions.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        return emotions[i];
      }
    }

    return 'neutral';
  }, []);

  // 감정 감지 루프
  const detectEmotion = useCallback(() => {
    if (!isActive || !videoRef.current) return;

    const emotion = analyzeEmotion();
    const confidence = 0.7 + Math.random() * 0.25; // 70-95% 신뢰도

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
  }, [isActive, analyzeEmotion, onEmotionChange]);

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
      detectionIntervalRef.current = setInterval(detectEmotion, detectionInterval);

      return true;
    } catch (error) {
      console.error('[FaceDetection] Failed to start:', error);
      setIsLoading(false);
      return false;
    }
  }, [enabled, startWebcam, detectEmotion, detectionInterval]);

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

  // 감지 루프 업데이트
  useEffect(() => {
    if (isActive && !detectionIntervalRef.current) {
      detectionIntervalRef.current = setInterval(detectEmotion, detectionInterval);
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [isActive, detectEmotion, detectionInterval]);

  return {
    isLoading,
    isActive,
    isPermissionGranted,
    currentEmotion,
    emotionTimeline,
    emotionDistribution,
    dominantEmotion,
    videoRef,
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

// 감정 이름 한글화
export const emotionLabels: Record<EmotionType, string> = {
  neutral: '집중',
  happy: '만족',
  confused: '혼란',
  anxious: '불안',
  sad: '슬픔',
  surprised: '놀람',
  angry: '화남',
};

// 감정 아이콘
export const emotionIcons: Record<EmotionType, string> = {
  neutral: '😐',
  happy: '😊',
  confused: '😕',
  anxious: '😰',
  sad: '😢',
  surprised: '😮',
  angry: '😠',
};

// 감정 색상
export const emotionColors: Record<EmotionType, string> = {
  neutral: '#6B7280',
  happy: '#10B981',
  confused: '#F59E0B',
  anxious: '#EF4444',
  sad: '#3B82F6',
  surprised: '#8B5CF6',
  angry: '#DC2626',
};

export default useFaceDetection;
