'use client';

import { Clapperboard } from 'lucide-react';
import { MobileNav } from '@/components/layout/mobile-nav';

export default function UploadVideoPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F9] pb-28 text-slate-900 md:pb-0">
      <header className="border-b border-slate-200/90 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Đăng video
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-dashed border-slate-200/90 bg-white px-6 py-16 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Clapperboard className="h-7 w-7" />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Upcoming
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">Đăng video</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Luồng video đang được hoàn thiện. Tạm thời bạn có thể dùng Đăng post hoặc Viết chuyên mục.
          </p>
        </div>
      </main>

      <MobileNav className="fixed bottom-0 left-0 right-0 z-header border-t border-slate-200/90 bg-white md:hidden" />
    </div>
  );
}

