'use client';

import { useState } from 'react';
import { Heart, UserPlus, AtSign, Bell, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NotificationType } from 'shared-types';
import { useNotificationsQuery, useNotificationUnreadCounts, useMarkAllNotificationsRead } from '@/hooks/use-notifications';
import { useUserStore } from '@/stores/user-store';
import { useLoginModalStore } from '@/stores/login-modal-store';
import { NotificationCategoryCard } from '@/components/notifications/notification-category-card';
import { NotificationItem } from '@/components/notifications/notification-item';
import { MobileNav } from '@/components/layout/mobile-nav';
import { LoginModal } from '@/components/auth/login-modal';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  {
    type: NotificationType.LIKE_POST,
    label: 'Lượt thích',
    icon: Heart,
    iconColor: 'text-pink-500',
    iconBg: 'bg-pink-50',
  },
  {
    type: NotificationType.NEW_FOLLOW,
    label: 'Người theo dõi',
    icon: UserPlus,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
  },
  {
    type: NotificationType.MENTION,
    label: 'Nhắc đến',
    icon: AtSign,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-50',
  },
] as const;

function NotificationSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-3 animate-pulse">
      <div className="h-11 w-11 shrink-0 rounded-full bg-muted" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-3.5 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/3 rounded bg-muted" />
      </div>
    </div>
  );
}

function EmptyState({ type }: { type?: NotificationType }) {
  const labels: Record<NotificationType, string> = {
    LIKE_POST: 'lượt thích',
    NEW_FOLLOW: 'người theo dõi mới',
    MENTION: 'nhắc đến',
  };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Bell className="h-10 w-10 opacity-20" />
      <p className="text-sm">
        {type ? `Chưa có thông báo ${labels[type]}` : 'Chưa có thông báo nào'}
      </p>
    </div>
  );
}

export default function NotificationsPage() {
  const [activeType, setActiveType] = useState<NotificationType | null>(null);
  const user = useUserStore((s) => s.user);
  const openLoginModal = useLoginModalStore((s) => s.openModal);
  const router = useRouter();

  const loginModalOpen = useLoginModalStore((s) => s.open);
  const closeLoginModal = useLoginModalStore((s) => s.closeModal);

  const { data: unreadCounts } = useNotificationUnreadCounts();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useNotificationsQuery(activeType ?? undefined);
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.pages.flatMap((p) => p.items) ?? [];
  const hasUnread = (unreadCounts?.total ?? 0) > 0;

  if (!user) {
    return (
      <>
        <main className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground">
          <Bell className="h-12 w-12 opacity-20" />
          <p className="text-sm">Đăng nhập để xem thông báo</p>
          <button
            onClick={() => openLoginModal()}
            className="rounded-lg bg-[#00aeec] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Đăng nhập
          </button>
        </main>
        <MobileNav className="fixed bottom-0 left-0 right-0 z-[95] md:hidden" />
        <LoginModal open={loginModalOpen} onClose={closeLoginModal} />
      </>
    );
  }

  return (
    <>
    <main className="mx-auto w-full max-w-[600px] px-4 py-6 pb-28 md:pb-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Trở về"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Thông báo</h1>
        </div>
        {hasUnread && (
          <button
            onClick={() => markAllRead.mutate(activeType ?? undefined)}
            disabled={markAllRead.isPending}
            className="text-sm text-[#00A1D6] transition-opacity hover:opacity-70 disabled:opacity-50"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Category cards */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {CATEGORIES.map(({ type, label, icon, iconColor, iconBg }) => (
          <NotificationCategoryCard
            key={type}
            type={type}
            label={label}
            icon={icon}
            iconColor={iconColor}
            iconBg={iconBg}
            count={unreadCounts?.[type] ?? 0}
            active={activeType === type}
            onClick={() => setActiveType((prev) => (prev === type ? null : type))}
          />
        ))}
      </div>

      {/* Divider with active filter label */}
      {activeType && (
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {CATEGORIES.find((c) => c.type === activeType)?.label}
          </span>
          <button
            onClick={() => setActiveType(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Xem tất cả
          </button>
        </div>
      )}

      {/* Notification list */}
      <div className={cn('space-y-0.5', !activeType && 'divide-y divide-border/40')}>
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => <NotificationSkeleton key={i} />)}

        {!isLoading && notifications.length === 0 && (
          activeType ? <EmptyState type={activeType} /> : <EmptyState />
        )}

        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} />
        ))}

        {hasNextPage && (
          <button
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full py-3 text-center text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
          </button>
        )}
      </div>
    </main>
    <MobileNav className="fixed bottom-0 left-0 right-0 z-[95] md:hidden" />
    <LoginModal open={false} onClose={() => {}} />
    </>
  );
}
