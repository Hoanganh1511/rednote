'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';
import type { User } from 'shared-types';

export function useCurrentUser(): User | null {
  return useUserStore((s) => s.user);
}

export function useIsLoggedIn(): boolean {
  return useUserStore((s) => !!s.accessToken);
}

/** Redirects to /login if the user is not authenticated. Use in client components on protected pages. */
export function useRequireAuth(redirectTo = '/'): User | null {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const accessToken = useUserStore((s) => s.accessToken);

  useEffect(() => {
    // Wait for Zustand hydration (accessToken would be null before hydrate)
    // Using a microtask ensures the store has hydrated from localStorage
    const timer = setTimeout(() => {
      if (!accessToken) router.replace(redirectTo);
    }, 0);
    return () => clearTimeout(timer);
  }, [accessToken, redirectTo, router]);

  return user;
}
