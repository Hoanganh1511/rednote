import { apiClient } from '@/lib/api-client';

/** Best-effort: xóa object S3 vừa upload khi tạo post thất bại (không throw). */
export async function rollbackPostStagedUploads(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  try {
    await apiClient.post<{ deleted: number; skipped: number }>('/upload/post-assets/delete', { urls });
  } catch {
    // Giữ nguyên lỗi gốc từ submit; rollback chỉ là bổ sung.
  }
}
