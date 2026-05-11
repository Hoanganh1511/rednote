'use client';

import { useState } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import type { UploadedVideo, VideoSettings } from './upload.types';

interface VideoSettingsFormProps {
  video: UploadedVideo;
  onSubmit: (settings: VideoSettings) => void;
  onBack: () => void;
}

export function VideoSettingsForm({ video, onSubmit, onBack }: VideoSettingsFormProps) {
  const [settings, setSettings] = useState<VideoSettings>({
    title: '',
    description: '',
    category: '',
    type: 'original',
    tags: [],
    allowRemix: false,
    isDraft: false,
    hashtags: [],
  });

  const [newTag, setNewTag] = useState('');
  const [newHashtag, setNewHashtag] = useState('');

  const handleAddTag = (tag: string) => {
    if (tag && !settings.tags.includes(tag)) {
      setSettings({ ...settings, tags: [...settings.tags, tag] });
      setNewTag('');
    }
  };

  const handleAddHashtag = (hashtag: string) => {
    if (hashtag && !settings.hashtags.includes(hashtag)) {
      setSettings({ ...settings, hashtags: [...settings.hashtags, hashtag] });
      setNewHashtag('');
    }
  };

  const suggestedTags = [
    'Ghi lại cuộc sống',
    'Livestream',
    'Record/Ghi hình',
    'Cầu lông',
    'Thể thao',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card flex items-center gap-4 rounded-lg p-4 shadow-sm">
        <button onClick={onBack} className="hover:bg-accent rounded-lg p-2 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-foreground font-semibold">Thiết lập thông tin video</h2>
          <p className="text-muted-foreground text-sm">{video.name}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="space-y-4 lg:col-span-2">
          {/* Title */}
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <label className="text-foreground mb-2 block text-sm font-medium">
              📝 Tiêu đề video <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              placeholder="Nhập tiêu đề video"
              maxLength={100}
              className="border-input bg-background focus:ring-primary/50 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
            <p className="text-muted-foreground mt-1 text-xs">{settings.title.length}/100</p>
          </div>

          {/* Description */}
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <label className="text-foreground mb-2 block text-sm font-medium">📄 Mô tả video</label>
            <textarea
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              placeholder="Nhập mô tả video..."
              maxLength={5000}
              rows={5}
              className="border-input bg-background focus:ring-primary/50 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
            <p className="text-muted-foreground mt-1 text-xs">{settings.description.length}/5000</p>
          </div>

          {/* Category & Type */}
          <div className="bg-card grid gap-4 rounded-lg p-4 shadow-sm sm:grid-cols-2">
            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">Chuyên mục</label>
              <select
                value={settings.category}
                onChange={(e) => setSettings({ ...settings, category: e.target.value })}
                className="border-input bg-background focus:ring-primary/50 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              >
                <option value="">Chọn chuyên mục...</option>
                <option value="sports">⚽ Thể thao</option>
                <option value="gaming">🎮 Gaming</option>
                <option value="music">🎵 Âm nhạc</option>
                <option value="entertainment">🎬 Giải trí</option>
                <option value="education">📚 Giáo dục</option>
              </select>
            </div>

            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">Loại video</label>
              <select
                value={settings.type}
                onChange={(e) =>
                  setSettings({ ...settings, type: e.target.value as 'original' | 'repost' })
                }
                className="border-input bg-background focus:ring-primary/50 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              >
                <option value="original">📹 Video tự làm</option>
                <option value="repost">🔄 Video đăng lại</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <h3 className="text-foreground mb-3 font-medium">🏷️ Tag hiện có</h3>
            <div className="mb-3 flex flex-wrap gap-2">
              {settings.tags.map((tag) => (
                <div
                  key={tag}
                  className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm"
                >
                  {tag}
                  <button
                    onClick={() =>
                      setSettings({ ...settings, tags: settings.tags.filter((t) => t !== tag) })
                    }
                    className="hover:opacity-60"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag(newTag)}
                placeholder="Thêm tag mới"
                className="border-input bg-background focus:ring-primary/50 flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              />
              <button
                onClick={() => handleAddTag(newTag)}
                className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              >
                Thêm
              </button>
            </div>

            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium">Tag gợi ý:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags
                  .filter((t) => !settings.tags.includes(t))
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      className="rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
                    >
                      + {tag}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Hashtags */}
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <h3 className="text-foreground mb-2 font-medium">📌 Hashtags & Chủ đề</h3>
            <p className="text-muted-foreground mb-3 text-xs">
              Tham gia các hashtag cộng đồng để tăng reach
            </p>

            <div className="mb-3 flex flex-wrap gap-2">
              {settings.hashtags.map((tag) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  #{tag}
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        hashtags: settings.hashtags.filter((t) => t !== tag),
                      })
                    }
                    className="hover:opacity-60"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHashtag(newHashtag)}
                placeholder="Thêm hashtag (không cần #)"
                className="border-input bg-background focus:ring-primary/50 flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              />
              <button
                onClick={() => handleAddHashtag(newHashtag)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Thêm
              </button>
            </div>
          </div>

          {/* Additional Options */}
          <div className="bg-card space-y-3 rounded-lg p-4 shadow-sm">
            <h3 className="text-foreground font-medium">⚙️ Tùy chọn thêm</h3>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={settings.allowRemix}
                onChange={(e) => setSettings({ ...settings, allowRemix: e.target.checked })}
                className="border-input h-4 w-4 rounded"
              />
              <span className="text-foreground text-sm">Cho phép người khác remix/chế lại</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" className="border-input h-4 w-4 rounded" />
              <span className="text-foreground text-sm">Khai báo quảng bá thương mại</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" className="border-input h-4 w-4 rounded" />
              <span className="text-foreground text-sm">Hẹn giờ đăng</span>
            </label>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Preview */}
          <div className="bg-card sticky top-24 rounded-lg p-4 shadow-sm">
            <h3 className="text-foreground mb-3 font-semibold">👁️ Xem trước</h3>

            <div className="mb-3 flex aspect-video items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
              <span className="text-muted-foreground text-sm">Video preview</span>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-foreground font-medium">{settings.title || 'Tiêu đề video'}</p>
              <p className="text-muted-foreground line-clamp-2 text-xs">
                {settings.description || 'Mô tả video sẽ hiển thị ở đây...'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => setSettings({ ...settings, isDraft: true })}
              className="border-input hover:bg-accent w-full rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            >
              💾 Lưu nháp
            </button>

            <button
              onClick={() => onSubmit(settings)}
              className="bg-primary text-primary-foreground w-full rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              ✓ Đăng ngay
            </button>

            <p className="text-muted-foreground text-center text-xs">
              Có thể đăng ngay cả khi chưa upload xong
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
