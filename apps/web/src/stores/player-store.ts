'use client';

import { create } from 'zustand';

interface PlayerState {
  currentVideoId: string | null;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  currentTime: number;
  duration: number;
  danmakuEnabled: boolean;
  setCurrentVideo: (id: string | null) => void;
  setPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  toggleDanmaku: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentVideoId: null,
  isPlaying: false,
  volume: 1,
  muted: false,
  currentTime: 0,
  duration: 0,
  danmakuEnabled: true,
  setCurrentVideo: (id) => set({ currentVideoId: id }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
  setMuted: (muted) => set({ muted }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  toggleDanmaku: () => set((s) => ({ danmakuEnabled: !s.danmakuEnabled })),
}));
