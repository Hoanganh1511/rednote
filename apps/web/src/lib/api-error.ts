import type { AxiosError } from 'axios';

interface ApiErrorBody {
  error?: { message?: string; statusCode?: number };
}

export function extractApiError(err: unknown, fallback = 'Đã xảy ra lỗi, vui lòng thử lại.'): string {
  const axiosErr = err as AxiosError<ApiErrorBody>;
  return axiosErr.response?.data?.error?.message ?? fallback;
}
