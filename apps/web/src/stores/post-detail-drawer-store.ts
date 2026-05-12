'use client';

import { create } from 'zustand';
import type { PostFeedItem } from 'shared-types';

type PostDetailDrawerState = {
  open: boolean;
  post: PostFeedItem | null;
  focusComments: boolean;
  openDrawer: (post: PostFeedItem, opts?: { focusComments?: boolean }) => void;
  closeDrawer: () => void;
  patchDrawerPost: (patch: Partial<PostFeedItem>) => void;
};

export const usePostDetailDrawerStore = create<PostDetailDrawerState>((set) => ({
  open: false,
  post: null,
  focusComments: false,
  openDrawer: (post, opts) =>
    set({
      open: true,
      post,
      focusComments: opts?.focusComments ?? false,
    }),
  closeDrawer: () =>
    set({
      open: false,
      post: null,
      focusComments: false,
    }),
  patchDrawerPost: (patch) =>
    set((s) => {
      if (!s.post) return s;
      return { post: { ...s.post, ...patch } };
    }),
}));
