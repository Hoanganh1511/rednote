'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PostFeedPage, PostFeedItem } from 'shared-types';
import { apiClient } from '@/lib/api-client';
import { ChannelPostCard } from './channel-post-card';

interface ChannelPostListProps {
  userId: string;
  initialPosts: PostFeedPage;
}

export function ChannelPostList({ userId, initialPosts }: ChannelPostListProps) {
  const [items, setItems] = useState<PostFeedItem[]>(initialPosts.items);
  const [total, setTotal] = useState(initialPosts.total);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || items.length >= total) return;
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const res = await apiClient.get<PostFeedPage>(`/posts/by-user/${userId}`, {
        params: { page: nextPage, limit: 6 },
      });
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const merged = [...prev];
        for (const p of res.data.items) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            merged.push(p);
          }
        }
        return merged;
      });
      setPage(nextPage);
    } catch (err) {
      console.error('Failed to load more posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, page, isLoading, items.length, total]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          <p className="text-sm">Chưa có bài viết nào</p>
        </div>
      ) : (
        <>
          {items.map((post) => (
            <ChannelPostCard key={post.id} post={post} />
          ))}
          <div
            ref={sentinelRef}
            className="py-8 text-center"
            aria-busy={isLoading}
            role="status"
            aria-label={isLoading ? 'Loading more posts' : undefined}
          >
            {isLoading && <p className="text-sm text-slate-500">Đang tải...</p>}
            {!isLoading && items.length >= total && items.length > 0 && (
              <p className="text-xs text-slate-400">Không còn bài viết</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
