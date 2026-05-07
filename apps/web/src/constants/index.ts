export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VIDEO: (id: string) => `/video/${id}`,
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
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
