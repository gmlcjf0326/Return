'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

type StatusType = 'normal' | 'caution' | 'warning' | 'danger' | 'info' | 'inactive' | 'pending' | 'error';

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  icon?: ReactNode;
}

const statusConfig: Record<StatusType, { bg: string; text: string; dot: string; label: string }> = {
  normal: {
    bg: 'bg-[var(--success-light)]',
    text: 'text-emerald-800',
    dot: 'bg-[var(--success)]',
    label: '정상',
  },
  caution: {
    bg: 'bg-[var(--warning-light)]',
    text: 'text-amber-800',
    dot: 'bg-[var(--warning)]',
    label: '주의',
  },
  warning: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    dot: 'bg-orange-500',
    label: '경고',
  },
  danger: {
    bg: 'bg-[var(--danger-light)]',
    text: 'text-red-800',
    dot: 'bg-[var(--danger)]',
    label: '위험',
  },
  info: {
    bg: 'bg-[var(--info-light)]',
    text: 'text-purple-800',
    dot: 'bg-[var(--info)]',
    label: '정보',
  },
  inactive: {
    bg: 'bg-[var(--neutral-100)]',
    text: 'text-[var(--neutral-600)]',
    dot: 'bg-[var(--neutral-400)]',
    label: '비활성',
  },
  pending: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
    label: '준비 중',
  },
  error: {
    bg: 'bg-[var(--danger-light)]',
    text: 'text-red-800',
    dot: 'bg-[var(--danger)]',
    label: '에러',
  },
};

const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    {
      status,
      size = 'md',
      showDot = true,
      icon,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const config = statusConfig[status];

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    };

    const dotSizes = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1.5
          ${sizes[size]}
          ${config.bg} ${config.text}
          font-medium rounded-full
          ${className}
        `}
        {...props}
      >
        {icon || (showDot && (
          <span className={`${dotSizes[size]} ${config.dot} rounded-full`} />
        ))}
        {children || config.label}
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
