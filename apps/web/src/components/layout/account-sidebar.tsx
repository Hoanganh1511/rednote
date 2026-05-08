'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  ImageIcon,
  ShieldCheck,
  History,
  BadgeCheck,
  UserPlus,
  Bell,
  LayoutGrid,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SIDEBAR_GROUPS = [
  {
    items: [
      { label: 'Thông tin của tôi', href: '/account/info', icon: User },
      { label: 'Ảnh đại diện', href: '/account/avatar', icon: ImageIcon },
      { label: 'Bảo mật tài khoản', href: '/account/security', icon: ShieldCheck },
      { label: 'Lịch sử xem', href: '/account/watch-history', icon: History },
    ],
  },
  {
    items: [
      { label: 'Xác thực danh tính', href: '/account/verify', icon: BadgeCheck },
      { label: 'Mời bạn bè', href: '/account/invite', icon: UserPlus },
      { label: 'Cài đặt thông báo', href: '/account/notifications', icon: Bell },
    ],
  },
  {
    items: [{ label: 'Không gian cá nhân', href: '/account/profile', icon: LayoutGrid }],
  },
] as const;


export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-52 shrink-0 md:block">
      <nav className="flex flex-col gap-1">
        {SIDEBAR_GROUPS.map((group, gi) => (
          <div key={gi} className={cn(gi > 0 && 'mt-2 border-t border-border pt-2')}>
            {group.items.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#00aeec]/10 text-[#00aeec]'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active && 'text-[#00aeec]')} />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight className="h-3.5 w-3.5 text-[#00aeec]" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export function AccountNavCards() {
  const pathname = usePathname();
  const allItems = SIDEBAR_GROUPS.flatMap((g) => [...g.items]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background p-3 shadow-sm">
      <div className="grid grid-cols-3 gap-2">
        {allItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl p-3 transition-colors',
                active ? 'bg-[#00aeec]/10 text-[#00aeec]' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <div className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full',
                active ? 'bg-[#00aeec] text-white' : 'bg-[#00aeec]/10 text-[#00aeec]',
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-center text-[11px] font-medium leading-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
