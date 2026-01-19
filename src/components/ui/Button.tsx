'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

    const variants = {
      primary:
        'bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)] focus-visible:ring-[var(--primary)] active:scale-[0.98]',
      secondary:
        'bg-white text-[var(--primary)] border-2 border-[var(--primary)] hover:bg-[var(--primary-lighter)] focus-visible:ring-[var(--primary)]',
      outline:
        'bg-transparent text-[var(--neutral-700)] border-2 border-[var(--neutral-300)] hover:border-[var(--neutral-400)] hover:bg-[var(--neutral-50)] focus-visible:ring-[var(--neutral-400)]',
      ghost:
        'bg-transparent text-[var(--neutral-700)] hover:bg-[var(--neutral-100)] focus-visible:ring-[var(--neutral-400)]',
      danger:
        'bg-[var(--danger)] text-white hover:bg-red-600 focus-visible:ring-[var(--danger)]',
    };

    const sizes = {
      sm: 'min-h-[44px] sm:min-h-[48px] px-3 sm:px-4 text-sm',
      md: 'min-h-[48px] sm:min-h-[52px] px-4 sm:px-5 text-sm sm:text-base',
      lg: 'min-h-[52px] sm:min-h-[56px] px-5 sm:px-6 text-base sm:text-lg',
      xl: 'min-h-[56px] sm:min-h-[64px] px-6 sm:px-8 text-lg sm:text-xl',
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
