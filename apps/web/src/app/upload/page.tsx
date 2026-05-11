'use client';

import { useState } from 'react';
import { Video, Clapperboard, FileText, Gamepad2, Music } from 'lucide-react';
import { UploadTabs } from '@/components/upload/upload-tabs';
import { VideoUploadZone } from '@/components/upload/video-upload-zone';
import { UploadProgress } from '@/components/upload/upload-progress';
import { VideoSettingsForm } from '@/components/upload/video-settings-form';
import type { UploadedVideo } from '@/components/upload/upload.types';

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState<
    'video' | 'short' | 'article' | 'interactive' | 'audio'
  >('video');
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const tabs = [
    { id: 'video' as const, label: 'Đăng video', icon: Video },
    { id: 'short' as const, label: 'Đăng phim ngắn', icon: Clapperboard },
    { id: 'article' as const, label: 'Đăng chuyên mục', icon: FileText },
    { id: 'interactive' as const, label: 'Video tương tác', icon: Gamepad2 },
    { id: 'audio' as const, label: 'Đăng audio', icon: Music },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-border sticky top-0 z-40 border-b bg-white/95 backdrop-blur dark:bg-slate-950/95">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-foreground text-2xl font-bold">Đăng tải nội dung</h1>
          <p className="text-muted-foreground mt-1 text-sm">Chọn loại nội dung bạn muốn đăng tải</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-0 py-0 sm:px-0 lg:px-0">
        {/* Tabs */}
        <UploadTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Main upload area */}
            <div className="lg:col-span-2">
              {activeTab === 'video' && !uploadedVideo && (
                <VideoUploadZone
                  onVideoSelected={(video) => {
                    setUploadedVideo(video);
                    setIsUploading(true);
                  }}
                />
              )}

              {activeTab === 'video' && uploadedVideo && isUploading && (
                <UploadProgress
                  video={uploadedVideo}
                  onComplete={(completeVideo) => {
                    setUploadedVideo(completeVideo);
                    setIsUploading(false);
                  }}
                  onCancel={() => {
                    setUploadedVideo(null);
                    setIsUploading(false);
                  }}
                />
              )}

              {activeTab === 'video' && uploadedVideo && !isUploading && (
                <VideoSettingsForm
                  video={uploadedVideo}
                  onSubmit={(formData) => {
                    console.log('Submit video with settings:', formData);
                    // API call here
                  }}
                  onBack={() => setUploadedVideo(null)}
                />
              )}

              {/* Placeholder for other tabs */}
              {activeTab !== 'video' && (
                <div className="border-border bg-card rounded-lg border-2 border-dashed p-8 text-center">
                  <p className="text-muted-foreground">Tính năng này sẽ được cập nhật sớm</p>
                </div>
              )}
            </div>

            {/* Sidebar - Guidelines */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                {activeTab === 'video' && <VideoGuidelines />}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoGuidelines() {
  return (
    <div className="space-y-4">
      {/* File Size */}
      <div className="bg-card rounded-lg p-4 shadow-sm">
        <h3 className="text-foreground mb-2 font-semibold">📦 Kích thước video</h3>
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>• Tối đa 2GB (hoặc 10GB nếu 1000+ followers)</li>
          <li>• Thời lượng tối đa 3 phút</li>
        </ul>
      </div>

      {/* Format */}
      <div className="bg-card rounded-lg p-4 shadow-sm">
        <h3 className="text-foreground mb-2 font-semibold">🎬 Định dạng video</h3>
        <p className="text-muted-foreground mb-2 text-sm">Khuyến nghị:</p>
        <div className="flex flex-wrap gap-2">
          {['MP4', 'MOV', 'MKV'].map((format) => (
            <span
              key={format}
              className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
            >
              {format}
            </span>
          ))}
        </div>
      </div>

      {/* Resolution */}
      <div className="bg-card rounded-lg p-4 shadow-sm">
        <h3 className="text-foreground mb-2 font-semibold">📐 Độ phân giải</h3>
        <p className="text-muted-foreground text-sm">Khuyến nghị: 1080P hoặc cao hơn</p>
      </div>

      {/* Tips */}
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
        <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-200">💡 Mẹo</h3>
        <p className="text-xs text-blue-800 dark:text-blue-300">
          Chuẩn bị thông tin video (tiêu đề, mô tả, thumbnail) trước khi upload để tiết kiệm thời
          gian
        </p>
      </div>
    </div>
  );
}
