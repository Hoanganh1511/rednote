export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';

/**
 * Bề rộng tối đa vùng nội dung (desktop) — gần Bilibili (~90% màn 1920px, max ~1720px).
 * Dùng chung main / category / thanh dưới mobile / header để một cột thẳng hàng.
 */
export const SITE_MAIN_CONTENT_CLASS =
  'mx-auto w-full max-w-[min(100%,1720px)]' as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VIDEO: (id: string) => `/video/${id}`,
  POST: (id: string) => `/posts/${id}`,
  CHANNEL: (username: string) => `/channel/${username}`,
  UPLOAD: '/upload',
  SETTINGS: '/settings',
} as const;

export const QUERY_KEYS = {
  VIDEOS: 'videos',
  VIDEO: 'video',
  USER: 'user',
  COMMENTS: 'comments',
  DANMAKU: 'danmaku',
  FEED: 'feed',
  POSTS_FEED: 'posts-feed',
  POST_LIKE: (postId: string) => ['post-like', postId] as const,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
