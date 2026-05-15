export enum NotificationType {
  LIKE_POST = 'LIKE_POST',
  NEW_FOLLOW = 'NEW_FOLLOW',
  MENTION = 'MENTION',
}

export interface NotificationActor {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  actorId: string;
  actor: NotificationActor;
  entityId: string | null;
  entityType: string | null;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationUnreadCounts {
  LIKE_POST: number;
  NEW_FOLLOW: number;
  MENTION: number;
  total: number;
}
