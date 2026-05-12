/**
 * Fetch JSON API envelope `{ data, error }` từ server (RSC / Route Handler).
 * Dùng chung cho các section trang chủ sau này (video, banner, …).
 */
export class ApiEnvelopeError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiEnvelopeError';
  }
}

export async function fetchApiEnvelope<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number; tags?: string[] } },
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const url = path.startsWith('http') ? path : `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });

  const json = (await res.json()) as {
    data: T;
    error: null | { statusCode: number; message: string };
  };

  if (!res.ok || json.error) {
    const msg = json.error?.message ?? res.statusText ?? 'Request failed';
    const code = json.error?.statusCode ?? res.status;
    throw new ApiEnvelopeError(msg, code);
  }

  return json.data;
}
