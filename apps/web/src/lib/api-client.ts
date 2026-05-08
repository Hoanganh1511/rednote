import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/constants';

interface ApiEnvelope<T = unknown> {
  data: T;
  error: null;
}

interface ApiErrorBody {
  data: null;
  error: { statusCode: number; message: string };
}

// Extend config type to track refresh retries
interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── Request: attach Bearer token ────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('rednote-user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { state?: { accessToken?: string } };
        const token = parsed.state?.accessToken;
        if (token) config.headers['Authorization'] = `Bearer ${token}`;
      } catch {
        // corrupted localStorage — ignore
      }
    }
  }
  return config;
});

// ─── Response: unwrap envelope + auto-refresh on 401 ─────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    // Backend always responds: { data: T, error: null }
    // Unwrap so callers get res.data as T directly (not res.data.data)
    const envelope = response.data as ApiEnvelope;
    if (envelope && typeof envelope === 'object' && 'data' in envelope) {
      response.data = envelope.data;
    }
    return response;
  },
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as RetryableConfig | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('rednote-user') : null;
        const refreshToken = stored
          ? (JSON.parse(stored) as { state?: { refreshToken?: string } }).state?.refreshToken
          : null;

        if (!refreshToken) throw new Error('no refresh token');

        // Use raw axios (not apiClient) to avoid interceptor loop
        const refreshRes = await axios.post<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
        );

        const tokens = refreshRes.data.data;

        // Lazy-import to avoid circular dependency at module load time
        const { useUserStore } = await import('@/stores/user-store');
        useUserStore.getState().setTokens(tokens);

        // Retry original request with new token
        original.headers ??= {};
        original.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
        return apiClient(original);
      } catch {
        const { useUserStore } = await import('@/stores/user-store');
        useUserStore.getState().logout();
        if (typeof window !== 'undefined') window.location.href = '/';
      }
    }

    return Promise.reject(error);
  },
);
