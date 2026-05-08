'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Upload, Lock, Check, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { extractApiError } from '@/lib/api-error';
import { useUserStore } from '@/stores/user-store';
import type { User } from 'shared-types';

type BreadcrumbItem =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: () => void; href?: never }
  | { label: string; href?: never; onClick?: never };

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
            {isLast ? (
              <span className="font-semibold text-foreground">{item.label}</span>
            ) : item.href ? (
              <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : item.onClick ? (
              <button onClick={item.onClick} className="text-muted-foreground hover:text-foreground transition-colors">
                {item.label}
              </button>
            ) : (
              <span className="text-muted-foreground">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

const SAMPLE_AVATARS = [
  { id: 1, label: 'Giới Vô Thượng', free: true, bg: 'from-amber-400 to-orange-500' },
  { id: 2, label: 'Vua yêu tinh', free: true, bg: 'from-purple-400 to-violet-600' },
  { id: 3, label: 'Ngô Azur', free: true, bg: 'from-sky-400 to-blue-500' },
  { id: 4, label: 'Nhà vua không vui', free: true, bg: 'from-rose-400 to-red-600' },
  { id: 5, label: 'Slytherin', free: false, bg: 'from-emerald-500 to-green-700' },
  { id: 6, label: 'Ravenclaw', free: false, bg: 'from-blue-500 to-indigo-700' },
  { id: 7, label: 'Đỉnh vinh quang', free: false, bg: 'from-yellow-400 to-amber-600' },
  { id: 8, label: 'Công chúa Link', free: false, bg: 'from-pink-400 to-rose-500' },
];

export default function AccountAvatarPage() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const [mode, setMode] = useState<'view' | 'upload'>('view');
  const [selected, setSelected] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetUpload = () => { setMode('view'); setFile(null); setPreview(null); setUploadError(null); };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      // iOS Safari may return empty file.type for camera photos — fallback to jpeg
      const mimeType = file.type || 'image/jpeg';

      // 1. Get presigned URL
      const presignRes = await apiClient.post<{ uploadUrl: string; publicUrl: string }>(
        '/upload/avatar/presign',
        { fileType: mimeType, fileSize: file.size },
      );
      const { uploadUrl, publicUrl } = presignRes.data;

      // 2. Upload directly to S3 (raw fetch, no auth header)
      const s3Res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': mimeType },
      });
      if (!s3Res.ok) throw new Error('Upload lên S3 thất bại');

      // 3. Save publicUrl to user profile
      const meRes = await apiClient.patch<User>('/users/me', { avatarUrl: publicUrl });
      setUser(meRes.data);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: unknown) {
      setUploadError(extractApiError(err, 'Tải ảnh thất bại, vui lòng thử lại.'));
    } finally {
      setUploading(false);
    }
  };

  const avatarInitial = (user?.displayName ?? user?.username ?? 'U')[0]?.toUpperCase();

  if (mode === 'upload') {
    return (
      <div className="max-w-2xl space-y-8">
        <Breadcrumb
          items={[
            { label: 'Ảnh đại diện', onClick: resetUpload },
            { label: 'Tải ảnh lên' },
          ]}
        />

        <div className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-8">
          {/* Preview */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-dashed border-border bg-[#00aeec] flex items-center justify-center text-2xl font-bold text-white">
              {preview ? (
                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              ) : user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar hiện tại" className="h-full w-full object-cover" />
              ) : (
                avatarInitial
              )}
            </div>
            <p className="text-xs text-muted-foreground">{preview ? 'Xem trước' : 'Avatar hiện tại'}</p>
          </div>

          {/* File picker */}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-border p-4 text-left transition-colors hover:border-[#00aeec]/50 hover:bg-[#00aeec]/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{file ? file.name : 'Chọn ảnh từ thiết bị'}</p>
              <p className="text-xs text-muted-foreground">
                {file ? `${(file.size / 1024).toFixed(0)} KB` : 'JPG, PNG, WebP · Tối đa 2MB'}
              </p>
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Kích thước khuyến nghị 180×180px, tối đa 2MB
          </p>

          {uploadError && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 text-center">{uploadError}</p>
          )}
          {uploadSuccess && (
            <p className="mt-4 text-sm text-emerald-600 text-center font-medium">Cập nhật avatar thành công!</p>
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex items-center gap-2 rounded-lg bg-[#00aeec] px-8 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              {uploading ? 'Đang tải lên...' : 'Cập nhật'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-1">
        <Breadcrumb items={[{ label: 'Ảnh đại diện' }]} />
        <p className="text-sm text-muted-foreground">Chọn hoặc tải lên ảnh đại diện của bạn</p>
      </div>

      {/* Current avatar */}
      <div className="flex flex-col items-center gap-4 py-8 rounded-2xl border border-border bg-background shadow-sm">
        <div className="h-24 w-24 overflow-hidden rounded-full bg-[#00aeec] flex items-center justify-center text-3xl font-bold text-white">
          {selected !== null ? (
            <div className={cn('h-full w-full bg-gradient-to-br', SAMPLE_AVATARS.find(a => a.id === selected)?.bg)} />
          ) : user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            avatarInitial
          )}
        </div>
        <button
          onClick={() => setMode('upload')}
          className="rounded-lg border border-[#00aeec] px-5 py-2 text-sm font-medium text-[#00aeec] transition-colors hover:bg-[#00aeec]/10"
        >
          Thay đổi avatar
        </button>
      </div>

      {/* Sample avatars grid — tạm ẩn */}
    </div>
  );
}
