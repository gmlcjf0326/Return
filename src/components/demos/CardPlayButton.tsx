'use client';

interface CardPlayButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'emerald';
}

export function CardPlayButton({ onClick, variant = 'primary' }: CardPlayButtonProps) {
  const colors = variant === 'primary'
    ? 'bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)]'
    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600';

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`absolute top-3 right-3 w-12 h-12 ${colors} rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 touch-manipulation`}
      aria-label="데모 재생"
      title="데모 재생"
      style={{ minWidth: '48px', minHeight: '48px' }}
    >
      <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  );
}
