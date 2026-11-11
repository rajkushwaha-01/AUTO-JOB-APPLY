import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      icon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-[4px] transition-colors focus:outline-none focus:ring-1 focus:ring-yc-orange/30 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary:
        'bg-yc-orange text-white hover:bg-yc-orange-hover active:bg-[#d85416] border border-transparent shadow-none',
      secondary:
        'bg-yc-bg-secondary text-yc-text hover:bg-[#EAEAE7] border border-yc-border',
      outline:
        'bg-white text-yc-text hover:bg-yc-bg-secondary border border-yc-border active:bg-[#EAEAE7]',
      ghost:
        'bg-transparent text-yc-text-secondary hover:text-yc-text hover:bg-yc-bg-secondary',
      destructive:
        'bg-white text-yc-error border border-yc-error-border hover:bg-yc-error-bg',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 h-7 gap-1.5',
      md: 'text-sm px-3.5 py-2 h-9 gap-2',
      lg: 'text-base px-5 py-2.5 h-11 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

