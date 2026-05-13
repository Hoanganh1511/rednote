'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PostFeedPage, PostFeedItem } from 'shared-types';
import { apiClient } from '@/lib/api-client';
import { ChannelPostCard } from './channel-post-card';

interface ChannelPostListProps {
  userId: string;
  initialPosts: PostFeedPage;
  onAuthorStatsChange?: () => void; // Callback when post likes change
}

export function ChannelPostList({ userId, initialPosts, onAuthorStatsChange }: ChannelPostListProps) {
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
      setPage(nextPage);
      setTotal(res.data.total);
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
    } catch {
      // silently ignore
    } finally {
      setIsLoading(false);
    }
  }, [userId, page, isLoading, items.length, total]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { threshold: 0.1 },
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p className="text-sm">Chưa có bài đăng nào</p>
      </div>
    );
  }

  return (
    <div>
      <div>
        {items.map((post) => (
          <ChannelPostCard
            key={post.id}
            post={post}
            {...(onAuthorStatsChange && { onPostLikeChange: onAuthorStatsChange })}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="py-8 text-center" aria-busy={isLoading}>
        {isLoading && <p className="text-sm text-muted-foreground">Đang tải...</p>}
        {!isLoading && items.length >= total && items.length > 0 && (
          <p className="text-xs text-muted-foreground/50">Đã xem hết bài đăng</p>
        )}
      </div>
    </div>
  );
}
