'use client';

import { MobileNav } from '@/components/layout/mobile-nav';
import { ArticleComposeForm } from '@/components/upload/article-compose-form';

export default function UploadArticlePage() {
  return (
    <div className="min-h-screen bg-[#F4F6F9] pb-28 text-slate-900 md:pb-0">
      <header className="border-b border-slate-200/90 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Viet chuyen muc
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <ArticleComposeForm />
      </main>

      <MobileNav className="fixed bottom-0 left-0 right-0 z-header border-t border-slate-200/90 bg-white md:hidden" />
    </div>
  );
}
