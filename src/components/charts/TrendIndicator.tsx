'use client';

interface TrendIndicatorProps {
  value: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TrendIndicator({
  value,
  showValue = true,
  size = 'md',
  className = '',
}: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (isNeutral) {
    return (
      <span className={`inline-flex items-center gap-1 text-slate-500 ${sizeClasses[size]} ${className}`}>
        <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
        {showValue && <span>변화없음</span>}
      </span>
    );
  }

  if (isPositive) {
    return (
      <span className={`inline-flex items-center gap-1 text-green-600 ${sizeClasses[size]} ${className}`}>
        <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        {showValue && <span>+{value}</span>}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-red-500 ${sizeClasses[size]} ${className}`}>
      <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
      {showValue && <span>{value}</span>}
    </span>
  );
}

export default TrendIndicator;
