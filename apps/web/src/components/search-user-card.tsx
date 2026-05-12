'use client';

import Link from 'next/link';
import { useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

interface SearchUserCardProps {
  user: {
    id: string;
    name: string;
    displayName?: string;
    avatar: string;
    gender: string;
    genderColor: 'blue' | 'pink';
    isFollowing: boolean;
  };
}

const genderColors = {
  blue: 'text-blue-500',
  pink: 'text-pink-500',
};

export function SearchUserCard({ user }: SearchUserCardProps) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);

  return (
    <div className="hover:bg-accent/50 p-4 transition-colors">
      <div className="flex items-center justify-between gap-3">
        {/* User info */}
        <Link href={ROUTES.CHANNEL(user.name)} className="flex items-center gap-3 flex-1 min-w-0 hover:no-underline">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-10 w-10 rounded-full shrink-0 hover:opacity-75 transition-opacity"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={cn('text-sm font-bold shrink-0', genderColors[user.genderColor])}>
                {user.gender === 'Nam' ? '♂' : '♀'}
              </span>
              <p className="font-medium text-sm truncate hover:text-[#00aeec] transition-colors">
                {user.name}
              </p>
            </div>
            {user.displayName && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {user.displayName}
              </p>
            )}
          </div>
        </Link>

        {/* Follow button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFollowing(!isFollowing);
          }}
          className={cn(
            'shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
            isFollowing
              ? 'border border-border bg-background text-foreground hover:bg-accent'
              : 'border border-[#00aeec] bg-[#00aeec]/10 text-[#00aeec] hover:bg-[#00aeec]/20',
          )}
        >
          {isFollowing ? (
            <>
              <UserCheck className="h-3.5 w-3.5" />
              <span>Hủy theo dõi</span>
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              <span>Theo dõi</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
