'use client';

import { useCallback } from 'react';
import type { PostFeedItem } from 'shared-types';
import { usePostDetailDrawerStore } from '@/stores/post-detail-drawer-store';
import { useNavigationWithLoader } from '@/hooks/use-navigation-with-loader';
import { ROUTES } from '@/constants';

export function useOpenPost() {
  const openDrawer = usePostDetailDrawerStore((s) => s.openDrawer);
  const router = useNavigationWithLoader();

  return useCallback(
    (post: PostFeedItem, opts?: { focusComments?: boolean }) => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      if (isDesktop) {
        router.push(ROUTES.POST(post.id) + (opts?.focusComments ? '#comments' : ''));
      } else {
        openDrawer(post, opts);
      }
    },
    [openDrawer, router],
  );
}
