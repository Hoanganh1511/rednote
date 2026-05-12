'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Hash, Image as ImageIcon, Loader2, MapPin, Plus, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { SITE_MAIN_CONTENT_CLASS } from '@/constants';
import { getBrowserPosition } from '@/lib/browser-geolocation';
import { POST_MEDIA_ACCEPT, validatePostMediaFile } from '@/lib/post-media-upload';
import { rollbackPostStagedUploads } from '@/lib/post-submit-rollback';
import { PostBodyTextarea, type PostBodyTextareaHandle } from '@/components/upload/post-body-textarea';

const POST_MAX = 1000;
const MAX_IMAGES = 9;
const MAX_ATTACHMENTS = 3;
const HASHTAG_SUGGESTIONS = [
  { tag: 'mixnhiethuyet', views: '7.0K' },
  { tag: 'thuthachdangvideo6', views: '233.7K' },
  { tag: 'muaphieulurudigioi', views: '17.5K' },
  { tag: 'tuyendungnhasangtaqovn2026', views: '17.2K' },
];

interface UploadImageItem {
  id: string;
  file: File;
  previewUrl: string;
  remoteUrl?: string;
}

interface UploadAttachmentItem {
  id: string;
  file: File;
  remoteUrl?: string;
}

interface CreatePostPayload {
  content: string;
  imageUrls: string[];
  attachmentUrls?: string[];
  hashtags: string[];
  locationText?: string;
  status?: 'draft' | 'published';
}

function normalizeHashtag(raw: string): string {
  return raw
    .replace(/^#/, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\p{L}\p{N}_-]/gu, '')
    .slice(0, 24);
}

/** Lấy hashtag từ nội dung body (theo token #... không chứa khoảng trắng). */
function extractHashtagsFromContent(text: string): string[] {
  const tags: string[] = [];
  const re = /#([^\s#]+)/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const n = normalizeHashtag(m[1] ?? '');
    if (!n) continue;
    if (!tags.some((t) => t.toLowerCase() === n.toLowerCase())) tags.push(n);
  }
  return tags;
}

/** Chèn hashtag vào cuối body (xuống dòng nếu cần), giữ format xuống dòng. */
function appendHashtagToBody(prev: string, tag: string): string {
  const n = normalizeHashtag(tag);
  if (!n) return prev;
  const piece = `#${n}`;
  if (prev.length === 0) return piece;
  const last = prev.slice(-1);
  if (last === '\n' || last === ' ' || last === '\t') return `${prev}${piece}`;
  return `${prev}\n${piece}`;
}

