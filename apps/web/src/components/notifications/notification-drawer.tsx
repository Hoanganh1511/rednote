'use client';

import { useState } from 'react';
import { Heart, UserPlus, AtSign, Bell } from 'lucide-react';
import { NotificationType } from 'shared-types';
import {
  useNotificationsQuery,
  useNotificationUnreadCounts,
  useMarkAllNotificationsRead,
} from '@/hooks/use-notifications';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { NotificationCategoryCard } from './notification-category-card';
import { NotificationItem } from './notification-item';

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
    label: 'Theo dõi',
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

function Skeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-3 w-3/4 rounded bg-muted" />
        <div className="h-2.5 w-1/3 rounded bg-muted" />
      </div>
    </div>
  );
}

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const [activeType, setActiveType] = useState<NotificationType | null>(null);

  const { data: unreadCounts } = useNotificationUnreadCounts();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useNotificationsQuery(activeType ?? undefined);
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.pages.flatMap((p) => p.items) ?? [];
  const hasUnread = (unreadCounts?.total ?? 0) > 0;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent open={open} onClose={onClose} title="Thông báo">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 pr-12">
            <h2 className="text-base font-semibold">Thông báo</h2>
            {hasUnread && (
              <button
                onClick={() => markAllRead.mutate(activeType ?? undefined)}
                disabled={markAllRead.isPending}
                className="text-xs text-[#00A1D6] hover:opacity-70 disabled:opacity-40 transition-opacity"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Category cards */}
          <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b border-border/40">
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

          {/* List — scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}

            {!isLoading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                <Bell className="h-9 w-9 opacity-20" />
                <p className="text-sm">Chưa có thông báo nào</p>
              </div>
            )}

            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}

            {hasNextPage && (
              <button
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-3 text-center text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
