'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { initTensorFlow } from '@/lib/ai/tensorflow';

// 타입만 import (런타임 번들에 포함되지 않음)
import type * as poseDetectionTypes from '@tensorflow-models/pose-detection';
import type * as handPoseDetectionTypes from '@tensorflow-models/hand-pose-detection';
import type * as faceLandmarksDetectionTypes from '@tensorflow-models/face-landmarks-detection';

// 키포인트 타입
export interface Keypoint {
  x: number;
  y: number;
  score?: number;
  name?: string;
}

// 손 키포인트 타입
export interface HandKeypoint {
  x: number;
  y: number;
  name?: string;
}

// 얼굴 키포인트 타입
export interface FaceKeypoint {
  x: number;
  y: number;
  name?: string;
}

// 자세 타입 및 상수 (constants 파일에서 re-export)
export type { PostureType } from '@/lib/constants/poseConstants';
export { postureLabels, postureIcons, postureColors } from '@/lib/constants/poseConstants';
import type { PostureType } from '@/lib/constants/poseConstants';

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
  enableHandDetection?: boolean; // 손 감지 활성화
  enableFaceDetection?: boolean; // 얼굴 감지 활성화
  onPostureChange?: (posture: PostureType, angle: number) => void;
  onKeypointsDetected?: (keypoints: Keypoint[]) => void;
  onHandsDetected?: (hands: { left: HandKeypoint[]; right: HandKeypoint[] }) => void;
  onFaceDetected?: (faceKeypoints: FaceKeypoint[]) => void;
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
  leftHandKeypoints: HandKeypoint[];
  rightHandKeypoints: HandKeypoint[];
  faceKeypoints: FaceKeypoint[];
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

// 손 스켈레톤 연결 정의 (21개 키포인트)
const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // index finger
  [0, 9], [9, 10], [10, 11], [11, 12],  // middle finger
  [0, 13], [13, 14], [14, 15], [15, 16], // ring finger
  [0, 17], [17, 18], [18, 19], [19, 20], // pinky
  [5, 9], [9, 13], [13, 17],            // palm
];

// 얼굴 윤곽선 인덱스 (MediaPipe FaceMesh 468 포인트 중 주요 윤곽)
const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
];

// 입술 외곽선 인덱스
const LIPS_OUTER_INDICES = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185
];

// 왼쪽 눈 인덱스
const LEFT_EYE_INDICES = [
  263, 249, 390, 373, 374, 380, 381, 382, 362, 466, 388, 387, 386, 385, 384, 398
];

// 오른쪽 눈 인덱스
const RIGHT_EYE_INDICES = [
  33, 7, 163, 144, 145, 153, 154, 155, 133, 246, 161, 160, 159, 158, 157, 173
];

// 왼쪽 눈썹 인덱스
const LEFT_EYEBROW_INDICES = [276, 283, 282, 295, 300];

// 오른쪽 눈썹 인덱스
const RIGHT_EYEBROW_INDICES = [46, 53, 52, 65, 70];

// 코 윤곽 인덱스 (코 중심선 및 콧날)
const NOSE_BRIDGE_INDICES = [168, 6, 197, 195, 5];
const NOSE_TIP_INDICES = [1, 2, 98, 327, 2];

// 왼쪽 눈동자(iris) 인덱스
const LEFT_IRIS_INDICES = [468, 469, 470, 471, 472];

// 오른쪽 눈동자(iris) 인덱스
const RIGHT_IRIS_INDICES = [473, 474, 475, 476, 477];

