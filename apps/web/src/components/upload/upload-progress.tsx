'use client';

import { useState, useEffect } from 'react';
import { RotateCw, X } from 'lucide-react';
import type { UploadedVideo } from './upload.types';

interface UploadProgressProps {
  video: UploadedVideo;
  onComplete: (video: UploadedVideo) => void;
  onCancel: () => void;
}

export function UploadProgress({ video, onComplete, onCancel }: UploadProgressProps) {
  const [progress, setProgress] = useState(5);
  const [remainingTime, setRemainingTime] = useState('4 phút');

  // Simulate upload progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete({ ...video }), 500);
          return 100;
        }
        return p + Math.random() * 25;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [video, onComplete]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Progress Card */}
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-foreground font-semibold">📹 Video đang upload</h3>
            <p className="text-muted-foreground mt-2 text-sm">{video.name}</p>
            <p className="text-muted-foreground mt-1 text-xs">{formatBytes(video.size)}</p>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-foreground text-xs font-medium">Tiến độ</span>
                <span className="text-primary text-xs font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-[#00aeec] to-cyan-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="text-muted-foreground mt-3 flex items-center gap-4 text-xs">
              <span>Đã upload {Math.round(progress)}%</span>
              <span>Còn khoảng {remainingTime}</span>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="ml-4 rounded-lg p-2 text-[#00aeec] transition-colors hover:bg-[#00aeec]/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Video Settings Preview */}
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h3 className="text-foreground mb-4 font-semibold">⚙️ Thiết lập video</h3>

        <div className="space-y-4">
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              Ảnh bìa (Thumbnail)
            </label>
            <div className="flex gap-2">
              <div className="flex h-16 w-28 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700">
                <span className="text-muted-foreground text-xs">Chọn ảnh</span>
              </div>
              <button className="border-input hover:bg-accent rounded-lg border px-3 py-1 text-sm transition-colors">
                Chọn
              </button>
            </div>
          </div>

          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">Tiêu đề video</label>
            <input
              type="text"
              placeholder="Nhập tiêu đề video"
              className="border-input bg-background placeholder:text-muted-foreground focus:ring-primary/50 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">Loại video</label>
              <select className="border-input bg-background focus:ring-primary/50 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none">
                <option>Video tự làm</option>
                <option>Video đăng lại</option>
              </select>
            </div>

            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">Chuyên mục</label>
              <select className="border-input bg-background focus:ring-primary/50 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none">
                <option>Chọn chuyên mục...</option>
                <option>Thể thao</option>
                <option>Gaming</option>
                <option>Âm nhạc</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="border-input hover:bg-accent flex-1 rounded-lg border px-4 py-3 font-medium transition-colors"
        >
          Hủy
        </button>
        <button className="bg-primary text-primary-foreground flex-1 rounded-lg px-4 py-3 font-medium transition-opacity hover:opacity-90">
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
