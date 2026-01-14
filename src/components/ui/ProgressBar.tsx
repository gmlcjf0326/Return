'use client';

import { forwardRef, type HTMLAttributes } from 'react';

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  labelPosition?: 'top' | 'right' | 'inside';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      showLabel = false,
      labelPosition = 'right',
      size = 'md',
      variant = 'default',
      className = '',
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    };

    const variants = {
      default: 'from-[var(--primary)] to-[var(--primary-light)]',
      success: 'from-[var(--success)] to-emerald-400',
      warning: 'from-[var(--warning)] to-amber-400',
      danger: 'from-[var(--danger)] to-red-400',
    };

    const label = (
      <span className="text-sm font-medium text-[var(--neutral-600)]">
        {Math.round(percentage)}%
      </span>
    );

    return (
      <div
        ref={ref}
        className={`w-full ${className}`}
        {...props}
      >
        {showLabel && labelPosition === 'top' && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[var(--neutral-500)]">진행률</span>
            {label}
          </div>
        )}
        <div className={`flex items-center gap-3 ${labelPosition === 'right' ? '' : ''}`}>
          <div className={`flex-1 bg-[var(--neutral-200)] rounded-full overflow-hidden ${sizes[size]}`}>
            <div
              className={`h-full bg-gradient-to-r ${variants[variant]} rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${percentage}%` }}
            >
              {showLabel && labelPosition === 'inside' && percentage > 15 && (
                <span className="text-xs text-white font-medium flex items-center justify-center h-full">
                  {Math.round(percentage)}%
                </span>
              )}
            </div>
          </div>
          {showLabel && labelPosition === 'right' && label}
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
