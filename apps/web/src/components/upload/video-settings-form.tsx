'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  creatorInputClassName,
  creatorSelectClassName,
  creatorTextareaClassName,
} from './upload.controls';
import type { UploadedVideo, VideoSettings } from './upload.types';

const TITLE_MAX = 80;

const CATEGORIES = [
  { value: '', label: 'Chọn danh mục' },
  { value: 'life', label: 'Cuộc sống' },
  { value: 'entertainment', label: 'Giải trí' },
  { value: 'gaming', label: 'Game' },
  { value: 'knowledge', label: 'Kiến thức' },
  { value: 'sports', label: 'Thể thao' },
  { value: 'music', label: 'Âm nhạc' },
];

const TOPICS: { id: string; label: string; event?: boolean }[] = [
  { id: 'daily', label: 'Cuộc sống hằng ngày' },
  { id: 'tech-review', label: 'Review công nghệ' },
  { id: 'travel', label: 'Du lịch & khám phá', event: true },
  { id: 'esports', label: 'Esports mùa giải', event: true },
  { id: 'study', label: 'Học tập & phát triển' },
  { id: 'food', label: 'Ẩm thực' },
];

const HASHTAG_SUGGESTIONS = ['Vlog', '4K', 'BehindTheScenes', 'Shorts', 'CreatorTips'];

interface VideoSettingsFormProps {
  video: UploadedVideo;
  onSubmit: (settings: VideoSettings) => void;
  onBack: () => void;
}

