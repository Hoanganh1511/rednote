'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Clapperboard, FileText, NotebookPen } from 'lucide-react';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Header } from '@/components/layout/header';
import { SITE_MAIN_CONTENT_CLASS } from '@/constants';
import { cn } from '@/lib/utils';
import { creatorSelectClassName } from '@/components/upload/upload.controls';

type UploadDestination = 'video' | 'post' | 'article';

const DESTINATIONS: {
  value: UploadDestination;
  label: string;
  href: string;
  note: string;
  Icon: typeof Clapperboard;
}[] = [
  {
    value: 'video',
    label: 'Đăng video',
    href: '/upload/video',
    note: 'Video editor đang trong giai đoạn upcoming.',
    Icon: Clapperboard,
  },
  {
    value: 'post',
    label: 'Đăng post',
    href: '/upload/post',
    note: 'Luồng đang ưu tiên triển khai trước.',
    Icon: FileText,
  },
  {
    value: 'article',
    label: 'Viết chuyên mục',
    href: '/upload/article',
    note: 'Bài dài có cấu trúc chuyên sâu.',
    Icon: NotebookPen,
  },
];

export default function UploadPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<UploadDestination>('post');
  const selected = DESTINATIONS.find((x) => x.value === selectedType) ?? DESTINATIONS[0]!;
  const SelectedIcon = selected.Icon;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 flex-col bg-[#F4F6F9] pb-28 text-slate-900 md:pb-0">
        <header className="border-b border-slate-200/90 bg-white">
          <div className={cn(SITE_MAIN_CONTENT_CLASS, 'px-4 py-7 sm:px-6 lg:px-8')}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00A1D6]">
              Creator Studio
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Trung tâm đăng tải
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
              Chọn loại nội dung để chuyển sang trang biên soạn chuyên biệt.
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-3xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
          <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
            <label htmlFor="content-type-select" className="text-sm font-semibold text-slate-800">
              Loại nội dung
            </label>
            <div className="relative mt-2 max-w-md">
              <select
                id="content-type-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as UploadDestination)}
                className={creatorSelectClassName}
              >
                {DESTINATIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="mt-3 flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#00A1D6] ring-1 ring-slate-200/80">
                <SelectedIcon className="h-4 w-4" />
              </span>
              <p className="text-sm text-slate-500">{selected.note}</p>
            </div>

            <button
              type="button"
              onClick={() => router.push(selected.href)}
              className="mt-4 rounded-xl bg-[#00A1D6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#00b3ea]"
            >
              Tiếp tục
            </button>
          </section>
        </main>
      </div>

      <MobileNav className="fixed bottom-0 left-0 right-0 z-header border-t border-slate-200/90 bg-white md:hidden" />
    </div>
  );
}
