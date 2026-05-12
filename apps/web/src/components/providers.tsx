'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import { getQueryClient } from '@/lib/query-client';
import { useUserStore } from '@/stores/user-store';
import { apiClient } from '@/lib/api-client';
import { LiveNotificationStack } from '@/components/ui/live-notification';
import { Toaster } from 'sonner';
import { NavigationLoaderProvider } from '@/components/navigation-loader';
import type { User } from 'shared-types';

function AuthRefresh() {
  const accessToken = useUserStore((s) => s.accessToken);
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    if (!accessToken) return;
    apiClient
      .get<User>('/users/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        // 401 is handled by the interceptor (auto-refresh or logout)
      });
  }, [accessToken, setUser]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <NavigationLoaderProvider>
      <QueryClientProvider client={queryClient}>
        <AuthRefresh />
        {children}
        <LiveNotificationStack />
        <Toaster position="top-center" richColors closeButton />
      </QueryClientProvider>
    </NavigationLoaderProvider>
  );
}
