'use client';

import Link from 'next/link';
import { Search, MessageCircle, Bookmark, ChevronRight, LogOut, ScanEye } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { LoginModal } from '@/components/auth/login-modal';
import { useUserStore } from '@/stores/user-store';
import { apiClient } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';
import type { User } from 'shared-types';

const LEFT_LINKS = [
  { label: 'Trang chủ', href: ROUTES.HOME, icon: ScanEye },
  { label: 'Xây hình ảnh cá nhân', href: '/creator', icon: null },
  { label: 'Phim đã xem', href: '/film-review', icon: null },
] as const;

const RIGHT_ACTIONS = [
  { label: 'Tin nhắn', href: '/messages', icon: MessageCircle },
] as const;

const MENU_ITEMS = [
  { label: 'Trung tâm cá nhân', href: '/profile' },
  { label: 'Quản lý đệ trình', href: '/manage' },
  { label: 'Các dịch vụ được đề xuất', href: '/services' },
] as const;

export function Header() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const user = useUserStore((s) => s.user);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => setMounted(true), []);

  return (
    <>
      <header className={cn(
        'sticky top-0 z-50 transition-colors duration-300',
        isHome
          ? 'border-b-0 bg-gradient-to-b from-black/[0.08] to-transparent'
          : 'border-b border-border bg-background',
      )}>
        <div className="flex h-16 items-center gap-x-6 px-4">
          <nav className="hidden shrink-0 items-center gap-x-5 lg:flex">
            {LEFT_LINKS.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap text-[13px] font-light transition-colors',
                  isHome
                    ? 'text-white/80 hover:text-white'
                    : 'text-muted-foreground hover:text-foreground',
                  !Icon && 'transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0',
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-center gap-3">
            <div className="flex w-full max-w-xl items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Tìm kiếm điều gì đó của tôi"
                  className="h-9 w-full rounded-full border border-input bg-muted pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {!mounted ? (
                <Skeleton variant="circle" className="h-8 w-8 shrink-0" />
              ) : user ? (
                <UserMenu user={user} />
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="shrink-0 rounded-md bg-[#00aeec] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>

          <nav className="hidden shrink-0 items-center gap-x-1 lg:flex">
            {RIGHT_ACTIONS.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href}
                className={cn(
                  'flex flex-col items-center gap-y-2 rounded-md px-3 py-1 transition-colors hover:bg-accent/20',
                  isHome ? 'text-white/80 hover:text-white' : 'text-muted-foreground hover:text-accent-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            ))}
            <CollectionDropdown isHome={isHome} />
          </nav>
        </div>
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

const COLLECTION_TABS = [
  { id: 'default', label: 'Mặc định', count: 0 },
  { id: 'watchlater', label: 'Xem sau', count: 0 },
] as const;

type CollectionTabId = (typeof COLLECTION_TABS)[number]['id'];

function CollectionDropdown({ isHome }: { isHome: boolean }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CollectionTabId>('default');
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleEnter = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => setActiveTab('default'), 200);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button className={cn(
        'flex flex-col items-center gap-y-2 rounded-md px-3 py-1 transition-colors hover:bg-accent/20',
        isHome ? 'text-white/80 hover:text-white' : 'text-muted-foreground hover:text-accent-foreground',
      )}>
        <Bookmark className="h-5 w-5" />
        <span className="text-[10px] font-medium leading-none">Bộ sưu tập</span>
      </button>

      <div className={cn(
        'absolute top-12 right-0 z-50 flex',
        'w-96 rounded-2xl border border-border bg-background shadow-xl overflow-hidden',
        'transition-all duration-200 origin-top-right',
        open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none',
      )}>
        {/* Left tab list */}
        <div className="w-32 shrink-0 border-r border-border">
          {COLLECTION_TABS.map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex w-full items-center justify-between px-3 py-3 text-xs font-medium transition-colors',
                activeTab === id
                  ? 'bg-[#00aeec] text-white'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <span className="truncate">{label}</span>
              <span className={cn(
                'ml-1 shrink-0 text-[10px]',
                activeTab === id ? 'text-white/80' : 'text-muted-foreground',
              )}>{count}</span>
            </button>
          ))}
        </div>

        {/* Right content */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
          <Bookmark className="h-8 w-8 opacity-20" />
          <p className="text-xs">Chưa có video nào cho bài yêu thích này~</p>
        </div>
      </div>
    </div>
  );
}


function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const logout = useUserStore((s) => s.logout);

  const handleEnter = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  const handleLogout = async () => {
    try { await apiClient.post('/auth/logout'); } catch { /* ignore */ }
    logout();
    setOpen(false);
  };

  const initial = (user.displayName ?? user.username ?? '?')[0]?.toUpperCase();

  return (
    <div
      className="relative shrink-0 cursor-pointer"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Slot cố định h-8 w-8 — avatar bên trong transform mà không ảnh hưởng layout */}
      <div className="h-8 w-8">
        <div className={cn(
          'h-full w-full rounded-full bg-[#00aeec] text-xs font-semibold text-white overflow-hidden',
          'flex items-center justify-center',
          'transition-transform duration-300 ease-out z-20 relative',
          open ? 'scale-[2.0] translate-y-10' : 'scale-100 translate-y-0',
        )}>
          {user.avatarUrl
            ? <img src={user.avatarUrl} alt={user.displayName ?? ''} className="h-full w-full object-cover" />
            : initial
          }
        </div>
      </div>

      {/* Dropdown — căn giữa theo avatar theo chiều ngang, avatar đè lên top */}
      <div className={cn(
        'absolute top-14 left-1/2 -translate-x-1/2 w-64 z-10',
        'rounded-2xl border border-border bg-background shadow-xl overflow-hidden',
        'transition-all duration-300 origin-top',
        open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none',
      )}>
        {/* pt-9 nhường chỗ cho nửa dưới avatar đè vào dropdown (scale 2.2 → r≈35px) */}
        <div className="flex flex-col items-center px-4 pt-12 pb-4 gap-1.5">
          <p className="text-sm font-semibold">{user.displayName ?? user.username ?? 'Người dùng'}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Đồng xu: <span className="text-foreground font-medium">0</span></span>
            <span>Đồng xu B: <span className="text-foreground font-medium">0</span></span>
          </div>
          <div className="flex w-full items-center gap-2 mt-1">
            <span className="text-[10px] font-bold text-[#00aeec]">LV1</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[10%] rounded-full bg-[#00aeec]" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">LV2</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 border-y border-border py-3">
          {[
            { label: 'Theo dõi', value: user.followingCount },
            { label: 'Người hâm mộ', value: user.followerCount },
            { label: 'Động', value: user.videoCount },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="text-base font-semibold">{value}</span>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Menu items */}
        <div className="py-1">
          {MENU_ITEMS.map(({ label, href }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-accent"
            >
              {label}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <div className="border-t border-border p-1">
          <button onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
