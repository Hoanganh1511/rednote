import { create } from 'zustand';

interface AccountUiStore {
  mobileBackOverride: (() => void) | null;
  setMobileBackOverride: (fn: (() => void) | null) => void;
}

export const useAccountUiStore = create<AccountUiStore>()((set) => ({
  mobileBackOverride: null,
  setMobileBackOverride: (fn) => set({ mobileBackOverride: fn }),
}));
