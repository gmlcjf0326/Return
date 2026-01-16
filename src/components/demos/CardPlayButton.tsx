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
      className={`absolute top-4 right-4 w-10 h-10 ${colors} rounded-full flex items-center justify-center transition-all hover:scale-110`}
      aria-label="데모 재생"
      title="데모 재생"
    >
      <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  );
}
