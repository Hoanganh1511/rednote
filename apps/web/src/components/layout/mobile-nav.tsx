'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Plus, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileCreateMenu } from '@/components/layout/mobile-create-menu';
import { ROUTES, SITE_MAIN_CONTENT_CLASS } from '@/constants';
import { ComingSoonBadge } from '@/components/ui/coming-soon-badge';

const SIDE_ITEMS = [
  { label: 'Trang chủ', href: ROUTES.HOME, icon: Home, match: (p: string) => p === '/', comingSoon: false },
  { label: 'Khám phá', href: '/explore', icon: Compass, match: (p: string) => p.startsWith('/explore'), comingSoon: true },
] as const;

const SIDE_ITEMS_RIGHT = [
  {
    label: 'Thông báo',
    href: '/notifications',
    icon: Bell,
    match: (p: string) => p.startsWith('/notifications'),
    comingSoon: true,
  },
  { label: 'Tôi', href: '/account/home', icon: User, match: (p: string) => p.startsWith('/account'), comingSoon: false },
] as const;

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <MobileCreateMenu open={createOpen} onClose={() => setCreateOpen(false)} />

      <nav
        className={cn(
          'border-t border-border bg-background pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden',
          className,
        )}
      >
        <div className={cn(SITE_MAIN_CONTENT_CLASS, 'flex h-14 items-center justify-between gap-2 px-2 pt-0.5 sm:px-3 md:px-5')}>
          <div className="flex min-w-0 flex-1 justify-evenly">
            {SIDE_ITEMS.map(({ label, href, icon: Icon, match, comingSoon }) => {
              const active = match(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative flex min-w-0 flex-1 max-w-[5.5rem] flex-col items-center justify-center gap-0.5 py-1 transition-colors',
                    active ? 'text-[#00A1D6]' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', active && 'stroke-[2.5]')} />
                  <span className="line-clamp-1 text-center text-[10px] font-medium leading-none">
                    {label}
                  </span>
                  {comingSoon && <ComingSoonBadge />}
                </Link>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center justify-center px-1">
            <button
              type="button"
              aria-label="Mở menu tạo nội dung"
              aria-expanded={createOpen}
              onClick={() => setCreateOpen((o) => !o)}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#00A1D6] text-white shadow-md ring-2 ring-background transition-transform hover:bg-[#00b3ea] active:scale-[0.98]',
                createOpen && 'ring-[#00A1D6]/35',
              )}
            >
              <Plus className="h-6 w-6" strokeWidth={2.25} />
            </button>
          </div>

          <div className="flex min-w-0 flex-1 justify-evenly">
            {SIDE_ITEMS_RIGHT.map(({ label, href, icon: Icon, match, comingSoon }) => {
              const active = match(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative flex min-w-0 flex-1 max-w-[5.5rem] flex-col items-center justify-center gap-0.5 py-1 transition-colors',
                    active ? 'text-[#00A1D6]' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', active && 'stroke-[2.5]')} />
                  <span className="line-clamp-1 text-center text-[10px] font-medium leading-none">
                    {label}
                  </span>
                  {comingSoon && <ComingSoonBadge />}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
