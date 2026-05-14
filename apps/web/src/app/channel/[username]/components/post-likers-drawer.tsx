'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { ROUTES } from '@/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/hooks/use-auth';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

interface PostLikersDrawerProps {
  open: boolean;
  postId: string;
  onClose: () => void;
}

export function PostLikersDrawer({ open, postId, onClose }: PostLikersDrawerProps) {
  const currentUser = useCurrentUser();
  const [likers, setLikers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [drawerIn, setDrawerIn] = useState(false);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [followingCurrentUserMap, setFollowingCurrentUserMap] = useState<Record<string, boolean>>(
    {},
  );
  const [loadingFollowId, setLoadingFollowId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setDrawerIn(false);
      return;
    }

    setIsLoading(true);
    setLikers([]);

    const id = requestAnimationFrame(() => {
      setDrawerIn(true);
    });

    const fetchLikers = async () => {
      try {
        const response = await apiClient.get<{ items: User[]; total: number }>(
          `/posts/${postId}/likers`,
          { params: { page: 1, limit: 50 } },
        );
        const items = response.data.items;
        setLikers(items);
        setTotal(response.data.total);

        // Check following status for each liker if user is logged in
        if (currentUser) {
          const followingStatuses: Record<string, boolean> = {};
          const followingCurrentUserStatuses: Record<string, boolean> = {};

          try {
            // Fetch current user's followers list
            const followersResponse = await apiClient.get<{ items: User[] }>(
              `/users/${currentUser.id}/followers`,
            );
            const currentUserFollowers = new Set(followersResponse.data.items.map((f) => f.id));

            for (const liker of items) {
              if (liker.id !== currentUser.id) {
                try {
                  // Check if current user is following this liker
                  const followResponse = await apiClient.get(`/users/${liker.id}/is-following`);
                  followingStatuses[liker.id] = followResponse.data?.isFollowing ?? false;

                  // Check if this liker is in current user's followers
                  followingCurrentUserStatuses[liker.id] = currentUserFollowers.has(liker.id);
                } catch {
                  followingStatuses[liker.id] = false;
                  followingCurrentUserStatuses[liker.id] = false;
                }
              }
            }
            setFollowingMap(followingStatuses);
            setFollowingCurrentUserMap(followingCurrentUserStatuses);
          } catch {
            // Silent fail - won't show follow back button
          }
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikers();

    return () => cancelAnimationFrame(id);
  }, [open, postId, currentUser]);

  const closeDrawer = () => {
    setDrawerIn(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const performFollow = async (userId: string) => {
    if (!currentUser) return;

    setLoadingFollowId(userId);
    const wasFollowing = followingMap[userId];
    const newFollowingState = !wasFollowing;

    try {
      // Optimistic update
      setFollowingMap((prev) => ({
        ...prev,
        [userId]: newFollowingState,
      }));

      // Send request to server
      if (newFollowingState) {
        await apiClient.post(`/users/${userId}/follow`);
      } else {
        await apiClient.delete(`/users/${userId}/follow`);
      }

      // Verify from server
      setTimeout(async () => {
        try {
          const response = await apiClient.get(`/users/${userId}/is-following`);
          setFollowingMap((prev) => ({
            ...prev,
            [userId]: response.data?.isFollowing ?? false,
          }));
        } catch {
          // Keep optimistic update if verification fails
        }
      }, 100);
    } catch {
      // Rollback on error
      setFollowingMap((prev) => ({
        ...prev,
        [userId]: wasFollowing,
      }));
    } finally {
      setLoadingFollowId(null);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/50 transition-opacity duration-300 ${
          drawerIn ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          pointerEvents: drawerIn ? 'auto' : 'none',
          WebkitAppearance: 'none',
        }}
        onClick={closeDrawer}
      />

      {/* Drawer - Bottom */}
      <div
        className={`bg-background fixed right-0 bottom-0 left-0 z-[9999] rounded-t-2xl shadow-lg transition-transform duration-300 will-change-transform ${
          drawerIn ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          WebkitTransform: drawerIn ? 'translateY(0)' : 'translateY(100%)',
          WebkitTransition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <h2 className="text-foreground text-sm font-semibold">
            Lượt thích {total > 0 && `(${total})`}
          </h2>
          <button
            onClick={closeDrawer}
            className="text-muted-foreground hover:text-foreground absolute right-3 p-1 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div>
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx}>
                  <div
                    className="flex items-center gap-3 px-4"
                    style={{ paddingTop: '10px', paddingBottom: '10px' }}
                  >
                    <Skeleton variant="circle" className="h-10 w-10 shrink-0" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <Skeleton variant="text" className="h-4 w-32" />
                      <Skeleton variant="text" className="h-3 w-24" />
                    </div>
                  </div>
                  {idx < 5 && <div className="mx-4 h-px bg-gray-200 dark:bg-gray-700" />}
                </div>
              ))}
            </div>
          ) : likers.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-sm">Chưa có ai thích bài viết này</p>
            </div>
          ) : (
            likers.map((liker, idx) => (
              <div key={liker.id}>
                <div
                  className="flex items-center gap-3 px-4"
                  style={{ paddingTop: '10px', paddingBottom: '10px' }}
                >
                  {/* Avatar + Info */}
                  <Link
                    href={ROUTES.CHANNEL(liker.username)}
                    onClick={closeDrawer}
                    className="flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-80"
                  >
                    {/* Avatar */}
                    <div className="shrink-0">
                      {liker.avatarUrl ? (
                        <Image
                          src={liker.avatarUrl}
                          alt={liker.displayName}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00A1D6] text-xs font-semibold text-white">
                          {liker.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-medium">
                        {liker.displayName || liker.username}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">@{liker.username}</p>
                    </div>
                  </Link>

                  {/* Follow button */}
                  {currentUser && currentUser.id !== liker.id && (
                    <button
                      onClick={() => performFollow(liker.id)}
                      disabled={loadingFollowId === liker.id}
                      className={`shrink-0 rounded px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                        followingMap[liker.id]
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-[#00A1D6] text-white hover:bg-[#00A1D6]/90'
                      }`}
                    >
                      {loadingFollowId === liker.id
                        ? 'Đang...'
                        : followingMap[liker.id]
                          ? 'Đang theo dõi'
                          : followingCurrentUserMap[liker.id]
                            ? 'Theo dõi lại'
                            : 'Theo dõi'}
                    </button>
                  )}
                </div>
                {idx < likers.length - 1 && (
                  <div className="mx-4 h-px bg-gray-200 dark:bg-gray-700" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
