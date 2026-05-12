/** Thời gian tương đối (feed) — tiếng Việt. */
export function formatRelativeTimeVi(iso: string | null | undefined, now = new Date()): string {
  if (!iso) return '';
  const d = new Date(iso);
  const ms = now.getTime() - d.getTime();
  if (Number.isNaN(ms) || ms < 0) return 'Vừa xong';
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return 'Vừa xong';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} tiếng trước`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} ngày trước`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} tuần trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  const years = Math.floor(days / 365);
  return `${years} năm trước`;
}
