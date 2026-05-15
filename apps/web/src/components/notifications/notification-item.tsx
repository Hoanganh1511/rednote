'use client';

import { useRouter } from 'next/navigation';
import { Heart, UserPlus, AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';
import { useMarkNotificationRead } from '@/hooks/use-notifications';
import type { AppNotification } from 'shared-types';
import { NotificationType } from 'shared-types';

function formatRelativeTime(dateStr: string): string {
  const normalized = dateStr.trim().replace(' ', 'T');
  const hasTimezone = /[Zz]$|[+-]\d{2}(:\d{2})?$/.test(normalized);
  const utcStr = hasTimezone ? normalized : normalized + 'Z';
  const diff = Date.now() - new Date(utcStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'vừa xong';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ngày trước`;
  if (d < 30) return `${Math.floor(d / 7)} tuần trước`;
  if (d < 365) return `${Math.floor(d / 30)} tháng trước`;
  return `${Math.floor(d / 365)} năm trước`;
}

const TYPE_BADGE_CONFIG = {
  [NotificationType.LIKE_POST]: { icon: Heart, bg: 'bg-pink-500' },
  [NotificationType.NEW_FOLLOW]: { icon: UserPlus, bg: 'bg-blue-500' },
  [NotificationType.MENTION]: { icon: AtSign, bg: 'bg-green-500' },
} as const;

function getNotificationText(type: NotificationType): string {
  switch (type) {
    case NotificationType.LIKE_POST:
      return 'đã thích bài viết của bạn';
    case NotificationType.NEW_FOLLOW:
      return 'đã bắt đầu theo dõi bạn';
    case NotificationType.MENTION:
      return 'đã nhắc đến bạn trong một bài viết';
  }
}

interface NotificationItemProps {
  notification: AppNotification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const markRead = useMarkNotificationRead();

  const handleClick = () => {
    if (!notification.isRead) {
      markRead.mutate(notification.id);
    }
    if (
      (notification.type === NotificationType.LIKE_POST ||
        notification.type === NotificationType.MENTION) &&
      notification.entityId
    ) {
      router.push(ROUTES.POST(notification.entityId));
    } else if (notification.type === NotificationType.NEW_FOLLOW) {
      router.push(ROUTES.CHANNEL(notification.actor.username));
    }
  };

  const { icon: BadgeIcon, bg: badgeBg } = TYPE_BADGE_CONFIG[notification.type];
  const actorName = notification.actor.displayName ?? notification.actor.username;
  const postThumb =
    notification.type === NotificationType.LIKE_POST
      ? (notification.metadata?.postImageUrl as string | null | undefined)
      : null;

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors',
        notification.isRead ? 'hover:bg-muted/50' : 'bg-blue-50/60 hover:bg-blue-50 dark:bg-blue-950/20',
      )}
    >
      {/* Avatar + type badge */}
      <div className="relative shrink-0">
        <div className="h-11 w-11 overflow-hidden rounded-full bg-muted">
          {notification.actor.avatarUrl ? (
            <img
              src={notification.actor.avatarUrl}
              alt={actorName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#00aeec] text-sm font-semibold text-white">
              {actorName[0]?.toUpperCase() ?? '?'}
            </div>
          )}
        </div>
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full',
            badgeBg,
          )}
        >
          <BadgeIcon className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
        </span>
      </div>

      {/* Text */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="line-clamp-2 text-sm leading-snug">
          <span className="font-semibold">{actorName}</span>{' '}
          <span className="text-muted-foreground">{getNotificationText(notification.type)}</span>
        </p>
        <span className="text-xs text-muted-foreground/70">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>

      {/* Right: thumbnail + unread dot */}
      <div className="flex shrink-0 items-center gap-2">
        {postThumb && (
          <div className="h-12 w-12 overflow-hidden rounded-lg border border-border">
            <img src={postThumb} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        {!notification.isRead && (
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
        )}
      </div>
    </button>
  );
}
