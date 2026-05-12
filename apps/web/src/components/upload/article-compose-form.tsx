'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bold,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Quote,
  Underline,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { creatorInputClassName, creatorSelectClassName } from './upload.controls';

const TITLE_MAX = 80;
const TITLE_MIN = 8;
const CONTENT_TEXT_MIN = 120;
const BODY_MAX = 50000;
const MIN_HASHTAGS = 2;
const MAX_HASHTAGS = 12;
const COVER_MAX_BYTES = 5 * 1024 * 1024;

const CATEGORIES = [
  { value: '', label: 'Chọn chuyên mục' },
  { value: 'it', label: 'Công nghệ thông tin' },
  { value: 'soft-skill', label: 'Kĩ năng mềm' },
  { value: 'communication', label: 'Kĩ năng giao tiếp' },
  { value: 'entertainment', label: 'Nội dung giải trí' },
] as const;

const TAG_SUGGESTIONS = ['KienThuc', 'HocTap', 'Career', 'Tips', 'Media'];
const FONT_SIZE_OPTIONS = [
  { value: '3', label: '14px' },
  { value: '4', label: '16px' },
  { value: '5', label: '18px' },
  { value: '6', label: '24px' },
] as const;

type ArticleErrors = {
  cover: string | undefined;
  title: string | undefined;
  category: string | undefined;
  hashtags: string | undefined;
  content: string | undefined;
};

