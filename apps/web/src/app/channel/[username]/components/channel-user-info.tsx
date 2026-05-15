'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu } from 'lucide-react';
import type { User } from 'shared-types';
import { useCurrentUser } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api-client';

interface ChannelUserInfoProps {
  user: User;
  hideAvatar?: boolean;
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
  hideAvatar = false,
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(user.followerCount);
  const [followingCount, setFollowingCount] = useState(user.followingCount);
  const [totalLikesReceived, setTotalLikesReceived] = useState(user.totalLikesReceived);
  const displayName = user.displayName || user.username;
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  const refetchUserData = useCallback(async () => {
    try {
      const response = await apiClient.get<User>(`/users/${user.id}`);
      const freshData = response.data;
      setFollowerCount(freshData.followerCount);
      setFollowingCount(freshData.followingCount);
      setTotalLikesReceived(freshData.totalLikesReceived);
      onUserDataRefresh?.(freshData);
    } catch {
      // Silent fail
    }
  }, [user.id, onUserDataRefresh]);

  // keep a stable ref to performFollow so the event listener below doesn't need
  // to be re-registered every time isFollowing changes
  const performFollowRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    setFollowerCount(user.followerCount);
    setFollowingCount(user.followingCount);
    setTotalLikesReceived(user.totalLikesReceived);

    if (!currentUser || currentUser.id === user.id) return;

    const checkFollowing = async () => {
      try {
        const response = await apiClient.get(`/users/${user.id}/is-following`);
        const following = response.data?.isFollowing ?? false;
        setIsFollowing(following);
        onFollowingChange?.(following);
      } catch {
        // Silent
      }
    };
    checkFollowing();

