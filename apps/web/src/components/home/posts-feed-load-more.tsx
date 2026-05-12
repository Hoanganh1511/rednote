'use client';

import { useCallback, useState } from 'react';
import type { PostFeedItem, PostFeedPage } from 'shared-types';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { PostFeedCard } from '@/components/home/post-feed-card';

type Props = {
  initialItems: PostFeedItem[];
  total: number;
};

export function PostsFeedLoadMore({ initialItems, total }: Props) {
  const [items, setItems] = useState<PostFeedItem[]>(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = items.length < total;

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const res = await apiClient.get<PostFeedPage>('/posts/feed', {
        params: { page: nextPage },
      });
      const next = res.data;
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const merged = [...prev];
        for (const p of next.items) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            merged.push(p);
          }
        }
        return merged;
      });
      setPage(nextPage);
    } catch {
      setError('Không tải thêm được. Thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, page]);

  return (
    <>
      <div className="grid grid-cols-1 gap-0 max-sm:-mx-3 sm:mx-0 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        {items.map((post, index) => (
          <PostFeedCard key={post.id} post={post} priority={index < 2} />
        ))}
      </div>

      {error ? (
        <p className="mt-4 text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {hasMore ? (
        <div className="mt-6 flex justify-center">
          <Button type="button" variant="outline" disabled={loading} onClick={() => void loadMore()}>
            {loading ? 'Đang tải…' : 'Tải thêm'}
          </Button>
        </div>
      ) : null}
    </>
  );
}
