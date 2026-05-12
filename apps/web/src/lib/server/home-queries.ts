import { cookies } from 'next/headers';
import type { PostFeedPage, PostFeedItem } from 'shared-types';
import { fetchApiEnvelope } from '@/lib/server/api-envelope';

const FEED_PATH = '/posts/feed';

/** Trang chủ: luôn 6 bài/trang; chỉ truyền `page`. */
export async function getHomePostsFeed(page = 1): Promise<PostFeedPage> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const search = new URLSearchParams({
    page: String(page),
  });

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return fetchApiEnvelope<PostFeedPage>(`${FEED_PATH}?${search.toString()}`, {
    headers,
    ...(process.env.NODE_ENV === 'development'
      ? { cache: 'no-store' as const }
      : { next: { revalidate: 30, tags: ['home-posts-feed'] } }),
  });
}

export async function getPublishedPostById(id: string): Promise<PostFeedItem> {
  return fetchApiEnvelope<PostFeedItem>(`/posts/${id}`, {
    next: { revalidate: 60, tags: [`post-${id}`] },
  });
}
