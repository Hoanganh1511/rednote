'use client';

import Link from 'next/link';
import { MessageCircle, Bookmark, ChevronRight, LogOut, ScanEye, X, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoginModal } from '@/components/auth/login-modal';
import { SearchDropdown } from '@/components/search-dropdown';
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
  { label: 'Đăng tải', href: '/upload', icon: Upload },
  { label: 'Tin nhắn', href: '/messages', icon: MessageCircle },
] as const;

const MENU_ITEMS = [
  { label: 'Trung tâm cá nhân', href: '/account/home' },
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
      <header
        className={cn(
          'z-header sticky top-0 transition-colors duration-300',
          isHome
            ? 'border-b-0 bg-gradient-to-b from-black/[0.35] to-transparent'
            : 'border-border bg-background border-b',
        )}
      >
        <div className="flex h-16 items-center gap-x-6 px-4">
          <nav className="hidden shrink-0 items-center gap-x-5 lg:flex">
            {LEFT_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 text-[13px] font-light whitespace-nowrap transition-colors',
                  isHome
                    ? 'text-white hover:text-white'
                    : 'text-muted-foreground hover:text-foreground',
                  !Icon &&
                    'transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0',
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-center gap-3">
            <div className="flex w-full max-w-xl items-center gap-3">
              <SearchDropdown />

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
              <Link
                key={href}
                href={href}
                className={cn(
                  'hover:bg-accent/20 flex flex-col items-center gap-y-2 rounded-md px-3 py-1 transition-colors',
                  isHome
                    ? 'text-white hover:text-white'
                    : 'text-muted-foreground hover:text-accent-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] leading-none font-medium">{label}</span>
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
    <div className="relative shrink-0" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className={cn(
          'hover:bg-accent/20 flex flex-col items-center gap-y-2 rounded-md px-3 py-1 transition-colors',
          isHome
            ? 'text-white/80 hover:text-white'
            : 'text-muted-foreground hover:text-accent-foreground',
        )}
      >
        <Bookmark className="h-5 w-5" />
        <span className="text-[10px] leading-none font-medium">Bộ sưu tập</span>
      </button>

      <div
        className={cn(
          'z-dropdown absolute top-full right-0 mt-2',
          'border-border bg-background w-[480px] overflow-hidden rounded-2xl border shadow-xl',
          'origin-top-right transition-all duration-200',
          open
            ? 'pointer-events-auto scale-100 opacity-100'
            : 'pointer-events-none scale-95 opacity-0',
        )}
      >
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-5 py-3.5">
          <span className="text-sm font-semibold">Bộ sưu tập</span>
          <a
            href="/collection"
            className="text-xs text-[#00aeec] transition-opacity hover:underline hover:opacity-80"
          >
            Xem tất cả →
          </a>
        </div>

        <div className="flex">
          {/* Left tab list */}
          <div className="border-border w-44 shrink-0 border-r">
            {COLLECTION_TABS.map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors',
                  activeTab === id
                    ? 'bg-[#00aeec] text-white'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <span className="truncate">{label}</span>
                <span
                  className={cn(
                    'ml-2 shrink-0 text-xs tabular-nums',
                    activeTab === id ? 'text-white/80' : 'text-muted-foreground',
                  )}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Right content */}
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
            <Bookmark className="text-muted-foreground/20 h-10 w-10" />
            <p className="text-muted-foreground text-sm">Chưa có video nào trong bộ sưu tập này</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const logout = useUserStore((s) => s.logout);
  const justLoggedIn = useUserStore((s) => s.justLoggedIn);
  const setJustLoggedIn = useUserStore((s) => s.setJustLoggedIn);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      /* ignore */
    }
    logout();
    setOpen(false);
    router.push('/');
  };

  const initial = (user.displayName ?? user.username ?? '?')[0]?.toUpperCase();

  return (
    <>
      <div className="relative shrink-0 cursor-pointer" onClick={() => setOpen((v) => !v)}>
        {justLoggedIn && (
          <LoginGreetBubble
            name={user.displayName ?? user.username ?? 'bạn'}
            onDismiss={() => setJustLoggedIn(false)}
          />
        )}

        <div className="h-10 w-10">
          <div
            className={cn(
              'h-full w-full overflow-hidden rounded-full bg-[#00aeec] text-sm font-semibold text-white',
              'flex items-center justify-center',
              'z-avatar-float relative transition-transform duration-300 ease-out',
              open ? 'md:translate-y-10 md:scale-[2.0]' : 'translate-y-0 scale-100',
            )}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName ?? ''}
                className="h-full w-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
        </div>

        {/* Desktop dropdown only */}
        <div
          className={cn(
            'z-dropdown absolute top-14 left-1/2 w-72 -translate-x-1/2',
            'hidden md:block',
            'border-border bg-background overflow-hidden rounded-2xl border shadow-xl',
            'origin-top transition-all duration-300',
            open
              ? 'pointer-events-auto scale-100 opacity-100'
              : 'pointer-events-none scale-95 opacity-0',
          )}
        >
          <div className="flex flex-col items-center gap-2.5 px-5 pt-14 pb-6">
            <p className="text-base font-semibold">
              {user.displayName ?? user.username ?? 'Người dùng'}
            </p>
            {user.phoneNumber && (
              <p className="text-muted-foreground text-xs">{user.phoneNumber}</p>
            )}
            <div className="text-muted-foreground flex items-center gap-4 text-xs">
              <span>
                Đồng xu: <span className="text-foreground font-medium">0</span>
              </span>
              <span>
                Đồng xu B: <span className="text-foreground font-medium">0</span>
              </span>
            </div>
            <div className="mt-1 flex w-full items-center gap-2">
              <span className="text-[10px] font-bold text-[#00aeec]">LV1</span>
              <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                <div className="h-full w-[10%] rounded-full bg-[#00aeec]" />
              </div>
              <span className="text-muted-foreground text-[10px] font-bold">LV2</span>
            </div>
          </div>
          <div className="border-border grid grid-cols-3 border-y py-5">
            {[
              { label: 'Theo dõi', value: user.followingCount },
              { label: 'Người hâm mộ', value: user.followerCount },
              { label: 'Động', value: user.videoCount },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <span className="text-lg font-semibold">{value}</span>
                <span className="text-muted-foreground text-xs">{label}</span>
              </div>
            ))}
          </div>
          <div className="py-2">
            {MENU_ITEMS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="hover:bg-accent flex items-center justify-between px-5 py-3.5 text-sm transition-colors"
              >
                {label}
                <ChevronRight className="text-muted-foreground h-4 w-4" />
              </Link>
            ))}
          </div>
          <div className="border-border border-t p-2">
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:bg-accent hover:text-foreground flex w-full items-center gap-2 rounded-lg px-5 py-3 text-sm transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop (both mobile drawer + desktop dropdown close) */}
      <div
        className={cn(
          'z-backdrop fixed inset-0 bg-black/50',
          'transition-opacity duration-300',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
          'md:bg-transparent',
        )}
        onClick={() => setOpen(false)}
      />

      {/* Mobile right drawer */}
      <div
        className={cn(
          'z-dropdown fixed top-0 right-0 bottom-0 w-72 md:hidden',
          'bg-background flex flex-col shadow-2xl',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="border-border flex shrink-0 items-center justify-between border-b px-5 py-4">
          <p className="text-sm font-semibold">Tài khoản</p>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center gap-3 px-5 py-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#00aeec] text-lg font-bold text-white">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">
                {user.displayName ?? user.username ?? 'Người dùng'}
              </p>
              {user.phoneNumber && (
                <p className="text-muted-foreground mt-0.5 text-xs">{user.phoneNumber}</p>
              )}
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#00aeec]">LV1</span>
                <div className="bg-muted h-1.5 w-20 overflow-hidden rounded-full">
                  <div className="h-full w-[10%] rounded-full bg-[#00aeec]" />
                </div>
                <span className="text-muted-foreground text-[10px]">LV2</span>
              </div>
            </div>
          </div>

          <div className="border-border grid grid-cols-3 border-y">
            {[
              { label: 'Theo dõi', value: user.followingCount },
              { label: 'Hâm mộ', value: user.followerCount },
              { label: 'Động', value: user.videoCount },
            ].map(({ label, value }, i) => (
              <div
                key={label}
                className={cn(
                  'flex flex-col items-center gap-1 py-4',
                  i > 0 && 'border-border border-l',
                )}
              >
                <span className="text-base font-semibold">{value}</span>
                <span className="text-muted-foreground text-xs">{label}</span>
              </div>
            ))}
          </div>

          <div className="py-2">
            {MENU_ITEMS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="hover:bg-accent flex items-center justify-between px-5 py-4 text-sm transition-colors"
              >
                {label}
                <ChevronRight className="text-muted-foreground h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        <div className="border-border shrink-0 border-t px-3 py-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </div>
    </>
  );
}

function LoginGreetBubble({ name, onDismiss }: { name: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="animate-in fade-in slide-in-from-top-2 z-sticky-sub absolute top-full right-0 mt-2 duration-300">
      <div className="relative flex items-center gap-2 rounded-2xl bg-[#ff6b81] px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg">
        <span>Chào {name}! 🎉</span>
        <button
          onClick={onDismiss}
          className="opacity-70 transition-opacity hover:opacity-100"
          aria-label="Đóng"
        >
          <X className="h-3 w-3" />
        </button>
        <span className="absolute -top-1.5 right-3 h-3 w-3 rotate-45 rounded-sm bg-[#ff6b81]" />
      </div>
    </div>
  );
}
