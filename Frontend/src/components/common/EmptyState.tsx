import React from 'react';
import { cn } from '../../utils/cn';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 bg-white border border-dashed border-yc-border rounded-[4px] min-h-[220px]',
        className
      )}
    >
      {icon && <div className="text-yc-text-muted mb-3">{icon}</div>}
      <h4 className="text-sm font-semibold text-yc-text">{title}</h4>
      {description && (
        <p className="text-xs text-yc-text-secondary max-w-sm mt-1 mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

