'use client';

import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { FileVideo, FolderOpen, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface LibraryItem {
  id: string;
  name: string;
  size: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i > 1 ? 1 : 0)} ${['B', 'KB', 'MB', 'GB'][i]}`;
}

export function VideoLibraryPanel() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const next: LibraryItem[] = [];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith('video/')) continue;
      next.push({ id: crypto.randomUUID(), name: file.name, size: file.size });
    }
    if (next.length === 0) {
      toast.message('Chỉ thêm file video', { description: 'Chọn MP4, MOV hoặc MKV.' });
      return;
    }
    setItems((prev) => [...next, ...prev]);
    toast.success(`Đã thêm ${next.length} tệp`, { description: 'Lưu cục bộ — API kho tư liệu sẽ nối sau.' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#00A1D6] ring-1 ring-slate-200/80">
              <FolderOpen className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Kho tư liệu video</h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-500">
                Gom clip gốc, B-roll, teaser trước khi đăng — tương tự thư viện asset của creator
                studio. Hiện lưu tạm trên trình duyệt; đồng bộ cloud sẽ có sau.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-cyan-200 hover:text-[#00A1D6]"
          >
            <Upload className="h-4 w-4" />
            Thêm video
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(e) => {
              onFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-100">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <FileVideo className="h-10 w-10 text-slate-300" strokeWidth={1.25} />
              <p className="text-sm font-medium text-slate-600">Chưa có tư liệu</p>
              <p className="max-w-sm text-xs text-slate-500">
                Thêm file video để quản lý tên và dung lượng tại đây trước khi đưa vào tab Đăng.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50/80"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-[#00A1D6]">
                      <FileVideo className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{formatBytes(item.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setItems((prev) => prev.filter((x) => x.id !== item.id));
                      toast.message('Đã gỡ khỏi danh sách');
                    }}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600"
                    aria-label="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}