function normalizeTag(raw: string): string {
  return raw
    .replace(/^#/, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\p{L}\p{N}_-]/gu, '')
    .slice(0, 24);
}

function htmlToText(html: string): string {
  if (!html.trim()) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function hasSuspiciousRepetition(text: string): boolean {
  return /(.)\1{7,}/.test(text);
}

export function ArticleComposeForm() {
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [fontSize, setFontSize] = useState<string>('4');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ArticleErrors>({
    cover: undefined,
    title: undefined,
    category: undefined,
    hashtags: undefined,
    content: undefined,
  });

  const coverInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const coverPreview = useMemo(() => (coverFile ? URL.createObjectURL(coverFile) : null), [coverFile]);
  const contentText = useMemo(() => (typeof window === 'undefined' ? '' : htmlToText(contentHtml)), [contentHtml]);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const addTag = (raw: string) => {
    const normalized = normalizeTag(raw);
    if (!normalized) return;
    if (tags.some((t) => t.toLowerCase() === normalized.toLowerCase())) return;
    if (tags.length >= MAX_HASHTAGS) {
      toast.warning(`Tối đa ${MAX_HASHTAGS} hashtag`);
      return;
    }
    setTags((prev) => [...prev, normalized]);
    setTagInput('');
    setErrors((prev) => ({ ...prev, hashtags: undefined }));
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((x) => x !== tag));
  };

  const applyEditorCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setContentHtml(editorRef.current?.innerHTML ?? '');
  };

  const validate = (): boolean => {
    const nextErrors: ArticleErrors = {
      cover: undefined,
      title: undefined,
      category: undefined,
      hashtags: undefined,
      content: undefined,
    };

    if (!coverFile) {
      nextErrors.cover = 'Ảnh bìa là bắt buộc.';
    }

    const titleTrimmed = title.trim();
    if (!titleTrimmed) {
      nextErrors.title = 'Tiêu đề là bắt buộc.';
    } else if (titleTrimmed.length < TITLE_MIN) {
      nextErrors.title = `Tiêu đề cần ít nhất ${TITLE_MIN} ký tự để đủ rõ nghĩa.`;
    }

    if (!category) {
      nextErrors.category = 'Vui lòng chọn chuyên mục.';
    }

    if (tags.length < MIN_HASHTAGS) {
      nextErrors.hashtags = `Cần ít nhất ${MIN_HASHTAGS} hashtag.`;
    }

    const text = contentText;
    if (!text) {
      nextErrors.content = 'Nội dung bài viết là bắt buộc.';
    } else if (text.length < CONTENT_TEXT_MIN) {
      nextErrors.content = `Nội dung tối thiểu ${CONTENT_TEXT_MIN} ký tự để đảm bảo chất lượng bài.`;
    } else if (hasSuspiciousRepetition(text)) {
      nextErrors.content = 'Nội dung có dấu hiệu lặp ký tự bất thường, vui lòng chỉnh lại.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleDraft = () => {
    toast.message('Đã lưu nháp bài viết', { description: 'Tiếp tục chỉnh sửa bất cứ lúc nào.' });
  };

  const handlePublish = () => {
    if (!validate()) {
      toast.error('Thông tin chưa hợp lệ', { description: 'Vui lòng kiểm tra các trường bắt buộc.' });
      return;
    }
    toast.success('Đã gửi xuất bản', {
      description: 'Bài viết hợp lệ theo chuẩn chất lượng cơ bản cho nhóm nhỏ.',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Viết bài</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tạo bài viết rõ ràng, có cấu trúc để dễ phân phối và tăng khả năng được đề xuất.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <div>
            <p className="text-sm font-medium text-slate-800">
              Ảnh bìa <span className="text-rose-500">*</span>
            </p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
              {coverPreview ? (
                <div className="relative aspect-[16/10] w-full max-w-md overflow-hidden rounded-2xl ring-1 ring-slate-200 sm:max-w-sm">
                  <img src={coverPreview} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverFile(null)}
                    className="absolute right-2 top-2 rounded-full bg-black/55 p-1.5 text-white transition-colors hover:bg-black/70"
                    aria-label="Xóa ảnh bìa"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className={cn(
                  'flex h-36 w-full max-w-md flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 transition-colors hover:border-cyan-300 hover:bg-cyan-50/40 sm:h-40 sm:max-w-[200px]',
                  !coverPreview && 'sm:max-w-md',
                )}
              >
                <ImagePlus className="h-8 w-8 text-slate-400" strokeWidth={1.25} />
                <span className="mt-2 text-xs font-medium text-slate-500">
                  {coverPreview ? 'Đổi ảnh bìa' : 'Thêm ảnh bìa'}
                </span>
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > COVER_MAX_BYTES) {
                    setErrors((prev) => ({ ...prev, cover: 'Ảnh bìa tối đa 5MB.' }));
                    toast.error('Ảnh bìa quá lớn', { description: 'Vui lòng chọn file <= 5MB.' });
                    return;
                  }
                  setCoverFile(f);
                  setErrors((prev) => ({ ...prev, cover: undefined }));
                }}
              />
            </div>
            {errors.cover ? <p className="mt-2 text-xs text-rose-500">{errors.cover}</p> : null}
          </div>

          <div>
            <div className="mb-2 flex items-end justify-between gap-2">
              <label htmlFor="article-title" className="text-sm font-medium text-slate-800">
                Tiêu đề <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs tabular-nums text-slate-400">
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              id="article-title"
              maxLength={TITLE_MAX}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="Tiêu đề rõ ràng, chứa từ khóa chính ở đoạn đầu"
              className={cn(creatorInputClassName, errors.title && 'border-rose-300 focus-visible:ring-rose-100')}
            />
            {errors.title ? <p className="mt-2 text-xs text-rose-500">{errors.title}</p> : null}
          </div>

          <div>
            <label htmlFor="article-category" className="text-sm font-medium text-slate-800">
              Chuyên mục <span className="text-rose-500">*</span>
            </label>
            <div className="relative mt-2 max-w-md">
              <select
                id="article-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setErrors((prev) => ({ ...prev, category: undefined }));
                }}
                className={cn(
                  creatorSelectClassName,
                  errors.category && 'border-rose-300 focus-visible:ring-rose-100',
                )}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value || 'x'} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            {errors.category ? <p className="mt-2 text-xs text-rose-500">{errors.category}</p> : null}
          </div>

          <div>
            <p className="text-sm font-medium text-slate-800">
              Hashtag <span className="text-rose-500">*</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-[#00A1D6] ring-1 ring-cyan-100"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full p-0.5 hover:bg-cyan-100"
                    aria-label={`Xóa ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(tagInput);
                  setErrors((prev) => ({ ...prev, hashtags: undefined }));
                }
              }}
              placeholder={`Nhấn Enter để thêm hashtag (ít nhất ${MIN_HASHTAGS})`}
              className={cn(
                creatorInputClassName,
                'mt-2 max-w-md py-2.5',
                errors.hashtags && 'border-rose-300 focus-visible:ring-rose-100',
              )}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TAG_SUGGESTIONS.filter((t) => !tags.includes(t)).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addTag(t)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 hover:border-cyan-200 hover:text-[#00A1D6]"
                >
                  + {t}
                </button>
              ))}
            </div>
            {errors.hashtags ? <p className="mt-2 text-xs text-rose-500">{errors.hashtags}</p> : null}
          </div>

          <div>
            <div className="mb-2 flex items-end justify-between gap-2">
              <label className="text-sm font-medium text-slate-800">
                Nội dung bài viết <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs tabular-nums text-slate-400">
                {contentText.length}/{BODY_MAX}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 p-2">
                <button
                  type="button"
                  onClick={() => applyEditorCommand('formatBlock', '<h1>')}
                  className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                  aria-label="Heading 1"
                >
                  <Heading1 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyEditorCommand('formatBlock', '<h2>')}
                  className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                  aria-label="Heading 2"
                >
                  <Heading2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyEditorCommand('formatBlock', '<h3>')}
                  className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                  aria-label="Heading 3"
                >
                  <Heading3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyEditorCommand('formatBlock', '<h4>')}
                  className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                  aria-label="Heading 4"
                >
                  <Heading4 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => applyEditorCommand('bold')}
                  className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                  aria-label="Bold"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyEditorCommand('underline')}
                  className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                  aria-label="Underline"
                >
                  <Underline className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyEditorCommand('italic')}
                  className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                  aria-label="Italic"
                >
                  <Italic className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => applyEditorCommand('insertUnorderedList')}
                  className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                  aria-label="Bullet List"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyEditorCommand('insertOrderedList')}
                  className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                  aria-label="Number List"
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyEditorCommand('formatBlock', '<blockquote>')}
                  className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                  aria-label="Quote"
                >
                  <Quote className="h-4 w-4" />
                </button>

                <select
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(e.target.value);
                    applyEditorCommand('fontSize', e.target.value);
                  }}
                  className={cn(creatorSelectClassName, 'ml-auto w-auto min-w-[110px] py-2 text-sm')}
                  aria-label="Font size"
                >
                  {FONT_SIZE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      Cỡ chữ {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className={cn(
                    'min-h-[280px] w-full px-4 py-3 text-base leading-relaxed text-slate-900 outline-none',
                    'prose prose-slate max-w-none',
                    errors.content && 'bg-rose-50/30',
                  )}
                  onInput={(e) => {
                    setContentHtml(e.currentTarget.innerHTML);
                    setErrors((prev) => ({ ...prev, content: undefined }));
                  }}
                  onBlur={(e) => setContentHtml(e.currentTarget.innerHTML)}
                />
                {!contentText ? (
                  <p className="pointer-events-none absolute left-4 top-3 text-sm text-slate-400">
                    Viết nội dung bài viết... (hỗ trợ Heading, list, quote, in đậm/in nghiêng/gạch
                    chân)
                  </p>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Mẹo chất lượng: mở bài rõ ý, nội dung có đoạn/heading, ưu tiên thông tin thực tế.
            </p>
            {errors.content ? <p className="mt-2 text-xs text-rose-500">{errors.content}</p> : null}
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handleDraft}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="rounded-xl bg-[#00A1D6] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#00b3ea]"
          >
            Xuất bản bài viết
          </button>
        </div>
      </div>
    </motion.div>
  );
}