    const id = setInterval(() => { void refetchUserData(); }, 60000);
    syncTimerRef.current = id;
    return () => { clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, user.id, user.followerCount, user.followingCount, user.totalLikesReceived, onFollowingChange]);

  useEffect(() => {
    const handlePerformUnfollow = () => { void performFollowRef.current(); };
    window.addEventListener('performUnfollow', handlePerformUnfollow);
    return () => window.removeEventListener('performUnfollow', handlePerformUnfollow);
  }, []);

  useEffect(() => {
    const handle = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail?.userId === user.id) setTimeout(() => refetchUserData(), 200);
    };
    window.addEventListener('userFollowed', handle);
    window.addEventListener('userUnfollowed', handle);
    return () => {
      window.removeEventListener('userFollowed', handle);
      window.removeEventListener('userUnfollowed', handle);
    };
  }, [user.id, refetchUserData]);

  const handleFollowClick = async () => {
    if (!currentUser) return;
    if (isFollowing) { onFollowingOptionsOpen?.(); return; }
    await performFollow();
  };

  const performFollow = useCallback(async () => {
    setIsLoading(true);
    onUnfollowStart?.();
    const prevFollowing = isFollowing;
    const prevFollowerCount = followerCount;
    try {
      const newFollowingState = !isFollowing;
      setIsFollowing(newFollowingState);
      setFollowerCount((prev) => newFollowingState ? prev + 1 : Math.max(0, prev - 1));
      onFollowingChange?.(newFollowingState);
      if (newFollowingState) {
        await apiClient.post(`/users/${user.id}/follow`);
      } else {
        await apiClient.delete(`/users/${user.id}/follow`);
      }
      setTimeout(() => { refetchUserData(); }, 100);
    } catch {
      setIsFollowing(prevFollowing);
      setFollowerCount(prevFollowerCount);
      onFollowingChange?.(prevFollowing);
    } finally {
      setIsLoading(false);
      onUnfollowEnd?.();
      onFollowingOptionsClose?.();
      window.dispatchEvent(new CustomEvent('unfollowComplete'));
    }
  }, [isFollowing, followerCount, user.id, onFollowingChange, onUnfollowStart, onUnfollowEnd, onFollowingOptionsClose, refetchUserData]);

  // Keep ref in sync so the event-listener effect (registered once) always calls the latest version
  performFollowRef.current = performFollow;

  const isOwnProfile = currentUser?.id === user.id;

  // ── Desktop mode (hideAvatar=true): stats column + buttons ──────────────────
  if (hideAvatar) {
    return (
      <div className="flex flex-col items-end gap-4">
        {/* Stats row */}
        <div className="flex items-center gap-6">
          <button onClick={() => onStatsClick?.()} className="text-center group cursor-pointer">
            <div className="text-xl font-bold text-foreground group-hover:text-[#00aeec] transition-colors">
              {formatCount(followerCount)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Người theo dõi</div>
          </button>
          <div className="h-8 w-px bg-border" />
          <button onClick={() => onStatsClick?.()} className="text-center group cursor-pointer">
            <div className="text-xl font-bold text-foreground group-hover:text-[#00aeec] transition-colors">
              {formatCount(followingCount)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Đang theo dõi</div>
          </button>
          <div className="h-8 w-px bg-border" />
          <button onClick={() => onStatsClick?.()} className="text-center group cursor-pointer">
            <div className="text-xl font-bold text-foreground group-hover:text-[#00aeec] transition-colors">
              {formatCount(totalLikesReceived)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Lượt thích</div>
          </button>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          {isOwnProfile ? (
            <button
              onClick={onEditProfileClick}
              className="rounded-full border-2 border-[#00aeec] bg-transparent px-6 py-2 text-sm font-semibold text-[#00aeec] hover:bg-[#00aeec]/10 transition-colors"
            >
              Chỉnh sửa hồ sơ
            </button>
          ) : currentUser ? (
            <>
              <button
                onClick={handleFollowClick}
                disabled={isLoading}
                className={`flex items-center gap-1.5 rounded-full px-6 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                  isFollowing
                    ? 'bg-muted text-foreground hover:bg-muted/80'
                    : 'bg-[#00aeec] text-white hover:bg-[#0099d6]'
                }`}
              >
                {isFollowing ? <><Menu className="h-3.5 w-3.5" />Đang theo dõi</> : '+ Theo dõi'}
              </button>
              {isFollowing && (
                <button className="rounded-full border border-border bg-background px-5 py-2 text-sm font-semibold hover:bg-muted transition-colors">
                  Nhắn tin
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>
    );
  }

  // ── Mobile mode: [avatar | stats+buttons] ──────────────────────────────────
  return (
    <div className="relative z-10">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="-mt-[33px] shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="border-background h-24 w-24 rounded-full border-[3px] object-cover shadow-md"
            />
          ) : (
            <div className="border-background flex h-24 w-24 items-center justify-center rounded-full border-[3px] bg-[#00aeec] shadow-md">
              <span className="text-2xl font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Stats + buttons */}
        <div className="ml-auto flex w-[50vw] flex-col gap-2 pt-2">
          <div className="flex items-center">
            {[
              { count: followerCount, label: 'Người theo dõi' },
              { count: followingCount, label: 'Đang theo dõi' },
              { count: totalLikesReceived, label: 'Lượt thích' },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <div className="bg-border h-6 w-px" />}
                <button
                  onClick={() => onStatsClick?.()}
                  className="flex-1 cursor-pointer text-center transition-opacity hover:opacity-70"
                >
                  <div className="text-foreground text-[15px] leading-tight font-medium">
                    {formatCount(stat.count)}
                  </div>
                  <div className="text-muted-foreground mt-0.5 text-[9px]">{stat.label}</div>
                </button>
              </React.Fragment>
            ))}
          </div>

          {isOwnProfile ? (
            <button
              onClick={onEditProfileClick}
              className="flex flex-1 items-center justify-center rounded border-2 border-[#00aeec] bg-transparent py-1.5 text-xs font-semibold text-[#00aeec] transition-colors hover:bg-[#00aeec]/10"
            >
              Chỉnh sửa hồ sơ
            </button>
          ) : currentUser ? (
            <div className="flex gap-2">
              <button
                onClick={handleFollowClick}
                disabled={isLoading}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-[#00aeec] text-white hover:bg-[#00aeec]/90'
                }`}
              >
                {isFollowing ? <><Menu className="h-4 w-4" />Đang theo dõi</> : <>+ Theo dõi</>}
              </button>
              {isFollowing && (
                <button className="flex items-center justify-center rounded bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors">
                  Nhắn tin
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
