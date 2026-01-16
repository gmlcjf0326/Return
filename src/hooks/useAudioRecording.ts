'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// 녹음 상태
export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

// 녹음 결과
export interface RecordingResult {
  blob: Blob;
  url: string;
  base64: string;
  duration: number; // ms
  mimeType: string;
}

// 훅 옵션
interface UseAudioRecordingOptions {
  maxDuration?: number; // 최대 녹음 시간 (ms)
  onMaxDurationReached?: () => void;
}

// 훅 반환 타입
interface UseAudioRecordingReturn {
  isSupported: boolean;
  state: RecordingState;
  duration: number; // 현재 녹음 시간 (ms)
  recording: RecordingResult | null;
  error: string | null;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<RecordingResult | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearRecording: () => void;
}

/**
 * 오디오 녹음 훅
 * MediaRecorder API를 사용하여 마이크 녹음 기능 제공
 */
export function useAudioRecording(options: UseAudioRecordingOptions = {}): UseAudioRecordingReturn {
  const { maxDuration = 60000, onMaxDurationReached } = options;

  const [isSupported, setIsSupported] = useState(true);
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [recording, setRecording] = useState<RecordingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 브라우저 지원 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = typeof navigator.mediaDevices?.getUserMedia === 'function' && typeof window.MediaRecorder === 'function';
      setIsSupported(supported);
      if (!supported) {
        setError('이 브라우저는 오디오 녹음을 지원하지 않습니다.');
      }
    }
  }, []);

  // 녹음 시간 타이머
  useEffect(() => {
    if (state === 'recording') {
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);

        // 최대 녹음 시간 도달
        if (elapsed >= maxDuration) {
          if (onMaxDurationReached) {
            onMaxDurationReached();
          }
        }
      }, 100);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [state, maxDuration, onMaxDurationReached]);

  // Blob을 Base64로 변환
  const blobToBase64 = useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // data:audio/webm;base64, 부분 제거
        const base64Data = base64.split(',')[1] || '';
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  // 녹음 시작
  const startRecording = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('오디오 녹음이 지원되지 않습니다.');
      return false;
    }

    try {
      setError(null);
      audioChunksRef.current = [];

      // 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // MediaRecorder 설정
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100); // 100ms마다 데이터 수집
      startTimeRef.current = Date.now();
      setState('recording');
      setDuration(0);

      return true;
    } catch (err) {
      console.error('[AudioRecording] Failed to start:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
        } else if (err.name === 'NotFoundError') {
          setError('마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.');
        } else {
          setError(`녹음 시작 실패: ${err.message}`);
        }
      }
      return false;
    }
  }, [isSupported]);

  // 녹음 중지
  const stopRecording = useCallback(async (): Promise<RecordingResult | null> => {
    if (!mediaRecorderRef.current || state === 'idle' || state === 'stopped') {
      return null;
    }

    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;

      mediaRecorder.onstop = async () => {
        // 스트림 정리
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Blob 생성
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const base64 = await blobToBase64(blob);
        const finalDuration = Date.now() - startTimeRef.current;

        const result: RecordingResult = {
          blob,
          url,
          base64,
          duration: finalDuration,
          mimeType,
        };

        setRecording(result);
        setState('stopped');
        setDuration(finalDuration);
        resolve(result);
      };

      mediaRecorder.stop();
    });
  }, [state, blobToBase64]);

  // 녹음 일시정지
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.pause();
      setState('paused');
    }
  }, [state]);

  // 녹음 재개
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'paused') {
      mediaRecorderRef.current.resume();
      setState('recording');
    }
  }, [state]);

  // 녹음 결과 초기화
  const clearRecording = useCallback(() => {
    if (recording?.url) {
      URL.revokeObjectURL(recording.url);
    }
    setRecording(null);
    setState('idle');
    setDuration(0);
    setError(null);
    audioChunksRef.current = [];
  }, [recording]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recording?.url) {
        URL.revokeObjectURL(recording.url);
      }
    };
  }, [recording]);

  return {
    isSupported,
    state,
    duration,
    recording,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
  };
}

/**
 * 녹음 시간 포맷팅 유틸리티
 * @param ms 밀리초
 * @returns "0:00" 형식 문자열
 */
export function formatRecordingDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default useAudioRecording;
