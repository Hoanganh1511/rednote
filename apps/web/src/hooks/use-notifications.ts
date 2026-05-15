'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { QUERY_KEYS } from '@/constants';
import { useUserStore } from '@/stores/user-store';
import type { AppNotification, NotificationUnreadCounts, NotificationType } from 'shared-types';

interface NotificationsPage {
  items: AppNotification[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export function useNotificationsQuery(type?: NotificationType) {
  const user = useUserStore((s) => s.user);

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, type ?? 'all'],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ page: String(pageParam), limit: '20' });
      if (type) params.set('type', type);
      return (await apiClient.get<NotificationsPage>(`/notifications?${params.toString()}`)).data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!user,
    staleTime: 15_000,
  });
}

export function useNotificationUnreadCounts() {
  const user = useUserStore((s) => s.user);

  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS_UNREAD],
    queryFn: async () =>
      (await apiClient.get<NotificationUnreadCounts>('/notifications/unread-count')).data,
    enabled: !!user,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`/notifications/${id}/read`),
    onMutate: async (id: string) => {
      // Optimistic: find notification in cache to know its type, then decrement count
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS_UNREAD] });

      const prev = queryClient.getQueryData<NotificationUnreadCounts>([QUERY_KEYS.NOTIFICATIONS_UNREAD]);

      // Find the notification type from any cached notifications page
      const pages = queryClient.getQueriesData<{ pages: { items: AppNotification[] }[] }>({
        queryKey: [QUERY_KEYS.NOTIFICATIONS],
      });
      let notifType: string | undefined;
      for (const [, data] of pages) {
        const found = data?.pages?.flatMap((p) => p.items).find((n) => n.id === id);
        if (found && !found.isRead) { notifType = found.type; break; }
      }

      if (prev && notifType) {
        queryClient.setQueryData<NotificationUnreadCounts>([QUERY_KEYS.NOTIFICATIONS_UNREAD], {
          ...prev,
          [notifType]: Math.max(0, (prev[notifType as keyof NotificationUnreadCounts] as number) - 1),
          total: Math.max(0, prev.total - 1),
        });
      }

      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData([QUERY_KEYS.NOTIFICATIONS_UNREAD], ctx.prev);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS_UNREAD] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (type?: NotificationType) => {
      const url = type ? `/notifications/read-all?type=${type}` : '/notifications/read-all';
      return apiClient.patch(url);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS_UNREAD] });
    },
  });
}