function normalizeLineEndingsForStorage(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

/** Xóa mọi lần xuất hiện #tag / ##tag khỏi body. */
function removeHashtagFromBody(text: string, rawTag: string): string {
  const tag = normalizeHashtag(rawTag);
  if (!tag) return text;
  const esc = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let out = text.replace(new RegExp(`#+${esc}`, 'giu'), '');
  out = out.replace(/[ \t]{2,}/g, ' ');
  out = out.replace(/\n{3,}/g, '\n\n');
  return out;
}

function makeClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function UploadPostPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [showHashtagInput, setShowHashtagInput] = useState(false);
  const [images, setImages] = useState<UploadImageItem[]>([]);
  const [attachments, setAttachments] = useState<UploadAttachmentItem[]>([]);
  const [locationText, setLocationText] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hashtagInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);
  const attachmentsRef = useRef(attachments);
  const keyboardInsetRef = useRef(0);
  const mobileBodyFieldRef = useRef<PostBodyTextareaHandle>(null);
  const desktopBodyFieldRef = useRef<PostBodyTextareaHandle>(null);
  const pendingScrollBodyEndRef = useRef(false);

  const tagsInBody = useMemo(() => extractHashtagsFromContent(content), [content]);
  const bodyTrimLen = content.replace(/\u00a0/g, ' ').trim().length;
  const canSubmit =
    !submitting && (bodyTrimLen > 0 || images.length > 0 || attachments.length > 0);
  const count = useMemo(() => content.length, [content.length]);

  useEffect(() => {
    if (!showHashtagInput) return;
    hashtagInputRef.current?.focus();
  }, [showHashtagInput]);

  useLayoutEffect(() => {
    if (!pendingScrollBodyEndRef.current) return;
    pendingScrollBodyEndRef.current = false;
    mobileBodyFieldRef.current?.scrollToEnd();
    desktopBodyFieldRef.current?.scrollToEnd();
  }, [content]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const viewport = window.visualViewport;
    let frame = 0;

    const updateInset = () => {
      const nextInset = Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop));
      if (Math.abs(nextInset - keyboardInsetRef.current) < 2) return;
      keyboardInsetRef.current = nextInset;
      setKeyboardInset(nextInset);
    };

    const scheduleUpdate = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateInset);
    };

    scheduleUpdate();
    viewport.addEventListener('resize', scheduleUpdate);
    viewport.addEventListener('scroll', scheduleUpdate);
    window.addEventListener('orientationchange', scheduleUpdate);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      viewport.removeEventListener('resize', scheduleUpdate);
      viewport.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('orientationchange', scheduleUpdate);
    };
  }, []);

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((x) => x.id !== id));
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((x) => x.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  const addHashtag = (raw: string) => {
    const normalized = normalizeHashtag(raw);
    if (!normalized) {
      toast.message('Hashtag không hợp lệ.');
      return;
    }
    if (extractHashtagsFromContent(content).some((t) => t.toLowerCase() === normalized.toLowerCase())) {
      toast.message('Hashtag đã có trong bài.');
      return;
    }
    const next = appendHashtagToBody(content, normalized);
    if (next.length > POST_MAX) {
      toast.message('Bài đã đủ độ dài tối đa.');
      return;
    }
    pendingScrollBodyEndRef.current = true;
    setContent(next);
    setHashtagInput('');
  };

  const closeHashtagPanel = () => {
    setShowHashtagInput(false);
    setHashtagInput('');
  };

  const handlePickPostMedia = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const files = Array.from(fileList);
    const nextImg = [...imagesRef.current];
    const nextAtt = [...attachmentsRef.current];

    for (const file of files) {
      const err = validatePostMediaFile(file);
      if (err) {
        toast.error(err, { description: file.name });
        continue;
      }
      if (file.type === 'application/pdf') {
        if (nextAtt.length >= MAX_ATTACHMENTS) {
          toast.message(`Tối đa ${MAX_ATTACHMENTS} file PDF.`);
          break;
        }
        nextAtt.push({ id: makeClientId(), file });
        continue;
      }
      if (nextImg.length >= MAX_IMAGES) {
        toast.message(`Tối đa ${MAX_IMAGES} ảnh cho mỗi post.`);
        break;
      }
      nextImg.push({
        id: makeClientId(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setImages(nextImg);
    setAttachments(nextAtt);
  };

  const uploadMediaToS3 = async (file: File): Promise<string> => {
    const presign = await apiClient.post<{ uploadUrl: string; publicUrl: string }>(
      '/upload/post-image/presign',
      { fileType: file.type },
    );
    const { uploadUrl, publicUrl } = presign.data;
    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!putRes.ok) {
      throw new Error('upload_failed');
    }
    return publicUrl;
  };

  const uploadImageIfNeeded = async (item: UploadImageItem): Promise<string> => {
    if (item.remoteUrl) return item.remoteUrl;
    return uploadMediaToS3(item.file);
  };

  const uploadAttachmentIfNeeded = async (item: UploadAttachmentItem): Promise<string> => {
    if (item.remoteUrl) return item.remoteUrl;
    return uploadMediaToS3(item.file);
  };

  const resolveLocationFromDevice = async () => {
    if (locationLoading) return;
    setLocationLoading(true);
    try {
      const pos = await getBrowserPosition();
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `/api/geocode/reverse?lat=${encodeURIComponent(String(latitude))}&lon=${encodeURIComponent(String(longitude))}`,
      );
      if (!res.ok) throw new Error('geocode');
      const data = (await res.json()) as { displayName?: string; error?: string };
      if (data.error || !data.displayName?.trim()) throw new Error('empty');
      setLocationText(data.displayName.trim().slice(0, 120));
      toast.success('Đã gắn địa điểm');
    } catch {
      toast.error('Không lấy được địa điểm', {
        description: 'Cho phép truy cập vị trí trình duyệt và thử lại.',
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const clearLocation = () => {
    setLocationText('');
    toast.message('Đã bỏ địa điểm');
  };

  const submitPost = async (status: 'published' | 'draft') => {
    if (submitting) return;
    const hashtagsPayload = extractHashtagsFromContent(content);
    if (!content.replace(/\u00a0/g, ' ').trim() && images.length === 0 && attachments.length === 0) {
      toast.error('Post cần nội dung, ít nhất 1 ảnh hoặc 1 file PDF.');
      return;
    }
    try {
      setSubmitting(true);
      const stagedS3Urls: string[] = [];
      try {
        for (const image of images) {
          stagedS3Urls.push(await uploadImageIfNeeded(image));
        }
        for (const att of attachments) {
          stagedS3Urls.push(await uploadAttachmentIfNeeded(att));
        }

        const imageUrls = stagedS3Urls.slice(0, images.length);
        const attachmentUrlsSlice = stagedS3Urls.slice(images.length);

        const payload: CreatePostPayload = {
          content: normalizeLineEndingsForStorage(content),
          imageUrls,
          ...(attachmentUrlsSlice.length > 0 ? { attachmentUrls: attachmentUrlsSlice } : {}),
          hashtags: hashtagsPayload,
          status,
          ...(locationText.trim() ? { locationText: locationText.trim() } : {}),
        };
        await apiClient.post('/posts', payload);
      } catch {
        await rollbackPostStagedUploads(stagedS3Urls);
        throw new Error('submit_failed');
      }
      toast.success(status === 'published' ? 'Đã đăng post' : 'Đã lưu nháp post');
      router.push('/upload');
    } catch {
      toast.error('Không thể gửi post', { description: 'Vui lòng thử lại sau.' });
    } finally {
      setSubmitting(false);
    }
  };

  const hashtagSuggestionsBlock = (
    <ul className="mt-2 space-y-1">
      {HASHTAG_SUGGESTIONS.map((item) => (
        <li key={item.tag}>
          <button
            type="button"
            onClick={() => addHashtag(item.tag)}
            className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-slate-50"
          >
            <span className="inline-flex items-center gap-2 text-slate-700">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-[#00A1D6]">
                <Hash className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-medium">#{item.tag}</span>
            </span>
            <span className="text-xs text-slate-400">{item.views}</span>
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Mobile: composer kiểu app, body luôn hiện; hashtag mở ngay dưới body */}
      <div className="h-[100dvh] overflow-hidden bg-[#F5F5F5] text-slate-900 md:hidden">
        <main className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-20 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <header className="shrink-0 py-1">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-200/70"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>

              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => submitPost('published')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                  canSubmit ? 'bg-[#00A1D6] text-white hover:bg-[#00b3ea]' : 'bg-[#BEEAF7] text-white/95',
                )}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                ) : (
                  <Send className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                )}
                Gửi
              </button>
            </div>
          </header>

          <section className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-3">
            <PostBodyTextarea
              ref={mobileBodyFieldRef}
              value={content}
              onChange={(v) => setContent(v)}
              maxLength={POST_MAX}
              disabled={submitting}
              placeholder="Thêm chủ đề và địa điểm để nhiều người nhìn thấy hơn nhé~"
              className={cn('w-full shrink-0', !showHashtagInput && 'min-h-0 flex-1')}
              editorClassName="text-base leading-relaxed"
              minHeightClassName={
                showHashtagInput ? 'min-h-[140px] max-h-[28dvh]' : 'min-h-[220px] max-h-[42dvh]'
              }
            />

            <p className="shrink-0 text-right text-xs text-slate-400">
              {count}/{POST_MAX}
            </p>

            {showHashtagInput ? (
              <div className="shrink-0 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">Thêm hashtag</p>
                  <button
                    type="button"
                    onClick={closeHashtagPanel}
                    className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
                    aria-label="Đóng nhập hashtag"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-medium text-[#00A1D6]">#</span>
                  <input
                    ref={hashtagInputRef}
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addHashtag(hashtagInput);
                      }
                      if (e.key === 'Escape') closeHashtagPanel();
                    }}
                    placeholder="Nhập hashtag..."
                    className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-base text-slate-800 outline-none focus-visible:border-cyan-300"
                  />
                  <button
                    type="button"
                    onClick={() => addHashtag(hashtagInput)}
                    className="shrink-0 rounded-xl bg-[#00A1D6] px-3 py-2 text-xs font-semibold text-white hover:bg-[#00b3ea]"
                  >
                    Thêm
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-400">Gợi ý nhanh</p>
                {hashtagSuggestionsBlock}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= MAX_IMAGES && attachments.length >= MAX_ATTACHMENTS}
              className="flex h-36 w-36 shrink-0 items-center justify-center rounded-xl bg-slate-200/70 text-slate-300 disabled:opacity-40"
            >
              <Plus className="h-10 w-10" strokeWidth={1.25} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={POST_MEDIA_ACCEPT}
              multiple
              className="hidden"
              onChange={(e) => {
                handlePickPostMedia(e.target.files);
                e.currentTarget.value = '';
              }}
            />

            {images.length > 0 ? (
              <div className="shrink-0 rounded-xl border border-slate-200/90 bg-white p-2.5">
                <p className="mb-2 text-xs font-medium text-slate-600">
                  Ảnh đã chọn ({images.length}/{MAX_IMAGES})
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image) => (
                    <div key={image.id} className="relative overflow-hidden rounded-lg bg-slate-200">
                      <img src={image.previewUrl} alt="" className="h-18 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute right-1 top-1 rounded-full bg-black/55 p-1 text-white"
                        aria-label="Xóa ảnh"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {attachments.length > 0 ? (
              <div className="shrink-0 rounded-xl border border-slate-200/90 bg-white p-2.5">
                <p className="mb-2 text-xs font-medium text-slate-600">
                  File PDF ({attachments.length}/{MAX_ATTACHMENTS})
                </p>
                <ul className="space-y-2">
                  {attachments.map((att) => (
                    <li
                      key={att.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2 py-2"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-xs text-slate-700">
                        <FileText className="h-4 w-4 shrink-0 text-[#00A1D6]" aria-hidden />
                        <span className="truncate font-medium">{att.file.name}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="shrink-0 rounded-full p-1 text-slate-500 hover:bg-slate-200"
                        aria-label="Xóa file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="shrink-0 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={locationLoading || submitting}
                onClick={() => {
                  if (locationText) {
                    clearLocation();
                  } else {
                    void resolveLocationFromDevice();
                  }
                }}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs text-slate-700 disabled:opacity-50"
              >
                {locationLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                )}
                {locationText ? 'Bỏ địa điểm' : 'Định vị'}
              </button>
              {locationText ? (
                <p className="line-clamp-2 min-w-0 flex-1 text-xs text-slate-600">{locationText}</p>
              ) : null}
            </div>
          </section>

          <footer
            className="fixed inset-x-0 bottom-0 z-20 mx-auto flex h-12 w-full max-w-md items-center gap-3 border-t border-slate-200 bg-[#F5F5F5] px-4 pb-[max(0.25rem,env(safe-area-inset-bottom))] transition-transform duration-200 ease-out will-change-transform"
            style={{ transform: `translateY(-${keyboardInset}px)` }}
          >
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-200/70 disabled:pointer-events-none disabled:opacity-40"
              aria-label="Thêm ảnh hoặc file PDF"
              disabled={submitting || (images.length >= MAX_IMAGES && attachments.length >= MAX_ATTACHMENTS)}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-200/70 disabled:pointer-events-none disabled:opacity-40"
              aria-label="Thêm hashtag"
              disabled={submitting}
              onClick={() => setShowHashtagInput(true)}
            >
              <Hash className="h-5 w-5" />
            </button>
          </footer>
        </main>
      </div>

      {/* Desktop: bố cục studio rộng, không dùng chung layout mobile */}
      <div className="hidden min-h-screen bg-[#F4F6F9] text-slate-900 md:block">
        <header className="border-b border-slate-200/90 bg-white">
          <div className={cn(SITE_MAIN_CONTENT_CLASS, 'flex items-center justify-between gap-4 px-6 py-4 lg:px-8')}>
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
                aria-label="Quay lại"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#00A1D6]">Creator</p>
                <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">Đăng post</h1>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => submitPost('draft')}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                Lưu nháp
              </button>
              <button
                type="button"
                disabled={!canSubmit || submitting}
                onClick={() => submitPost('published')}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold shadow-sm transition-colors',
                  canSubmit && !submitting
                    ? 'bg-[#00A1D6] text-white hover:bg-[#00b3ea]'
                    : 'cursor-not-allowed bg-slate-200 text-slate-500',
                )}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Đăng bài
              </button>
            </div>
          </div>
        </header>

        <div className={cn(SITE_MAIN_CONTENT_CLASS, 'px-6 py-8 lg:px-8')}>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <label htmlFor="post-content-desktop" className="text-sm font-semibold text-slate-800">
                  Nội dung
                </label>
                <PostBodyTextarea
                  ref={desktopBodyFieldRef}
                  id="post-content-desktop"
                  value={content}
                  onChange={(v) => setContent(v)}
                  maxLength={POST_MAX}
                  disabled={submitting}
                  placeholder="Viết nội dung post — có thể kèm địa điểm, cảm xúc, hook ngắn..."
                  className="mt-3"
                  editorClassName="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base leading-relaxed shadow-sm outline-none transition-shadow focus-within:border-cyan-300 focus-within:ring-4 focus-within:ring-cyan-100"
                  mirrorBgClassName="bg-white"
                  minHeightClassName="min-h-[320px] max-h-[min(60vh,520px)] resize-y"
                />
                <p className="mt-2 text-right text-xs text-slate-400">
                  {count}/{POST_MAX}
                </p>
              </section>

              <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-800">Ảnh và file đính kèm</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Ảnh: JPEG, PNG, WebP, GIF (tối đa {MAX_IMAGES} ảnh, mỗi ảnh ≤ 5MB). PDF: tối đa {MAX_ATTACHMENTS} file, mỗi file ≤ 10MB.
                </p>
                <div className="mt-4 flex flex-wrap items-start gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={
                      (images.length >= MAX_IMAGES && attachments.length >= MAX_ATTACHMENTS) || submitting
                    }
                    className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-cyan-300 hover:bg-cyan-50/40 disabled:opacity-50"
                  >
                    <Plus className="h-10 w-10" strokeWidth={1.25} />
                  </button>
                  <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                      >
                        <img src={image.previewUrl} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/75"
                          aria-label="Xóa ảnh"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {attachments.length > 0 ? (
                  <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    {attachments.map((att) => (
                      <li
                        key={att.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                      >
                        <span className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
                          <FileText className="h-4 w-4 shrink-0 text-[#00A1D6]" aria-hidden />
                          <span className="truncate font-medium">{att.file.name}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="shrink-0 rounded-full p-1.5 text-slate-500 hover:bg-slate-200"
                          aria-label="Xóa file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            </div>

            <aside className="space-y-6 lg:col-span-5">
              <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-800">Hashtag</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Gõ <span className="font-mono text-slate-600">#tag</span> trong nội dung hoặc chọn gợi ý — hashtag giúp bài dễ được khám phá hơn.
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="flex h-11 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-lg font-semibold text-[#00A1D6]">
                    #
                  </span>
                  <input
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addHashtag(hashtagInput);
                      }
                    }}
                    placeholder="Nhập rồi Enter hoặc bấm Thêm"
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-800 shadow-sm outline-none focus-visible:border-cyan-300 focus-visible:ring-4 focus-visible:ring-cyan-100"
                  />
                  <button
                    type="button"
                    onClick={() => addHashtag(hashtagInput)}
                    className="shrink-0 rounded-xl bg-[#00A1D6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00b3ea]"
                  >
                    Thêm
                  </button>
                </div>
                {tagsInBody.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tagsInBody.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setContent((prev) => removeHashtagFromBody(prev, topic))}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <Hash className="h-3.5 w-3.5 text-[#00A1D6]" />
                        {topic}
                        <X className="h-3 w-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                ) : null}
                <p className="mt-4 text-xs font-medium text-slate-500">Gợi ý</p>
                {hashtagSuggestionsBlock}
              </section>

              <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-800">Địa điểm</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Dùng vị trí thiết bị, sau đó reverse geocode (OpenStreetMap hoặc Mapbox nếu cấu hình
                  MAPBOX_ACCESS_TOKEN trên server).
                </p>
                <button
                  type="button"
                  disabled={locationLoading || submitting}
                  onClick={() => {
                    if (locationText) {
                      clearLocation();
                    } else {
                      void resolveLocationFromDevice();
                    }
                  }}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  {locationLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#00A1D6]" aria-hidden />
                  ) : (
                    <MapPin className="h-4 w-4 text-[#00A1D6]" aria-hidden />
                  )}
                  {locationText ? 'Bỏ địa điểm' : 'Lấy vị trí hiện tại'}
                </button>
                {locationText ? (
                  <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700">
                    {locationText}
                  </p>
                ) : null}
              </section>

              <section className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-5 text-sm text-slate-500">
                <p className="font-medium text-slate-700">Mẹo</p>
                <p className="mt-2 leading-relaxed">
                  Viết rõ chủ đề, thêm ảnh minh họa và 2–5 hashtag liên quan giúp post dễ được khám phá hơn.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

