import { create } from 'zustand';

interface LoginModalStore {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useLoginModalStore = create<LoginModalStore>((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false }),
}));
