'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { ROUTES } from '@/constants';

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
  const [likers, setLikers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [drawerIn, setDrawerIn] = useState(false);

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
        setLikers(response.data.items);
        setTotal(response.data.total);
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikers();

    return () => cancelAnimationFrame(id);
  }, [open, postId]);

  const closeDrawer = () => {
    setDrawerIn(false);
    setTimeout(() => {
      onClose();
    }, 300);
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
        className={`fixed bottom-0 left-0 right-0 z-[9999] bg-background rounded-t-2xl shadow-lg transition-transform duration-300 will-change-transform ${
          drawerIn ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          WebkitTransform: drawerIn ? 'translateY(0)' : 'translateY(100%)',
          WebkitTransition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            Lượt thích {total > 0 && `(${total})`}
          </h2>
          <button
            onClick={closeDrawer}
            className="absolute right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : likers.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Chưa có ai thích bài viết này</p>
            </div>
          ) : (
            likers.map((liker, idx) => (
              <div key={liker.id}>
                <Link
                  href={ROUTES.CHANNEL(liker.username)}
                  onClick={closeDrawer}
                  className="flex items-center gap-3 px-4 py-1.5 hover:bg-muted transition-colors"
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
                      <div className="h-10 w-10 rounded-full bg-[#00A1D6] flex items-center justify-center text-xs font-semibold text-white">
                        {liker.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {liker.displayName || liker.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">@{liker.username}</p>
                  </div>
                </Link>
                {idx < likers.length - 1 && (
                  <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
