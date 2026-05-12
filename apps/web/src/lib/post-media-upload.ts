/** Định dạng upload post (đồng bộ với API presign). */
export const POST_MEDIA_ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const;

export type PostMediaMime = (typeof POST_MEDIA_ALLOWED_MIMES)[number];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

export const POST_MEDIA_ACCEPT = POST_MEDIA_ALLOWED_MIMES.join(',');

export function isPostMediaMime(mime: string): mime is PostMediaMime {
  return (POST_MEDIA_ALLOWED_MIMES as readonly string[]).includes(mime);
}

export function maxBytesForPostMedia(mime: string): number {
  return mime === 'application/pdf' ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
}

export function validatePostMediaFile(file: File): string | null {
  if (!isPostMediaMime(file.type)) {
    return 'Chỉ hỗ trợ ảnh JPEG, PNG, WebP, GIF hoặc file PDF.';
  }
  const max = maxBytesForPostMedia(file.type);
  if (file.size > max) {
    return file.type === 'application/pdf' ? 'PDF tối đa 10MB.' : 'Ảnh tối đa 5MB.';
  }
  return null;
}
