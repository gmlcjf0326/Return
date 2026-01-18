'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DemoPlayerProps, Scene } from './types';
import { assessmentDemoData, trainingDemoData } from './data';
import { AssessmentScene, TrainingScene } from './scenes';
import { DemoControls } from './DemoControls';
import { DemoProgress } from './DemoProgress';

// 클릭 애니메이션 컴포넌트 - 리플 효과만 표시 (커서 제거)
function CursorClickAnimation({ x, y, label, isActive }: { x: number; y: number; label?: string; isActive: boolean }) {
  const [phase, setPhase] = useState<'hidden' | 'ripple'>('hidden');

  useEffect(() => {
    if (!isActive) {
      setPhase('hidden');
      return;
    }

    // 리플 효과 시작
    const rippleTimer = setTimeout(() => setPhase('ripple'), 100);

    return () => {
      clearTimeout(rippleTimer);
    };
  }, [isActive, x, y]);

  if (!isActive) return null;

  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* 클릭 리플 효과만 표시 */}
      {phase === 'ripple' && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[var(--primary)]/40 rounded-full animate-ripple-out" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--primary)]/60 rounded-full animate-ripple-out-delay" />
          {/* 중앙 포인트 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--primary)] rounded-full" />
        </>
      )}

      {/* 라벨 */}
      {label && phase !== 'hidden' && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[var(--neutral-800)] rounded-lg text-white text-xs whitespace-nowrap shadow-lg animate-fade-in-up">
          {label}
        </div>
      )}
    </div>
  );
}

// 타이핑 애니메이션 텍스트 컴포넌트
function TypewriterText({ text, isActive, speed = 50 }: { text: string; isActive: boolean; speed?: number }) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!isActive) {
      setDisplayText('');
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    // 커서 깜빡임
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
    };
  }, [text, isActive, speed]);

  if (!isActive) return null;

  return (
    <span>
      {displayText}
      <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>|</span>
    </span>
  );
}

export function DemoPlayer({ type, onClose }: DemoPlayerProps) {
  const demoData = type === 'assessment' ? assessmentDemoData : trainingDemoData;
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [showClickAnimation, setShowClickAnimation] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const currentScene = demoData.scenes[currentSceneIndex];
  const isLastScene = currentSceneIndex === demoData.scenes.length - 1;

  // 다음 씬으로 이동
  const goToNextScene = useCallback(() => {
    if (isLastScene) {
      onClose();
    } else {
      setCurrentSceneIndex((prev) => prev + 1);
      setSceneProgress(0);
      setShowClickAnimation(false);
    }
  }, [isLastScene, onClose]);

  // 씬 타이머 및 진행률 관리
  useEffect(() => {
    if (!isPlaying || !currentScene) return;

    // 진행률 업데이트 (60fps 기준)
    const progressInterval = 50; // 50ms마다 업데이트
    const totalSteps = currentScene.duration / progressInterval;
    let currentStep = 0;

    progressRef.current = setInterval(() => {
      currentStep++;
      setSceneProgress((currentStep / totalSteps) * 100);
    }, progressInterval);

    // 액션 씬일 경우 클릭 애니메이션 타이밍
    let clickDelayTimer: NodeJS.Timeout | null = null;
    if (currentScene.type === 'action' && currentScene.highlight) {
      clickDelayTimer = setTimeout(() => {
        setShowClickAnimation(true);
      }, 200);
    }

    // 씬 전환 타이머 (모든 씬에 적용)
    timerRef.current = setTimeout(() => {
      goToNextScene();
    }, currentScene.duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      if (clickDelayTimer) clearTimeout(clickDelayTimer);
    };
  }, [currentSceneIndex, isPlaying, currentScene, goToNextScene]);

  // 재생/일시정지 토글
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // 건너뛰기
  const handleSkip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setShowClickAnimation(false);
    goToNextScene();
  };

  // 씬 컨텐츠 렌더링
  const renderSceneContent = (scene: Scene) => {
    if (scene.type === 'title') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-[var(--background)]">
          <h2 className="text-2xl font-bold text-[var(--neutral-800)] mb-3">{scene.title}</h2>
          <p className="text-[var(--neutral-600)]">{scene.description}</p>
        </div>
      );
    }

    if (scene.type === 'action') {
      return (
        <div className="relative h-full">
          {/* 이전 씬 화면 유지 */}
          {type === 'assessment' ? (
            <AssessmentScene screenType={scene.screenType} />
          ) : (
            <TrainingScene screenType={scene.screenType} />
          )}

          {/* 커서 클릭 애니메이션 */}
          {scene.highlight && (
            <CursorClickAnimation
              x={scene.highlight.x}
              y={scene.highlight.y}
              label={scene.actionLabel}
              isActive={showClickAnimation}
            />
          )}
        </div>
      );
    }

    // screen, result 타입
    if (type === 'assessment') {
      return <AssessmentScene screenType={scene.screenType} />;
    } else {
      return <TrainingScene screenType={scene.screenType} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70">
      {/* 데모 플레이어 컨테이너 - 모바일에서 전체화면에 가깝게 */}
      <div
        className="relative w-full max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl bg-[var(--background)] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[var(--neutral-200)]"
        style={{ height: 'min(92vh, 750px)' }}
      >
        {/* 헤더 - 간소화 (제목만 표시) */}
        <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 sm:p-4 bg-white/95 backdrop-blur-sm border-b border-[var(--neutral-200)]">
          <div className="flex items-center justify-between">
            <h3 className="text-[var(--neutral-800)] font-bold text-base sm:text-lg">{demoData.title}</h3>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] flex items-center justify-center transition-colors"
              aria-label="닫기"
            >
              <svg
                className="w-5 h-5 text-[var(--neutral-600)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 씬 컨텐츠 */}
        <div
          className={`h-full pt-16 pb-32 transition-opacity duration-300 ${
            currentScene.transition === 'fade' ? 'animate-fade-in' : ''
          }`}
          key={currentScene.id}
        >
          {renderSceneContent(currentScene)}
        </div>

        {/* 컨트롤 영역 - 실제 앱 스타일 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent">
          {/* 진행 표시 */}
          <div className="mb-4">
            <DemoProgress
              currentScene={currentSceneIndex}
              totalScenes={demoData.scenes.length}
              sceneProgress={sceneProgress}
            />
          </div>

          {/* 컨트롤 버튼 */}
          <DemoControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onClose={onClose}
          />
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translate(-50%, 8px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }

        /* 리플 확산 (기본) */
        @keyframes ripple-out {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
          }
        }
        .animate-ripple-out {
          animation: ripple-out 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        /* 리플 확산 (지연) */
        @keyframes ripple-out-delay {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.5);
            opacity: 0;
          }
        }
        .animate-ripple-out-delay {
          animation: ripple-out-delay 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          animation-delay: 0.15s;
        }
      `}</style>
    </div>
  );
}

// TypewriterText 컴포넌트 export (씬에서 사용 가능)
export { TypewriterText };