// 상체 키포인트 인덱스 (0-12: 머리, 어깨, 팔꿈치, 손목, 엉덩이)
const UPPER_BODY_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function usePoseDetection(options: UsePoseDetectionOptions = {}): UsePoseDetectionReturn {
  const {
    enabled = true,
    detectionInterval = 100, // 더 빠른 감지를 위해 100ms로 변경
    tiltThreshold = 15,
    enableHandDetection = true, // 기본값: 손 감지 활성화
    enableFaceDetection = true, // 기본값: 얼굴 감지 활성화
    onPostureChange,
    onKeypointsDetected,
    onHandsDetected,
    onFaceDetected,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentPosture, setCurrentPosture] = useState<PostureType>('unknown');
  const [currentTiltAngle, setCurrentTiltAngle] = useState(0);
  const [postureTimeline, setPostureTimeline] = useState<PostureRecord[]>([]);
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [leftHandKeypoints, setLeftHandKeypoints] = useState<HandKeypoint[]>([]);
  const [rightHandKeypoints, setRightHandKeypoints] = useState<HandKeypoint[]>([]);
  const [faceKeypoints, setFaceKeypoints] = useState<FaceKeypoint[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<poseDetectionTypes.PoseDetector | null>(null);
  const handDetectorRef = useRef<handPoseDetectionTypes.HandDetector | null>(null);
  const faceDetectorRef = useRef<faceLandmarksDetectionTypes.FaceLandmarksDetector | null>(null);
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

      // Video track is ready

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.filter = 'none';
        await videoRef.current.play();
      }

      streamRef.current = stream;
      return true;
    } catch {
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

  // MoveNet 모델 초기화 (지연 로딩)
  const initDetector = useCallback(async (): Promise<boolean> => {
    try {
      // 동적 import로 번들 크기 최적화
      const poseDetection = await import('@tensorflow-models/pose-detection');
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          // THUNDER 모델: 더 정확한 키포인트 감지 (LIGHTNING보다 느리지만 정확도 높음)
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
          enableSmoothing: true,
          minPoseScore: 0.4, // 노이즈 감소를 위해 임계값 상향 (0.2 → 0.4)
        }
      );

      detectorRef.current = detector;
      return true;
    } catch {
      return false;
    }
  }, []);

  // MediaPipe Hands 모델 초기화 (지연 로딩)
  const initHandDetector = useCallback(async (): Promise<boolean> => {
    if (!enableHandDetection) return true;

    try {
      // 동적 import로 번들 크기 최적화
      const handPoseDetection = await import('@tensorflow-models/hand-pose-detection');
      const detector = await handPoseDetection.createDetector(
        handPoseDetection.SupportedModels.MediaPipeHands,
        {
          runtime: 'tfjs',
          maxHands: 2,
        }
      );

      handDetectorRef.current = detector;
      return true;
    } catch {
      return false;
    }
  }, [enableHandDetection]);

  // MediaPipe FaceMesh 모델 초기화 (지연 로딩)
  const initFaceDetector = useCallback(async (): Promise<boolean> => {
    if (!enableFaceDetection) return true;

    try {
      // 동적 import로 번들 크기 최적화
      const faceLandmarksDetection = await import('@tensorflow-models/face-landmarks-detection');
      const detector = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: 'tfjs',
          maxFaces: 1,
          refineLandmarks: true, // 얼굴 정제 활성화 (false → true)
        }
      );

      faceDetectorRef.current = detector;
      return true;
    } catch {
      return false;
    }
  }, [enableFaceDetection]);

  // 손 랜드마크 그리기
  const drawHandLandmarks = useCallback((
    ctx: CanvasRenderingContext2D,
    handKeypoints: HandKeypoint[],
    handedness: 'left' | 'right'
  ) => {
    if (handKeypoints.length === 0) return;

    // 손 색상: 왼손 = 주황색, 오른손 = 청록색
    const color = handedness === 'left' ? '#FF6B35' : '#00D4AA';

    // 손 스켈레톤 그리기
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const start = handKeypoints[startIdx];
      const end = handKeypoints[endIdx];

      if (start && end) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    }

    // 손 키포인트 그리기
    for (const kp of handKeypoints) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }
  }, []);

  // 얼굴 랜드마크 그리기 (네모 박스 + 키포인트 점)
  const drawFaceLandmarks = useCallback((
    ctx: CanvasRenderingContext2D,
    faceKps: FaceKeypoint[]
  ) => {
    if (faceKps.length === 0) return;

    // 1. 얼굴 바운딩 박스 계산
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const kp of faceKps) {
      if (kp.x < minX) minX = kp.x;
      if (kp.y < minY) minY = kp.y;
      if (kp.x > maxX) maxX = kp.x;
      if (kp.y > maxY) maxY = kp.y;
    }

    // 패딩 추가
    const padding = 15;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // 바운딩 박스 그리기 (초록색 테두리, 실선)
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 3;
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);

    // "얼굴 인식" 라벨 추가
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('얼굴 인식', minX, minY - 5);

    // 2. 주요 키포인트만 점으로 표시

    // 점 그리기 함수 (크기 확대: 가시성 향상)
    const drawPoint = (x: number, y: number, color: string, size: number = 5) => {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      // 테두리 추가로 가시성 향상
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    // 중심점 계산 함수
    const getCenterPoint = (indices: number[]): { x: number; y: number } | null => {
      let sumX = 0, sumY = 0, count = 0;
      for (const idx of indices) {
        const kp = faceKps[idx];
        if (kp) {
          sumX += kp.x;
          sumY += kp.y;
          count++;
        }
      }
      return count > 0 ? { x: sumX / count, y: sumY / count } : null;
    };

    // 왼쪽 눈 중심 (하늘색) - 크기 확대
    const leftEyeCenter = getCenterPoint(LEFT_EYE_INDICES);
    if (leftEyeCenter) {
      drawPoint(leftEyeCenter.x, leftEyeCenter.y, '#87CEEB', 8);
    }

    // 오른쪽 눈 중심 (하늘색) - 크기 확대
    const rightEyeCenter = getCenterPoint(RIGHT_EYE_INDICES);
    if (rightEyeCenter) {
      drawPoint(rightEyeCenter.x, rightEyeCenter.y, '#87CEEB', 8);
    }

    // 코끝 (연두색) - 인덱스 1번이 코끝 - 크기 확대
    const noseTip = faceKps[1];
    if (noseTip) {
      drawPoint(noseTip.x, noseTip.y, '#90EE90', 7);
    }

    // 입술 중심 (핑크색) - 크기 확대
    const mouthCenter = getCenterPoint(LIPS_OUTER_INDICES);
    if (mouthCenter) {
      drawPoint(mouthCenter.x, mouthCenter.y, '#FFB6C1', 8);
    }

    // 왼쪽 눈썹 중심 (연보라색) - 크기 확대
    const leftEyebrowCenter = getCenterPoint(LEFT_EYEBROW_INDICES);
    if (leftEyebrowCenter) {
      drawPoint(leftEyebrowCenter.x, leftEyebrowCenter.y, '#DDA0DD', 5);
    }

    // 오른쪽 눈썹 중심 (연보라색) - 크기 확대
    const rightEyebrowCenter = getCenterPoint(RIGHT_EYEBROW_INDICES);
    if (rightEyebrowCenter) {
      drawPoint(rightEyebrowCenter.x, rightEyebrowCenter.y, '#DDA0DD', 5);
    }

    // 얼굴 윤곽 대표점 (턱 중앙 - 인덱스 152) - 크기 확대
    const chin = faceKps[152];
    if (chin) {
      drawPoint(chin.x, chin.y, '#FFFFFF', 5);
    }
  }, []);

  // 키포인트를 캔버스에 그리기
  const drawKeypoints = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

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

    // 1. 신체 스켈레톤 그리기 (녹색) - 상체 강조
    if (keypoints.length > 0) {
      // 스켈레톤 연결선 그리기 (두께 증가: 3 → 4)
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 4;

      for (const [startIdx, endIdx] of SKELETON_CONNECTIONS) {
        const start = keypoints[startIdx];
        const end = keypoints[endIdx];

        if (start && end && (start.score || 0) > 0.4 && (end.score || 0) > 0.4) {
          // 상체 연결선은 더 두껍게
          const isUpperBodyConnection = UPPER_BODY_INDICES.includes(startIdx) && UPPER_BODY_INDICES.includes(endIdx);
          ctx.lineWidth = isUpperBodyConnection ? 5 : 3;
          ctx.globalAlpha = isUpperBodyConnection ? 1.0 : 0.6;

          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1.0;

      // 신체 키포인트 그리기 (원) - 상체 강조
      keypoints.forEach((kp, idx) => {
        if ((kp.score || 0) > 0.4) {
          const isUpperBody = UPPER_BODY_INDICES.includes(idx);
          // 상체: 큰 원 (12/7), 하체: 작은 원 (7/4) + 반투명
          const outerRadius = isUpperBody ? 12 : 7;
          const innerRadius = isUpperBody ? 7 : 4;

          ctx.globalAlpha = isUpperBody ? 1.0 : 0.5;

          // 외곽 원 (녹색)
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, outerRadius, 0, 2 * Math.PI);
          ctx.fillStyle = '#00FF00';
          ctx.fill();

          // 내부 원 (흰색)
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, innerRadius, 0, 2 * Math.PI);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0;
    }

    // 2. 손 랜드마크 그리기
    drawHandLandmarks(ctx, leftHandKeypoints, 'left');
    drawHandLandmarks(ctx, rightHandKeypoints, 'right');

    // 3. 얼굴 랜드마크 그리기
    drawFaceLandmarks(ctx, faceKeypoints);

    ctx.restore();
  }, [keypoints, leftHandKeypoints, rightHandKeypoints, faceKeypoints, drawHandLandmarks, drawFaceLandmarks]);

  // 자세 분석 (실제 키포인트 기반)
  const analyzePostureFromKeypoints = useCallback((kps: Keypoint[]): { posture: PostureType; angle: number } => {
    // 어깨 키포인트 찾기
    const leftShoulder = kps[5];
    const rightShoulder = kps[6];

    if (!leftShoulder || !rightShoulder ||
        (leftShoulder.score || 0) < 0.4 || (rightShoulder.score || 0) < 0.4) {
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
    if (!isActive || !videoRef.current) {
      return;
    }

    // 비디오 dimension이 유효한지 검증 (texture size [0x0] 에러 방지)
    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight || video.videoWidth === 0 || video.videoHeight === 0) {
      // 비디오가 준비될 때까지 대기
      if (isActive) {
        animationFrameRef.current = requestAnimationFrame(detectPose);
      }
      return;
    }

    try {
      // 1. 신체 포즈 감지
      if (detectorRef.current) {
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
      }

      // 2. 손 감지
      if (handDetectorRef.current && enableHandDetection) {
        const hands = await handDetectorRef.current.estimateHands(videoRef.current);

        let leftHand: HandKeypoint[] = [];
        let rightHand: HandKeypoint[] = [];

        for (const hand of hands) {
          const handKeypoints = hand.keypoints.map((kp) => ({
            x: kp.x,
            y: kp.y,
            name: kp.name,
          }));

          // 카메라 미러링으로 인해 handedness가 반대로 감지됨
          if (hand.handedness === 'Left') {
            rightHand = handKeypoints;
          } else {
            leftHand = handKeypoints;
          }
        }

        setLeftHandKeypoints(leftHand);
        setRightHandKeypoints(rightHand);

        if (onHandsDetected) {
          onHandsDetected({ left: leftHand, right: rightHand });
        }
      }

      // 3. 얼굴 감지
      if (faceDetectorRef.current && enableFaceDetection) {
        const faces = await faceDetectorRef.current.estimateFaces(videoRef.current);

        if (faces.length > 0 && faces[0].keypoints) {
          const detectedFaceKeypoints = faces[0].keypoints.map((kp) => ({
            x: kp.x,
            y: kp.y,
            name: kp.name,
          }));

          setFaceKeypoints(detectedFaceKeypoints);

          if (onFaceDetected) {
            onFaceDetected(detectedFaceKeypoints);
          }
        } else {
          setFaceKeypoints([]);
        }
      }
    } catch {
      // Detection error - continue to next frame
    }

    // 다음 프레임 예약
    if (isActive) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
    }
  }, [isActive, enableHandDetection, enableFaceDetection, analyzePostureFromKeypoints, onKeypointsDetected, onPostureChange, onHandsDetected, onFaceDetected]);

  // 키포인트 변경 시 캔버스에 그리기
  useEffect(() => {
    if (keypoints.length > 0 || leftHandKeypoints.length > 0 || rightHandKeypoints.length > 0 || faceKeypoints.length > 0) {
      drawKeypoints();
    }
  }, [keypoints, leftHandKeypoints, rightHandKeypoints, faceKeypoints, drawKeypoints]);

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

      // 비디오가 로드되고 dimension이 유효할 때까지 대기 (이벤트 기반)
      await new Promise<void>((resolve) => {
        const video = videoRef.current;
        if (!video) {
          resolve();
          return;
        }

        // 이미 준비된 경우
        if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          resolve();
          return;
        }

        // 이벤트 리스너로 대기 (loadeddata 이벤트 사용)
        const onLoadedData = () => {
          video.removeEventListener('loadeddata', onLoadedData);
          resolve();
        };
        video.addEventListener('loadeddata', onLoadedData);

        // 타임아웃 (5초로 단축)
        setTimeout(() => {
          video.removeEventListener('loadeddata', onLoadedData);
          resolve();
        }, 5000);
      });

      // 필요한 감지기만 초기화 (선택적 로딩)
      const loadPromises: Promise<boolean>[] = [initDetector()];

      if (enableHandDetection) {
        loadPromises.push(initHandDetector());
      }
      if (enableFaceDetection) {
        loadPromises.push(initFaceDetector());
      }

      await Promise.all(loadPromises);

      setIsActive(true);
      setIsLoading(false);

      // 감지 루프 시작
      animationFrameRef.current = requestAnimationFrame(detectPose);

      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  }, [startWebcam, initDetector, initHandDetector, initFaceDetector, detectPose, enableHandDetection, enableFaceDetection]);

  // 감지 중지
  const stopDetection = useCallback(() => {
    setIsActive(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // 모든 감지기 정리
    if (detectorRef.current) {
      detectorRef.current.dispose();
      detectorRef.current = null;
    }
    if (handDetectorRef.current) {
      handDetectorRef.current.dispose();
      handDetectorRef.current = null;
    }
    if (faceDetectorRef.current) {
      faceDetectorRef.current.dispose();
      faceDetectorRef.current = null;
    }

    stopWebcam();
    setKeypoints([]);
    setLeftHandKeypoints([]);
    setRightHandKeypoints([]);
    setFaceKeypoints([]);
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
      if (handDetectorRef.current) {
        handDetectorRef.current.dispose();
      }
      if (faceDetectorRef.current) {
        faceDetectorRef.current.dispose();
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
    leftHandKeypoints,
    rightHandKeypoints,
    faceKeypoints,
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

// 자세 상수는 '@/lib/constants/poseConstants'에서 re-export됨

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
