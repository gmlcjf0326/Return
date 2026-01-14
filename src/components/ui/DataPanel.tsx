'use client';

import { forwardRef, type HTMLAttributes } from 'react';

interface DataPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: number | string;
  label: string;
  unit?: string;
  status?: 'normal' | 'caution' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const DataPanel = forwardRef<HTMLDivElement, DataPanelProps>(
  (
    {
      value,
      label,
      unit = '/100',
      status,
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: {
        container: 'p-3',
        value: 'text-2xl',
        label: 'text-xs',
        unit: 'text-sm',
      },
      md: {
        container: 'p-4',
        value: 'text-3xl',
        label: 'text-sm',
        unit: 'text-base',
      },
      lg: {
        container: 'p-6',
        value: 'text-4xl',
        label: 'text-base',
        unit: 'text-lg',
      },
    };

    const statusColors = {
      normal: 'text-[var(--success)]',
      caution: 'text-[var(--warning)]',
      warning: 'text-orange-500',
      danger: 'text-[var(--danger)]',
    };

    const statusBorders = {
      normal: 'border-[var(--success)]',
      caution: 'border-[var(--warning)]',
      warning: 'border-orange-500',
      danger: 'border-[var(--danger)]',
    };

    return (
      <div
        ref={ref}
        className={`
          flex flex-col items-center ${sizes[size].container}
          bg-white rounded-xl
          border-2 ${status ? statusBorders[status] : 'border-[var(--neutral-200)]'}
          ${className}
        `}
        {...props}
      >
        <div className={`font-bold ${sizes[size].value} ${status ? statusColors[status] : 'text-[var(--primary-deep)]'}`}>
          {value}
        </div>
        {unit && (
          <div className={`${sizes[size].unit} text-[var(--neutral-400)] -mt-1`}>
            {unit}
          </div>
        )}
        <div className={`${sizes[size].label} text-[var(--neutral-500)] mt-1 text-center`}>
          {label}
        </div>
      </div>
    );
  }
);

DataPanel.displayName = 'DataPanel';

export default DataPanel;
