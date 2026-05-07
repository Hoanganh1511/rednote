import { cn } from '@/lib/utils';

interface SkeletonProps {
  variant?: 'rect' | 'circle' | 'text';
  className?: string;
}

export function Skeleton({ variant = 'rect', className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-muted',
        variant === 'circle' && 'rounded-full',
        variant === 'text' && 'rounded h-4 w-full',
        variant === 'rect' && 'rounded',
        className,
      )}
    />
  );
}
