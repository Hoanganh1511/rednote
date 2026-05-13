'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { SITE_MAIN_CONTENT_CLASS } from '@/constants';
import { cn } from '@/lib/utils';
import { AccountHeader } from '@/components/layout/account-header';
import { AccountSidebar } from '@/components/layout/account-sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { useRequireAuth } from '@/hooks/use-auth';
import { useAccountUiStore } from '@/stores/account-ui-store';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  useRequireAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/account/home';
  const backOverride = useAccountUiStore((s) => s.mobileBackOverride);

  return (
    <div className="flex min-h-screen flex-col">
      <AccountHeader />

      {/* Blue banner — desktop only */}
      <div className="hidden h-[120px] w-full bg-[#00aeec] md:block" />

      {/* Body */}
      <div
        className={cn(SITE_MAIN_CONTENT_CLASS, 'flex flex-1 gap-0 px-4 py-6 pb-24 sm:px-5 md:py-8 md:pb-8 lg:px-6')}
      >
        <AccountSidebar />
        <main className="min-w-0 flex-1 md:pl-8">

          {/* Mobile back button on sub-pages */}
          {!isHome && (
            <div className="mb-4 md:hidden">
              <button
                onClick={() => backOverride ? backOverride() : router.back()}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Quay về
              </button>
            </div>
          )}

          {children}

        </main>
      </div>

      <MobileNav className="fixed bottom-0 left-0 right-0 z-header md:hidden" />
    </div>
  );
}
