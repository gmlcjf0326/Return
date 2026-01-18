'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { EmotionType } from '@/hooks/useFaceDetection';
import { emotionIcons } from '@/hooks/useFaceDetection';

interface CameraPreviewProps {
  stream: MediaStream | null;
  currentEmotion: EmotionType;
  onStop: () => void;
}

export default function CameraPreview({ stream, currentEmotion, onStop }: CameraPreviewProps) {
  const previewRef = useRef<HTMLVideoElement>(null);
  const isPlayingRef = useRef(false);

  const tryPlay = useCallback(async (video: HTMLVideoElement) => {
    if (isPlayingRef.current) return;

    try {
      isPlayingRef.current = true;
      // 비디오가 준비될 때까지 대기
      if (video.readyState < 2) {
        await new Promise<void>((resolve) => {
          const onCanPlay = () => {
            video.removeEventListener('canplay', onCanPlay);
            resolve();
          };
          video.addEventListener('canplay', onCanPlay);
          // 타임아웃 설정
          setTimeout(() => {
            video.removeEventListener('canplay', onCanPlay);
            resolve();
          }, 1000);
        });
      }
      await video.play();
    } catch (err) {
      // AbortError는 무시 (새로운 로드 요청으로 인한 정상적인 중단)
      if (err instanceof Error && err.name !== 'AbortError') {
        console.warn('[CameraPreview] Play failed:', err);
      }
    } finally {
      isPlayingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const video = previewRef.current;
    if (!video || !stream) return;

    // 스트림이 이미 할당되어 있으면 스킵
    if (video.srcObject === stream) return;

    video.srcObject = stream;
    tryPlay(video);

    return () => {
      // cleanup: 스트림 연결 해제하지 않음 (useFaceDetection에서 관리)
    };
  }, [stream, tryPlay]);

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <div className="relative">
        <video
          ref={previewRef}
          className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-lg"
          autoPlay
          playsInline
          muted
        />
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
          <span className="text-lg">{emotionIcons[currentEmotion]}</span>
        </div>
        <button
          onClick={onStop}
          className="absolute -top-1 -left-1 w-5 h-5 bg-[var(--neutral-800)] text-white rounded-full text-xs flex items-center justify-center hover:bg-[var(--danger)] transition-colors"
          title="카메라 끄기"
        >
          ×
        </button>
      </div>
    </div>
  );
}
