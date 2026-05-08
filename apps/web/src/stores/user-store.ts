'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from 'shared-types';

interface UserState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  justLoggedIn: boolean;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setJustLoggedIn: (v: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      justLoggedIn: false,
      setUser: (user) => set({ user }),
      setTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),
      setJustLoggedIn: (justLoggedIn) => set({ justLoggedIn }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'rednote-user',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
