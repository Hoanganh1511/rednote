'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { User } from 'shared-types';
import { useCurrentUser } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api-client';
import { ROUTES } from '@/constants';

interface ChannelUserInfoProps {
  user: User;
  onFollowingChange?: (isFollowing: boolean) => void;
  onStatsClick?: () => void;
  onFollowingOptionsOpen?: () => void;
  onFollowingOptionsClose?: () => void;
  onUnfollowStart?: () => void;
  onUnfollowEnd?: () => void;
  onUserDataRefresh?: (user: User) => void;
  onEditProfileClick?: () => void;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

export function ChannelUserInfo({
  user,
  onFollowingChange,
  onStatsClick,
  onFollowingOptionsOpen,
  onFollowingOptionsClose,
  onUnfollowStart,
  onUnfollowEnd,
  onUserDataRefresh,
  onEditProfileClick,
}: ChannelUserInfoProps) {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(user.followerCount);
  const [followingCount, setFollowingCount] = useState(user.followingCount);
  const [totalLikesReceived, setTotalLikesReceived] = useState(user.totalLikesReceived);
  const displayName = user.displayName || user.username;
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(0);

  // Refetch user data from server to verify counts
  const refetchUserData = async () => {
    try {
      const response = await apiClient.get<User>(`/users/${user.id}`);
      const freshData = response.data;
      setFollowerCount(freshData.followerCount);
      setFollowingCount(freshData.followingCount);
      setTotalLikesReceived(freshData.totalLikesReceived);
      onUserDataRefresh?.(freshData);
      lastRefreshRef.current = Date.now();
    } catch {
      // Silent fail - keep optimistic updates
    }
  };

  // Initial load: check following status and set up periodic sync
  useEffect(() => {
    setFollowerCount(user.followerCount);
    setFollowingCount(user.followingCount);
    setTotalLikesReceived(user.totalLikesReceived);

    if (!currentUser || currentUser.id === user.id) {
      return;
    }

    const checkFollowing = async () => {
      try {
        const response = await apiClient.get(`/users/${user.id}/is-following`);
        const following = response.data?.isFollowing ?? false;
        setIsFollowing(following);
        onFollowingChange?.(following);
      } catch {
        // Handle error silently
      }
    };
    checkFollowing();

    // Periodic sync mỗi 60 giây để đảm bảo data consistency
    const startPeriodicSync = () => {
      syncTimerRef.current = setInterval(() => {
        refetchUserData();
      }, 60000); // 60 seconds
    };

    startPeriodicSync();

    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    };
  }, [currentUser, user.id, user.followerCount, user.totalLikesReceived, onFollowingChange]);

  // Listen for unfollow event from parent
  useEffect(() => {
    const handlePerformUnfollow = async () => {
      await performFollow();
    };
    window.addEventListener('performUnfollow', handlePerformUnfollow as EventListener);
    return () => window.removeEventListener('performUnfollow', handlePerformUnfollow as EventListener);
  }, [isFollowing]);

  const handleFollowClick = async () => {
    if (!currentUser) return;
    if (isFollowing) {
      onFollowingOptionsOpen?.();
      return;
    }
    await performFollow();
  };

  const performFollow = async () => {
    setIsLoading(true);
    onUnfollowStart?.();

    // Store optimistic state untuk rollback nếu lỗi
    const prevFollowing = isFollowing;
    const prevFollowerCount = followerCount;

    try {
      // 1️⃣ OPTIMISTIC UPDATE - cập nhật UI ngay
      const newFollowingState = !isFollowing;
      setIsFollowing(newFollowingState);
      if (newFollowingState) {
        setFollowerCount((prev) => prev + 1);
      } else {
        setFollowerCount((prev) => Math.max(0, prev - 1));
      }
      onFollowingChange?.(newFollowingState);

      // 2️⃣ SEND REQUEST - gửi action lên server
      if (newFollowingState) {
        await apiClient.post(`/users/${user.id}/follow`);
      } else {
        await apiClient.delete(`/users/${user.id}/follow`);
      }

      // 3️⃣ REFETCH - verify dữ liệu từ server ngay sau action
      // Timeout ngắn (100ms) để cho server xử lý xong trước khi refetch
      setTimeout(() => {
        refetchUserData();
      }, 100);
    } catch (error) {
      // 4️⃣ ROLLBACK - nếu action thất bại, rollback UI về trạng thái cũ
      setIsFollowing(prevFollowing);
      setFollowerCount(prevFollowerCount);
      onFollowingChange?.(prevFollowing);
      console.error('Follow action failed:', error);
    } finally {
      setIsLoading(false);
      onUnfollowEnd?.();
      onFollowingOptionsClose?.();
      // Notify parent that unfollow is complete
      window.dispatchEvent(new CustomEvent('unfollowComplete'));
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
        <div className="w-[50vw] pt-2 flex flex-col gap-2 ml-auto">
          {/* Stats */}
          <div className="flex items-center">
            <button
              onClick={() => onStatsClick?.()}
              className="flex-1 text-center hover:opacity-70 transition-opacity cursor-pointer"
            >
              <div className="text-[15px] font-medium leading-tight text-foreground">
                {formatCount(followerCount)}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Người theo dõi</div>
            </button>
            <div className="w-px h-6 bg-border" />
            <button
              onClick={() => onStatsClick?.()}
              className="flex-1 text-center hover:opacity-70 transition-opacity cursor-pointer"
            >
              <div className="text-[15px] font-medium leading-tight text-foreground">
                {formatCount(followingCount)}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Đang theo dõi</div>
            </button>
            <div className="w-px h-6 bg-border" />
            <button
              onClick={() => onStatsClick?.()}
              className="flex-1 text-center hover:opacity-70 transition-opacity cursor-pointer"
            >
              <div className="text-[15px] font-medium leading-tight text-foreground">
                {formatCount(totalLikesReceived)}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Lượt thích</div>
            </button>
          </div>

          {/* Edit profile or Follow & Message buttons */}
          {currentUser && currentUser.id === user.id ? (
            <button
              onClick={onEditProfileClick}
              className="flex-1 rounded py-1.5 text-xs font-semibold border-2 border-[#00aeec] text-[#00aeec] bg-transparent hover:bg-[#00aeec]/10 transition-colors active:opacity-80 flex items-center justify-center"
            >
              Chỉnh sửa hồ sơ
            </button>
          ) : currentUser ? (
            <div className="flex gap-2">
              <button
                onClick={handleFollowClick}
                disabled={isLoading}
                className={`flex-1 rounded py-1.5 text-xs font-semibold transition-colors active:opacity-80 disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-[#00aeec] text-white hover:bg-[#00aeec]/90'
                }`}
              >
                {isFollowing ? (
                  <>
                    <Menu className="w-4 h-4" />
                    Đang theo dõi
                  </>
                ) : (
                  <>+ Follow</>
                )}
              </button>
              {isFollowing && (
                <button
                  onClick={() => {}}
                  className="rounded py-1.5 px-3 text-xs font-semibold bg-gray-100 text-gray-700 transition-colors active:opacity-80 hover:bg-gray-200 flex items-center justify-center"
                  title="Gửi tin nhắn"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
