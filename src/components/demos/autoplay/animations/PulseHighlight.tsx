'use client';

interface PulseHighlightProps {
  x: number; // percentage
  y: number; // percentage
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PulseHighlight({ x, y, label, size = 'md' }: PulseHighlightProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const ringSize = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Pulse ring */}
      <div className="relative flex items-center justify-center">
        <div className={`absolute ${ringSize[size]} bg-white/20 rounded-full animate-pulse-ring`} />
        <div className={`absolute ${ringSize[size]} bg-white/10 rounded-full animate-pulse-ring`} style={{ animationDelay: '0.6s' }} />

        {/* Center dot */}
        <div className={`${sizeClasses[size]} bg-white/50 rounded-full flex items-center justify-center backdrop-blur-sm`}>
          <svg
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Label */}
      {label && (
        <div className="mt-2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs whitespace-nowrap text-center">
          {label}
        </div>
      )}
    </div>
  );
}
