'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationType } from 'shared-types';

interface NotificationCategoryCardProps {
  type: NotificationType;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

export function NotificationCategoryCard({
  label,
  icon: Icon,
  iconColor,
  iconBg,
  count,
  active,
  onClick,
}: NotificationCategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 rounded-2xl px-2 py-4 transition-all duration-200',
        'border-2',
        active
          ? 'border-[#00A1D6] bg-[#e8f7fc] shadow-sm'
          : 'border-transparent bg-muted/40 hover:bg-muted/60 hover:border-border',
      )}
    >
      <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', iconBg)}>
        <Icon className={cn('h-6 w-6', iconColor)} strokeWidth={active ? 2.5 : 2} />
      </div>
      <span
        className={cn(
          'text-center text-xs font-medium leading-tight',
          active ? 'text-[#00A1D6]' : 'text-foreground',
        )}
      >
        {label}
      </span>
      {count > 0 && (
        <span className="absolute right-2 top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
