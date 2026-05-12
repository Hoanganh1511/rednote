import { cookies } from 'next/headers';
import type { User, PostFeedPage } from 'shared-types';
import { fetchApiEnvelope } from '@/lib/server/api-envelope';

/** Get user by username (public). */
export async function getUserByUsername(username: string): Promise<User> {
  return fetchApiEnvelope<User>(`/users/by-username/${username}`, {
    next: { revalidate: 300, tags: [`user-${username}`] },
  });
}

/** Get published posts by user ID, paginated (6 per page, public). */
export async function getUserPublishedPosts(userId: string, page = 1): Promise<PostFeedPage> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const search = new URLSearchParams({
    page: String(page),
    limit: '6',
  });

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return fetchApiEnvelope<PostFeedPage>(`/posts/by-user/${userId}?${search.toString()}`, {
    headers,
    ...(process.env.NODE_ENV === 'development'
      ? { cache: 'no-store' as const }
      : { next: { revalidate: 30, tags: [`user-posts-${userId}`] } }),
  });
}
