'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/stores/user-store';
import { QUERY_KEYS, WS_URL } from '@/constants';

export function useNotificationSocket() {
  const user = useUserStore((s) => s.user);
  const accessToken = useUserStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || !accessToken) return;

    const socket = io(WS_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
    });

    socket.on('notification.new', () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS_UNREAD] });
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, accessToken, queryClient]);
}
