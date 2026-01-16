'use client';

import { useState, useEffect } from 'react';

interface ClickRippleProps {
  x: number; // percentage
  y: number; // percentage
  onComplete?: () => void;
}

export function ClickRipple({ x, y, onComplete }: ClickRippleProps) {
  const [showRipple, setShowRipple] = useState(false);

  useEffect(() => {
    // Start ripple after cursor animation
    const rippleTimeout = setTimeout(() => {
      setShowRipple(true);
    }, 400);

    // Complete after ripple
    const completeTimeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1000);

    return () => {
      clearTimeout(rippleTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Cursor */}
      <div className="animate-cursor-move">
        <svg
          className="w-6 h-6 text-white drop-shadow-lg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
        </svg>
      </div>

      {/* Ripple effect */}
      {showRipple && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-white/40 rounded-full animate-ripple" />
          <div className="absolute w-8 h-8 bg-white/20 rounded-full animate-ripple" style={{ animationDelay: '0.1s' }} />
        </div>
      )}
    </div>
  );
}
