import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { CategoryTabs } from '@/components/layout/category-tabs';
import { MobileNav } from '@/components/layout/mobile-nav';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: { default: 'RedNote', template: '%s | RedNote' },
  description: 'Nền tảng chia sẻ video phong cách Bilibili',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <CategoryTabs />
            <main className="mx-auto w-full max-w-screen-xl flex-1 overflow-auto px-3 pt-6 pb-20 md:px-4 md:pt-8 md:pb-4">
              {children}
            </main>
            <MobileNav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" />
          </div>
        </Providers>
      </body>
    </html>
  );
}
