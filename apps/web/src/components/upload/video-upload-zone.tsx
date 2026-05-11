'use client';

import { useState, useRef } from 'react';
import { Cloud, Upload } from 'lucide-react';
import type { UploadedVideo } from './upload.types';

interface VideoUploadZoneProps {
  onVideoSelected: (video: UploadedVideo) => void;
}

export function VideoUploadZone({ onVideoSelected }: VideoUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find((f) => f.type.startsWith('video/'));

    if (videoFile) {
      processFile(videoFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []);
    const videoFile = files[0];

    if (videoFile) {
      processFile(videoFile);
    }
  };

  const processFile = (file: File) => {
    // Validate file size (2GB default)
    const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > MAX_SIZE) {
      alert(`File quá lớn. Tối đa ${MAX_SIZE / (1024 * 1024 * 1024)}GB`);
      return;
    }

    const video: UploadedVideo = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
    };

    onVideoSelected(video);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-lg border-2 border-dashed transition-all ${
        isDragOver ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      <div className="px-6 py-12 text-center sm:py-16">
        <Cloud
          className={`mx-auto h-16 w-16 transition-colors ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`}
        />

        <h2 className="text-foreground mt-4 text-lg font-semibold sm:text-xl">
          {isDragOver ? '📤 Thả video tại đây' : 'Nhấn hoặc kéo video vào khu vực này'}
        </h2>

        <p className="text-muted-foreground mt-2 text-sm">Hỗ trợ: MP4, MOV, MKV (Tối đa 2GB)</p>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-primary text-primary-foreground mt-6 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-opacity hover:opacity-90"
        >
          <Upload className="h-4 w-4" />
          Chọn video
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Guidelines */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900/50">
            <div className="text-2xl">📦</div>
            <p className="text-foreground mt-2 text-xs font-medium">Kích thước</p>
            <p className="text-muted-foreground mt-1 text-xs">Tối đa 2GB</p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900/50">
            <div className="text-2xl">⏱️</div>
            <p className="text-foreground mt-2 text-xs font-medium">Thời lượng</p>
            <p className="text-muted-foreground mt-1 text-xs">Tối đa 3 phút</p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900/50">
            <div className="text-2xl">🎬</div>
            <p className="text-foreground mt-2 text-xs font-medium">Format</p>
            <p className="text-muted-foreground mt-1 text-xs">MP4, MOV, MKV</p>
          </div>
        </div>
      </div>
    </div>
  );
}
