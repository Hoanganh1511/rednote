/**
 * Hashtag trong plain-text (post nhanh, preview, v.v.).
 *
 * Editor rich-text (chuyên mục): nên dùng **TipTap** hoặc **Lexical** + mark/decorator
 * cho hashtag; module này giữ logic tách token để dùng chung (highlight overlay, đếm tag).
 */
export const CREATOR_PRIMARY = '#00A1D6' as const;

/** Class Tailwind tĩnh để JIT nhận diện (overlay / prose). */
export const HASHTAG_TEXT_CLASS = 'font-semibold text-[#00A1D6]';

export type HashtagToken = { type: 'text' | 'hashtag'; text: string };

/** Tách chuỗi thành đoạn thường + đoạn hashtag (giữ nguyên # và nội dung tag). */
export function splitForHashtagHighlight(text: string): HashtagToken[] {
  const out: HashtagToken[] = [];
  const re = /(#[^\s#]+)/gu;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push({ type: 'text', text: text.slice(last, m.index) });
    }
    out.push({ type: 'hashtag', text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    out.push({ type: 'text', text: text.slice(last) });
  }
  return out;
}
