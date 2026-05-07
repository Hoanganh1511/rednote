import Link from 'next/link';
import { Home, Compass, History, ThumbsUp, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';

const NAV_ITEMS = [
  { label: 'Trang chủ', href: ROUTES.HOME, icon: Home },
  { label: 'Khám phá', href: '/explore', icon: Compass },
  { label: 'Lịch sử', href: '/history', icon: History },
  { label: 'Đã thích', href: '/liked', icon: ThumbsUp },
  { label: 'Đang theo dõi', href: '/following', icon: Users },
  { label: 'Cài đặt', href: ROUTES.SETTINGS, icon: Settings },
] as const;

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-14 flex-col border-r border-border bg-background py-4 lg:w-56',
        className,
      )}
    >
      <nav className="flex flex-col gap-1 px-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={label}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="hidden lg:block">{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
