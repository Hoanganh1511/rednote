'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  ImageIcon,
  ShieldCheck,
  History,
  Heart,
  Clock,
  UserPlus,
  Bell,
  LayoutGrid,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react';
import { useUserStore } from '@/stores/user-store';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';

type ComingSoonConfig = {
  key: string;
  title: string;
  description: string;
  launchDate: string | null;
};

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  comingSoon?: true;
};

const SIDEBAR_GROUPS: { items: SidebarItem[] }[] = [
  {
    items: [
      { label: 'Thông tin của tôi', href: '/account/info', icon: User },
      { label: 'Ảnh đại diện', href: '/account/avatar', icon: ImageIcon },
      { label: 'Bảo mật tài khoản', href: '/account/security', icon: ShieldCheck },
      { label: 'Lịch sử xem', href: '/account/watch-history', icon: History, comingSoon: true },
      { label: 'Yêu thích', href: '/account/favorites', icon: Heart, comingSoon: true },
      { label: 'Xem sau', href: '/account/watch-later', icon: Clock, comingSoon: true },
    ],
  },
  {
    items: [
      { label: 'Mời bạn bè', href: '/account/invite', icon: UserPlus, comingSoon: true },
      { label: 'Cài đặt thông báo', href: '/account/notifications', icon: Bell, comingSoon: true },
    ],
  },
  {
    items: [
      { label: 'Không gian cá nhân', href: '/account/profile', icon: LayoutGrid, comingSoon: true },
    ],
  },
];

function useComingSoonConfigs() {
  const { data } = useQuery<ComingSoonConfig[]>({
    queryKey: ['coming-soon-features'],
    queryFn: () => apiClient.get<ComingSoonConfig[]>('/features/coming-soon').then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });
  return data ?? [];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function ComingSoonModal({
  item,
  config,
  open,
  onClose,
}: {
  item: SidebarItem | null;
  config: ComingSoonConfig | undefined;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      {item && (
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00aeec]/10">
                <item.icon className="h-5 w-5 text-[#00aeec]" />
              </div>
              <div>
                <h2 className="text-base font-semibold">{item.label}</h2>
                <span className="mt-0.5 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                  Sắp ra mắt
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {config?.description ?? 'Tính năng này đang được phát triển và sẽ sớm ra mắt.'}
          </p>

          <div className="bg-muted/60 mt-4 flex items-center gap-2 rounded-lg px-4 py-3">
            <Clock className="text-muted-foreground h-4 w-4 shrink-0" />
            <p className="text-muted-foreground text-xs">
              {config?.launchDate ? (
                <>
                  Dự kiến ra mắt:{' '}
                  <span className="text-foreground font-semibold">
                    {formatDate(config.launchDate)}
                  </span>
                </>
              ) : (
                'Thời gian ra mắt sẽ được thông báo sớm.'
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-5 w-full rounded-lg bg-[#00aeec] py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Đã hiểu
          </button>
        </div>
      )}
    </Modal>
  );
}

export function AccountSidebar() {
  const pathname = usePathname();
  const configs = useComingSoonConfigs();
  const [selected, setSelected] = useState<SidebarItem | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  const logout = useUserStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      /* ignore */
    }
    logout();
    setShowLogoutConfirm(false);
    router.push('/');
  };

  return (
    <aside className="hidden w-52 shrink-0 md:block">
      <nav className="flex flex-col gap-1">
        {SIDEBAR_GROUPS.map((group, gi) => (
          <div key={gi} className={cn(gi > 0 && 'border-border mt-2 border-t pt-2')}>
            {group.items.map((item) => {
              const { label, href, icon: Icon, comingSoon } = item;
              const active = pathname === href && !comingSoon;

              if (comingSoon) {
                return (
                  <button
                    key={href}
                    onClick={() => setSelected(item)}
                    className="text-muted-foreground hover:bg-accent hover:text-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{label}</span>
                    <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600">
                      Sắp ra mắt
                    </span>
                  </button>
                );
              }

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

        {/* Logout button */}
        <div className="border-border mt-4 border-t pt-3">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="text-red-600 hover:bg-red-50 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Đăng xuất</span>
          </button>
        </div>
      </nav>

      <ComingSoonModal
        open={!!selected}
        item={selected}
        config={configs.find((c) => c.key === selected?.href)}
        onClose={() => setSelected(null)}
      />

      {/* Logout confirmation dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/40 p-4">
          <div className="bg-background rounded-2xl shadow-lg max-w-sm w-full">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-2">Xác nhận đăng xuất</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Hủy
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export function AccountNavCards() {
  const pathname = usePathname();
  const configs = useComingSoonConfigs();
  const [selected, setSelected] = useState<SidebarItem | null>(null);
  const allItems = SIDEBAR_GROUPS.flatMap((g) => g.items);

  return (
    <>
      <div className="border-border bg-background overflow-hidden rounded-2xl border p-3 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          {allItems.map((item) => {
            const { label, href, icon: Icon, comingSoon } = item;
            const active = pathname === href && !comingSoon;

            if (comingSoon) {
              return (
                <button
                  key={href}
                  onClick={() => setSelected(item)}
                  className="text-muted-foreground hover:bg-accent hover:text-foreground flex flex-col items-center gap-2 rounded-xl p-3 transition-colors"
                >
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00aeec]/10 text-[#00aeec]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="ring-background absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2" />
                  </div>
                  <span className="text-center text-[11px] font-medium leading-tight">{label}</span>
                </button>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl p-3 transition-colors',
                  active
                    ? 'bg-[#00aeec]/10 text-[#00aeec]'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full',
                    active ? 'bg-[#00aeec] text-white' : 'bg-[#00aeec]/10 text-[#00aeec]',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-center text-[11px] font-medium leading-tight">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <ComingSoonModal
        open={!!selected}
        item={selected}
        config={configs.find((c) => c.key === selected?.href)}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
