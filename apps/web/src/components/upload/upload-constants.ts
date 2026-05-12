/**
 * Giới hạn video ngắn — giai đoạn dự án cá nhân / nhóm nhỏ.
 *
 * - Thời lượng: 3 phút (đủ Shorts/Reels-style).
 * - Dung lượng ~300MB: tương đương bitrate trung bình ~13 Mbps trong 180s,
 *   đủ 1080p dọc (H.264/H.265) với biên độ nhẹ; tránh file quá lớn cho pipeline + S3.
 * - Tham chiếu chi phí (bậc nhỏ, chỉ lưu trữ S3 Standard, ví dụ us-east-1 ~0,023 USD/GB-tháng):
 *   vài chục GB lưu thường trú thường rơi vào vài USD/tháng; egress/CDN tính riêng khi có lượt xem.
 */
export const SHORT_VIDEO_MAX_DURATION_MIN = 3;

/** Giới hạn cứng upload (bytes). */
export const SHORT_VIDEO_MAX_SIZE_BYTES = 300 * 1024 * 1024;

/** Hiển thị UI / thông báo lỗi. */
export const SHORT_VIDEO_MAX_SIZE_LABEL = '~300 MB';
