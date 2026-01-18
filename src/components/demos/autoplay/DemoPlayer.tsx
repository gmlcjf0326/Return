'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DemoPlayerProps, Scene } from './types';
import { assessmentDemoData, trainingDemoData } from './data';
import { AssessmentScene, TrainingScene } from './scenes';
import { DemoControls } from './DemoControls';
import { DemoProgress } from './DemoProgress';

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
    }
  }, [isLastScene, onClose]);

  // 씬 타이머 및 진행률 관리
  useEffect(() => {
    if (!isPlaying || !currentScene) return;

    // 진행률 업데이트 (50ms마다)
    const progressInterval = 50;
    const totalSteps = currentScene.duration / progressInterval;
    let currentStep = 0;

    progressRef.current = setInterval(() => {
      currentStep++;
      setSceneProgress((currentStep / totalSteps) * 100);
    }, progressInterval);

    // 씬 전환 타이머
    timerRef.current = setTimeout(() => {
      goToNextScene();
    }, currentScene.duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
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
        <>
          {/* 씬 화면 */}
          {type === 'assessment' ? (
            <AssessmentScene screenType={scene.screenType} />
          ) : (
            <TrainingScene screenType={scene.screenType} />
          )}

          {/* 액션 라벨 표시 (커서 대신 하단에 안내 텍스트) */}
          {scene.actionLabel && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-[var(--neutral-800)]/90 text-white text-sm rounded-full shadow-lg animate-fade-in">
              👆 {scene.actionLabel}
            </div>
          )}
        </>
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

        {/* 씬 컨텐츠 - 패딩은 바깥에, relative 컨테이너는 안쪽에 */}
        <div className="h-full pt-16 pb-32">
          <div
            className={`relative h-full transition-opacity duration-300 ${
              currentScene.transition === 'fade' ? 'animate-fade-in' : ''
            }`}
            key={currentScene.id}
          >
            {renderSceneContent(currentScene)}
          </div>
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

        /* 커서 진입 애니메이션 */
        @keyframes cursor-enter {
          0% {
            opacity: 0;
            transform: translate(-30px, -40px);
          }
          40% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: translate(0, 0);
          }
        }
        .animate-cursor-enter {
          animation: cursor-enter 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
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
