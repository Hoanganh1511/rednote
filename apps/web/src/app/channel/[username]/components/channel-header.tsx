'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, MessageCircle, MoreVertical } from 'lucide-react';
import type { User } from 'shared-types';
import { cn } from '@/lib/utils';

interface ChannelHeaderProps {
  user: User;
  scrollY: number;
  onMessageClick: () => void;
}

const HEADER_THRESHOLD = 180;

export function ChannelHeader({ user, scrollY, onMessageClick }: ChannelHeaderProps) {
  const router = useRouter();
  const isSolid = scrollY > HEADER_THRESHOLD;

  const btnClass = cn(
    'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
    isSolid
      ? 'text-foreground hover:bg-accent'
      : 'bg-black/25 text-white backdrop-blur-sm hover:bg-black/35',
  );

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[90] flex h-14 items-center justify-between px-3 transition-all duration-200',
        isSolid ? 'bg-background shadow-sm' : 'bg-transparent',
      )}
    >
      <button
        type="button"
        className={btnClass}
        onClick={() => router.back()}
        aria-label="Quay lại"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex-1 text-center">
        {isSolid && (
          <span className="truncate text-sm font-semibold">
            {user.displayName || user.username}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button type="button" className={btnClass} aria-label="Tìm kiếm">
          <Search className="h-[18px] w-[18px]" />
        </button>
        <button
          type="button"
          className={btnClass}
          onClick={onMessageClick}
          aria-label="Nhắn tin"
        >
          <MessageCircle className="h-[18px] w-[18px]" />
        </button>
        <button type="button" className={btnClass} aria-label="Thêm">
          <MoreVertical className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
