'use client';

import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info';

export interface AppNotification {
  id: string;
  message: string;
  type: NotificationType;
  avatarUrl?: string;
  avatarInitial?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  push: (n: Omit<AppNotification, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  push: (n) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ notifications: [...s.notifications, { ...n, id }] }));
    setTimeout(
      () => set((s) => ({ notifications: s.notifications.filter((x) => x.id !== id) })),
      4500,
    );
  },
  dismiss: (id) =>
    set((s) => ({ notifications: s.notifications.filter((x) => x.id !== id) })),
}));

/** Shorthand helpers */
export const notify = {
  success: (message: string, opts?: Partial<Omit<AppNotification, 'id' | 'type' | 'message'>>) =>
    useNotificationStore.getState().push({ type: 'success', message, ...opts }),
  error: (message: string, opts?: Partial<Omit<AppNotification, 'id' | 'type' | 'message'>>) =>
    useNotificationStore.getState().push({ type: 'error', message, ...opts }),
  info: (message: string, opts?: Partial<Omit<AppNotification, 'id' | 'type' | 'message'>>) =>
    useNotificationStore.getState().push({ type: 'info', message, ...opts }),
};
