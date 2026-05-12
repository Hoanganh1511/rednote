'use client';

import { useState, useEffect } from 'react';
import type { User } from 'shared-types';
import { useCurrentUser } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api-client';

interface ChannelUserInfoProps {
  user: User;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

export function ChannelUserInfo({ user }: ChannelUserInfoProps) {
  const currentUser = useCurrentUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const displayName = user.displayName || user.username;

  // Check if current user is following this user
  useEffect(() => {
    if (currentUser && currentUser.id !== user.id) {
      const checkFollowing = async () => {
        try {
          const response = await apiClient.get(`/users/${user.id}/is-following`);
          setIsFollowing(response.data?.data?.isFollowing ?? false);
        } catch {
          // Handle error silently
        }
      };
      checkFollowing();
    }
  }, [currentUser, user.id]);

  const handleFollowClick = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      if (isFollowing) {
        await apiClient.delete(`/users/${user.id}/follow`);
      } else {
        await apiClient.post(`/users/${user.id}/follow`);
      }
      setIsFollowing(!isFollowing);
    } catch {
      // Handle error silently
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10">
      <div className="flex items-start gap-3">
        {/* Avatar — overlap cover by 33px */}
        <div className="shrink-0 -mt-[33px]">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="h-24 w-24 rounded-full border-[3px] border-background object-cover shadow-md"
            />
          ) : (
            <div className="h-24 w-24 rounded-full border-[3px] border-background bg-[#00aeec] flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Stats + Follow button — ~half screen width */}
        <div className="w-[50vw] pt-2 flex flex-col gap-2.5 ml-auto">
          {/* Stats */}
          <div className="flex items-center">
            <div className="flex-1 text-center">
              <div className="text-[13px] font-bold leading-tight text-foreground">
                {formatCount(user.followerCount)}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Followers</div>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex-1 text-center">
              <div className="text-[13px] font-bold leading-tight text-foreground">
                {formatCount(user.followingCount)}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Follow</div>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex-1 text-center">
              <div className="text-[13px] font-bold leading-tight text-foreground">
                {formatCount(user.totalLikesReceived)}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Likes</div>
            </div>
          </div>

          {/* Follow button */}
          {currentUser && currentUser.id !== user.id ? (
            <button
              onClick={handleFollowClick}
              disabled={isLoading}
              className={`w-full rounded py-1.5 text-xs font-semibold transition-colors active:opacity-80 disabled:opacity-50 ${
                isFollowing
                  ? 'border border-border text-foreground hover:bg-accent'
                  : 'bg-[#00aeec] text-white hover:bg-[#00aeec]/90'
              }`}
            >
              {isFollowing ? '✓ Đang theo dõi' : '+ Theo dõi'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
