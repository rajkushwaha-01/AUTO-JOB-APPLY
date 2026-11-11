import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'orange' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-medium rounded-[4px] border select-none transition-colors';

  const variants = {
    default: 'bg-yc-bg-secondary text-yc-text-secondary border-yc-border',
    success: 'bg-yc-success-bg text-yc-success border-yc-success-border',
    warning: 'bg-yc-warning-bg text-yc-warning border-yc-warning-border',
    error: 'bg-yc-error-bg text-yc-error border-yc-error-border',
    orange: 'bg-yc-orange-light text-yc-orange border-orange-200',
    outline: 'bg-white text-yc-text border-yc-border',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 leading-tight gap-1',
    md: 'text-xs px-2.5 py-1 leading-normal gap-1.5',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};

