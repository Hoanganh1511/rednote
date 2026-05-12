/** MIME được phép khi presign upload post (ảnh + PDF). Đồng bộ với DTO + frontend. */
export const POST_UPLOAD_ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const;

export type PostUploadMime = (typeof POST_UPLOAD_ALLOWED_MIMES)[number];

const MIME_TO_EXT: Record<PostUploadMime, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
};

export function extensionForPostUploadMime(fileType: string): string {
  const ext = MIME_TO_EXT[fileType as PostUploadMime];
  return ext ?? 'bin';
}
