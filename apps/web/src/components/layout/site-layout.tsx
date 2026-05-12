'use client';

import { SITE_MAIN_CONTENT_CLASS } from '@/constants';
import { Header } from './header';
import { CategoryTabs } from './category-tabs';
import { MobileNav } from './mobile-nav';
import { PostDetailDrawerShell } from './post-detail-drawer-shell';
import { LoginModal } from '@/components/auth/login-modal';
import { useLoginModalStore } from '@/stores/login-modal-store';
import { cn } from '@/lib/utils';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const loginModalOpen = useLoginModalStore((s) => s.open);
  const closeLoginModal = useLoginModalStore((s) => s.closeModal);

  return (
    <>
      <PostDetailDrawerShell>
        <div className="flex min-h-screen flex-col">
          <Header />
          <CategoryTabs />
        <main
          data-site-main-scroll
          className={cn(
              SITE_MAIN_CONTENT_CLASS,
              'flex-1 overflow-auto px-3 pt-6 pb-28 sm:px-4 md:px-5 md:pt-8 md:pb-4 lg:px-6',
            )}
          >
            {children}
          </main>
        </div>
      </PostDetailDrawerShell>
      <MobileNav className="fixed bottom-0 left-0 right-0 z-[95] md:hidden" />
      <LoginModal open={loginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
