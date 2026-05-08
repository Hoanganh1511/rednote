'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Upload, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';

const MOBILE_NAV_ITEMS = [
  { label: 'Trang chủ', href: ROUTES.HOME, icon: Home, match: (p: string) => p === '/' },
  { label: 'Khám phá', href: '/explore', icon: Compass, match: (p: string) => p.startsWith('/explore') },
  { label: 'Đăng tải', href: ROUTES.UPLOAD, icon: Upload, match: (p: string) => p.startsWith('/upload') },
  { label: 'Thông báo', href: '/notifications', icon: Bell, match: (p: string) => p.startsWith('/notifications') },
  { label: 'Tôi', href: '/account/home', icon: User, match: (p: string) => p.startsWith('/account') },
] as const;

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'flex items-center justify-around border-t border-border bg-background px-2 py-1',
        className,
      )}
    >
      {MOBILE_NAV_ITEMS.map(({ label, href, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors',
              active ? 'text-[#00aeec]' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
