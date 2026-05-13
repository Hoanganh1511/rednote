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
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [openStatPopup, setOpenStatPopup] = useState<'followers' | 'following' | 'likes' | null>(null);
  const displayName = user.displayName || user.username;

  // Check if current user is following this user
  useEffect(() => {
    if (currentUser && currentUser.id !== user.id) {
      const checkFollowing = async () => {
        try {
          const response = await apiClient.get(`/users/${user.id}/is-following`);
          setIsFollowing(response.data?.isFollowing ?? false);
        } catch {
          // Handle error silently
        }
      };
      checkFollowing();
    }
  }, [currentUser, user.id]);

  const handleFollowClick = async () => {
    if (!currentUser) return;
    if (isFollowing) {
      setShowUnfollowConfirm(true);
      return;
    }
    await performFollow();
  };

  const performFollow = async () => {
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
      setShowUnfollowConfirm(false);
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
            <button
              onClick={() => setOpenStatPopup('followers')}
              className="flex-1 text-center hover:opacity-70 transition-opacity cursor-pointer"
            >
              <div className="text-[13px] font-bold leading-tight text-foreground">
                {formatCount(user.followerCount)}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Followers</div>
            </button>
            <div className="w-px h-6 bg-border" />
            <button
              onClick={() => setOpenStatPopup('following')}
              className="flex-1 text-center hover:opacity-70 transition-opacity cursor-pointer"
            >
              <div className="text-[13px] font-bold leading-tight text-foreground">
                {formatCount(user.followingCount)}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Following</div>
            </button>
            <div className="w-px h-6 bg-border" />
            <button
              onClick={() => setOpenStatPopup('likes')}
              className="flex-1 text-center hover:opacity-70 transition-opacity cursor-pointer"
            >
              <div className="text-[13px] font-bold leading-tight text-foreground">
                {formatCount(user.totalLikesReceived)}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Likes</div>
            </button>
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
              {isFollowing ? '✓ Following' : '+ Follow'}
            </button>
          ) : null}
        </div>
      </div>

      {/* Unfollow confirmation dialog */}
      {showUnfollowConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg border border-border p-6 shadow-lg max-w-sm mx-4">
            <h2 className="text-base font-semibold text-foreground mb-2">
              Hủy theo dõi {displayName}?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Bạn sẽ không thể nhìn thấy các bài đăng mới từ người này trong luồng của bạn.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnfollowConfirm(false)}
                className="flex-1 px-4 py-2 rounded border border-border text-foreground hover:bg-accent transition-colors text-sm font-medium"
              >
                Huỷ
              </button>
              <button
                onClick={performFollow}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {isLoading ? 'Đang hủy...' : 'Hủy theo dõi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats popup modal */}
      {openStatPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setOpenStatPopup(null)}
        >
          <div
            className="bg-background rounded-lg border border-border p-6 shadow-lg max-w-sm mx-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-foreground mb-4 capitalize">
              {openStatPopup === 'followers' && 'Followers'}
              {openStatPopup === 'following' && 'Following'}
              {openStatPopup === 'likes' && 'Likes'}
            </h2>
            <div className="text-sm text-muted-foreground text-center py-8">
              Tính năng này sẽ sớm được thêm vào
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
