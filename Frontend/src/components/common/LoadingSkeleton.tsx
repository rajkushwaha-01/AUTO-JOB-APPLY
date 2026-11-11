import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  circle = false,
  ...props
}) => {
  return (
    <div
      style={{ width, height }}
      className={cn(
        'animate-pulse bg-[#EFEFEF] rounded-[4px]',
        circle && 'rounded-full',
        className
      )}
      {...props}
    />
  );
};

