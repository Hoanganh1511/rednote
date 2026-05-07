import Link from 'next/link';
import { Home, Compass, Upload, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';

const MOBILE_NAV_ITEMS = [
  { label: 'Trang chủ', href: ROUTES.HOME, icon: Home },
  { label: 'Khám phá', href: '/explore', icon: Compass },
  { label: 'Đăng tải', href: ROUTES.UPLOAD, icon: Upload },
  { label: 'Thông báo', href: '/notifications', icon: Bell },
  { label: 'Tôi', href: '/profile', icon: User },
] as const;

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  return (
    <nav
      className={cn(
        'flex items-center justify-around border-t border-border bg-background px-2 py-1',
        className,
      )}
    >
      {MOBILE_NAV_ITEMS.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon className="h-5 w-5" />
          <span className="text-[10px] font-medium">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
