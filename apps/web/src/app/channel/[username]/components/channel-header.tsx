import { MessageSquare, MoreVertical } from 'lucide-react';
import type { User } from 'shared-types';
import { cn } from '@/lib/utils';

interface ChannelHeaderProps {
  user: User;
  scrollY: number;
  onMessageClick: () => void;
}

// Transition header when scroll passes cover height (assume ~280px)
const HEADER_THRESHOLD = 200;

export function ChannelHeader({ user, scrollY, onMessageClick }: ChannelHeaderProps) {
  const isSolid = scrollY > HEADER_THRESHOLD;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[90] h-16 flex items-center justify-between px-4 transition-colors duration-200',
        isSolid ? 'bg-background text-foreground shadow-sm' : 'bg-transparent text-white',
      )}
    >
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/20"
        aria-label="Back"
      >
        ←
      </button>

      <div className="flex-1 text-center min-w-0">
        {isSolid && (
          <div className="truncate text-sm font-semibold">
            {user.displayName || user.username}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/20"
          onClick={onMessageClick}
          aria-label="Message"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/20"
          aria-label="More options"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
