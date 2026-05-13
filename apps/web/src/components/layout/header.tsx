'use client';

import Link from 'next/link';
import { MessageCircle, Bookmark, ChevronRight, LogOut, ScanEye, X, Upload, type LucideIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLoginModalStore } from '@/stores/login-modal-store';
import { SearchDropdown } from '@/components/search-dropdown';
import { useUserStore } from '@/stores/user-store';
import { apiClient } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ROUTES, SITE_MAIN_CONTENT_CLASS } from '@/constants';
import { useNavigationWithLoader } from '@/hooks/use-navigation-with-loader';
import type { User } from 'shared-types';
import { ComingSoonBadge } from '@/components/ui/coming-soon-badge';

const LEFT_LINKS: Array<{ label: string; href: string; icon: LucideIcon | null; comingSoon?: boolean }> = [
  { label: 'Trang chủ', href: ROUTES.HOME, icon: ScanEye },
  { label: 'Xây hình ảnh cá nhân', href: '/creator', icon: null, comingSoon: true },
  { label: 'Phim đã xem', href: '/film-review', icon: null, comingSoon: true },
];

const RIGHT_ACTIONS: Array<{ label: string; href: string; icon: LucideIcon; comingSoon?: boolean }> = [
  { label: 'Đăng tải', href: '/upload', icon: Upload },
  { label: 'Tin nhắn', href: '/messages', icon: MessageCircle, comingSoon: true },
];

const MENU_ITEMS: Array<{ label: string; href: string; comingSoon?: boolean }> = [
  { label: 'Trung tâm cá nhân', href: '/account/home' },
  { label: 'Quản lý đệ trình', href: '/manage', comingSoon: true },
  { label: 'Các dịch vụ được đề xuất', href: '/services', comingSoon: true },
];

export function Header() {
  const [mounted, setMounted] = useState(false);
  const user = useUserStore((s) => s.user);
  const openLoginModal = useLoginModalStore((s) => s.openModal);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <header className="z-header sticky top-0 bg-white shadow-none">
        <div
          className={cn(
            SITE_MAIN_CONTENT_CLASS,
            'flex h-16 items-center gap-x-6 px-3 sm:px-4 md:px-5 lg:px-6',
          )}
        >
          <nav className="hidden shrink-0 items-center gap-x-5 lg:flex">
            {LEFT_LINKS.map(({ label, href, icon: Icon, comingSoon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-[13px] font-light whitespace-nowrap transition-colors',
                  !Icon &&
                    'transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0',
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {label}
                {comingSoon && <ComingSoonBadge />}
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
                  onClick={() => openLoginModal()}
                  className="hidden sm:block shrink-0 rounded-md bg-[#00aeec] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Đăng nhập
                </button>
              )}
            </div>

            {/* Mobile: login button only */}
            {!user && !mounted && (
              <Skeleton variant="circle" className="sm:hidden h-8 w-8 shrink-0" />
            )}
            {!user && mounted && (
              <button
                onClick={() => openLoginModal()}
                className="sm:hidden shrink-0 rounded-md bg-[#00aeec] px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                Đăng nhập
              </button>
            )}
          </div>

          <nav className="hidden shrink-0 items-center gap-x-1 lg:flex">
            {RIGHT_ACTIONS.map(({ label, href, icon: Icon, comingSoon }) => (
              <Link
                key={href}
                href={href}
                className="relative text-muted-foreground hover:text-accent-foreground hover:bg-accent/20 flex flex-col items-center gap-y-2 rounded-md px-3 py-1 transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] leading-none font-medium">{label}</span>
                {comingSoon && <ComingSoonBadge />}
              </Link>
            ))}
            <CollectionDropdown />
          </nav>
        </div>
      </header>
    </>
  );
}

const COLLECTION_TABS = [
  { id: 'default', label: 'Mặc định', count: 0 },
  { id: 'watchlater', label: 'Xem sau', count: 0 },
] as const;

type CollectionTabId = (typeof COLLECTION_TABS)[number]['id'];

function CollectionDropdown() {
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
        className="text-muted-foreground hover:text-accent-foreground hover:bg-accent/20 flex flex-col items-center gap-y-2 rounded-md px-3 py-1 transition-colors"
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
  const logout = useUserStore((s) => s.logout);
  const justLoggedIn = useUserStore((s) => s.justLoggedIn);
  const setJustLoggedIn = useUserStore((s) => s.setJustLoggedIn);
  const router = useNavigationWithLoader();

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      /* ignore */
    }
    logout();
    router.push('/');
  };

  const initial = (user.displayName ?? user.username ?? '?')[0]?.toUpperCase();

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(ROUTES.CHANNEL(user.username));
  };

  return (
    <>
      <div className="relative shrink-0 cursor-pointer group">
        {justLoggedIn && (
          <LoginGreetBubble
            name={user.displayName ?? user.username ?? 'bạn'}
            onDismiss={() => setJustLoggedIn(false)}
          />
        )}

        <button
          onClick={handleAvatarClick}
          className="flex items-center justify-center h-10 w-10 rounded-full hover:opacity-80 transition-opacity"
          title={`Trang ${user.displayName ?? user.username}`}
          aria-label={`Trang ${user.displayName ?? user.username}`}
        >
          <div
            className={cn(
              'h-full w-full overflow-hidden rounded-full bg-[#00aeec] text-sm font-semibold text-white',
              'flex items-center justify-center',
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
        </button>
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