export function VideoSettingsForm({
  video,
  onSubmit,
  onBack,
}: VideoSettingsFormProps) {
  const previewUrl = useMemo(() => URL.createObjectURL(video.file), [video.file]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const [settings, setSettings] = useState<VideoSettings>({
    title: '',
    description: '',
    category: '',
    type: 'original',
    tags: [],
    allowRemix: false,
    isDraft: false,
    hashtags: ['Cuộc sống', 'Livestream', 'Bida'],
    topics: ['daily'],
    schedulePublish: false,
    commercialPromo: false,
    advancedOpen: false,
    selectedCoverFrameIndex: 0,
  });

  const [hashtagInput, setHashtagInput] = useState('');

  const toggleTopic = (id: string) => {
    setSettings((s) => ({
      ...s,
      topics: s.topics.includes(id) ? s.topics.filter((t) => t !== id) : [...s.topics, id],
    }));
  };

  const addHashtag = (raw: string) => {
    const t = raw.replace(/^#/, '').trim();
    if (!t || settings.hashtags.includes(t)) return;
    setSettings((s) => ({ ...s, hashtags: [...s.hashtags, t] }));
    setHashtagInput('');
  };

  const removeHashtag = (tag: string) => {
    setSettings((s) => ({ ...s, hashtags: s.hashtags.filter((h) => h !== tag) }));
  };

  const handleSaveDraft = () => {
    setSettings((s) => ({ ...s, isDraft: true }));
    toast.message('Đã lưu nháp', { description: 'Bạn có thể tiếp tục chỉnh sửa sau.' });
  };

  const handlePublish = () => {
    if (!settings.title.trim()) {
      toast.error('Thiếu tiêu đề', { description: 'Vui lòng nhập tiêu đề video.' });
      return;
    }
    setSettings((s) => ({ ...s, isDraft: false }));
    onSubmit({ ...settings, isDraft: false });
    toast.success('Đã gửi đăng video ngắn', {
      description: 'Luồng API thực tế sẽ được nối sau.',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            ← Quay lại upload
          </button>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Hoàn tất — Video ngắn
          </h2>
          <p className="mt-1 truncate text-sm text-slate-500" title={video.name}>
            {video.name}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Nội dung sẽ ưu tiên hiển thị dọc trong luồng Shorts.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-semibold text-slate-900">Cài đặt cơ bản</h3>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-10">
            {/* Ảnh bìa */}
            <div>
              <p className="text-sm font-medium text-slate-800">Chọn ảnh bìa</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                Hệ thống sẽ tự động đề xuất các khung hình phù hợp làm ảnh bìa
              </p>
              <div className="mt-5 flex flex-col gap-4 lg:flex-row">
                <div
                  className={cn(
                    'relative w-full overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/80',
                    'aspect-[9/16] max-w-[220px] sm:max-w-[260px]',
                  )}
                >
                  <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/25 to-transparent" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, selectedCoverFrameIndex: i }))}
                    className={[
                      'relative h-14 w-24 overflow-hidden rounded-xl ring-1 transition-all duration-200',
                      settings.selectedCoverFrameIndex === i
                        ? 'ring-2 ring-[#00A1D6] ring-offset-2 ring-offset-white'
                        : 'ring-slate-200 hover:ring-cyan-200',
                    ].join(' ')}
                    aria-label={`Khung gợi ý ${i + 1}`}
                  >
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-cyan-50"
                      style={{ backgroundPosition: `${i * 22}% 40%` }}
                    />
                    <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1 text-[10px] font-medium text-white">
                      {String((i + 1) * 12).padStart(2, '0')}:0{i * 3}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tiêu đề */}
            <div>
              <div className="mb-2 flex items-end justify-between gap-3">
                <label htmlFor="video-title" className="text-sm font-medium text-slate-800">
                  Tiêu đề
                </label>
                <span className="text-xs tabular-nums text-slate-400">
                  {settings.title.length}/{TITLE_MAX}
                </span>
              </div>
              <input
                id="video-title"
                maxLength={TITLE_MAX}
                value={settings.title}
                onChange={(e) => setSettings((s) => ({ ...s, title: e.target.value }))}
                placeholder={
                  'Hook ngắn gọn — ví dụ: 3 giây đầu quyết định lượt xem'
                }
                className={creatorInputClassName}
              />
            </div>

            {/* Loại nội dung */}
            <div>
              <p className="text-sm font-medium text-slate-800">Loại nội dung</p>
              <div className="mt-3 flex flex-wrap gap-6">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="radio"
                    name="content-type"
                    checked={settings.type === 'original'}
                    onChange={() => setSettings((s) => ({ ...s, type: 'original' }))}
                    className="h-4 w-4 border-slate-300 text-[#00A1D6] focus:ring-[#00A1D6]"
                  />
                  <span className="text-sm text-slate-700">Nội dung gốc</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="radio"
                    name="content-type"
                    checked={settings.type === 'repost'}
                    onChange={() => setSettings((s) => ({ ...s, type: 'repost' }))}
                    className="h-4 w-4 border-slate-300 text-[#00A1D6] focus:ring-[#00A1D6]"
                  />
                  <span className="text-sm text-slate-700">Đăng lại</span>
                </label>
              </div>
            </div>

            {/* Danh mục */}
            <div>
              <label htmlFor="category" className="text-sm font-medium text-slate-800">
                Danh mục
              </label>
              <div className="relative mt-2 max-w-xl">
                <select
                  id="category"
                  value={settings.category}
                  onChange={(e) => setSettings((s) => ({ ...s, category: e.target.value }))}
                  className={cn(creatorSelectClassName, 'text-slate-800')}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value || 'empty'} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Hashtag */}
            <div>
              <p className="text-sm font-medium text-slate-800">Hashtag</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {settings.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-sm font-medium text-[#00A1D6] ring-1 ring-cyan-100"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="rounded-full p-0.5 text-cyan-700/70 transition-colors hover:bg-cyan-100 hover:text-cyan-900"
                      aria-label={`Xóa ${tag}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addHashtag(hashtagInput);
                  }
                }}
                placeholder="Nhấn Enter để tạo hashtag"
                className={cn(creatorInputClassName, 'mt-3 max-w-xl')}
              />
              <p className="mt-2 text-xs text-slate-500">Gợi ý nhanh:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {HASHTAG_SUGGESTIONS.filter((h) => !settings.hashtags.includes(h)).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => addHashtag(h)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-cyan-200 hover:bg-cyan-50/60 hover:text-[#00A1D6]"
                  >
                    + {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Chủ đề */}
            <div>
              <p className="text-sm font-medium text-slate-800">Chủ đề tham gia</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {TOPICS.map((t) => {
                  const active = settings.topics.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTopic(t.id)}
                      className={[
                        'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm transition-all duration-200',
                        active
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200/90',
                      ].join(' ')}
                    >
                      {t.label}
                      {t.event ? (
                        <span
                          className={[
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            active ? 'bg-white/15 text-white' : 'bg-amber-100 text-amber-900',
                          ].join(' ')}
                        >
                          Sự kiện
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mô tả */}
            <div>
              <label htmlFor="description" className="text-sm font-medium text-slate-800">
                Mô tả video
              </label>
              <textarea
                id="description"
                rows={6}
                value={settings.description}
                onChange={(e) => setSettings((s) => ({ ...s, description: e.target.value }))}
                placeholder="Viết mô tả để nhiều người dễ tìm thấy video của bạn hơn..."
                className={cn(creatorTextareaClassName, 'mt-2')}
              />
            </div>

            {/* Cài đặt phát hành */}
            <div className="space-y-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
              <p className="text-sm font-medium text-slate-800">Cài đặt phát hành</p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">Đăng theo lịch</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Có thể hẹn giờ đăng trong vòng 15 ngày
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.schedulePublish}
                  onClick={() =>
                    setSettings((s) => ({ ...s, schedulePublish: !s.schedulePublish }))
                  }
                  className={[
                    'relative h-8 w-14 shrink-0 rounded-full transition-colors duration-200',
                    settings.schedulePublish ? 'bg-[#00A1D6]' : 'bg-slate-300',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200',
                      settings.schedulePublish ? 'left-7' : 'left-1',
                    ].join(' ')}
                  />
                </button>
              </div>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={settings.allowRemix}
                  onChange={(e) => setSettings((s) => ({ ...s, allowRemix: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00A1D6] focus:ring-[#00A1D6]"
                />
                <span className="text-sm text-slate-700">Cho phép reup/chỉnh sửa lại</span>
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={settings.commercialPromo}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, commercialPromo: e.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00A1D6] focus:ring-[#00A1D6]"
                />
                <span className="text-sm text-slate-700">Bật quảng bá thương mại</span>
              </label>
            </div>

            {/* Nâng cao */}
            <div className="rounded-2xl border border-slate-200/90">
              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, advancedOpen: !s.advancedOpen }))}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
              >
                Cài đặt nâng cao (bản quyền, bình luận, phụ đề, tương tác...)
                <motion.span
                  animate={{ rotate: settings.advancedOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-slate-400"
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {settings.advancedOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-100"
                  >
                    <div className="space-y-2 px-4 py-4 text-sm text-slate-600">
                      <p>• Bản quyền nhạc: tự khai báo hoặc dùng thư viện có license.</p>
                      <p>• Bình luận: mở / kiểm duyệt / tắt theo từng video.</p>
                      <p>• Phụ đề: tải SRT/VTT hoặc tạo tự động (khi API sẵn sàng).</p>
                      <p>• Tương tác: bình chọn, câu hỏi, chương trình ghim bình luận.</p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {/* Cột phải: tóm tắt */}
          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Xem nhanh
              </p>
              <div
                className={cn(
                  'mt-3 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/80',
                  'aspect-[9/16] max-w-[140px] mx-auto',
                )}
              >
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <p className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900">
                {settings.title || 'Chưa có tiêu đề'}
              </p>
              <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-500">
                {settings.description || 'Mô tả sẽ hiển thị tại đây...'}
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="rounded-xl bg-[#00A1D6] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#00b3ea]"
          >
            Đăng video ngắn
          </button>
        </div>
      </section>
    </motion.div>
  );
}
