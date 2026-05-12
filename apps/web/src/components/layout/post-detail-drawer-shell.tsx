'use client';

import { useCallback, useEffect, useState } from 'react';
import { PostDetailView } from '@/app/posts/[id]/post-detail-view';
import { cn } from '@/lib/utils';
import { usePostDetailDrawerStore } from '@/stores/post-detail-drawer-store';

export function PostDetailDrawerShell({ children }: { children: React.ReactNode }) {
  const open = usePostDetailDrawerStore((s) => s.open);
  const post = usePostDetailDrawerStore((s) => s.post);
  const focusComments = usePostDetailDrawerStore((s) => s.focusComments);
  const closeDrawer = usePostDetailDrawerStore((s) => s.closeDrawer);

  const [panelIn, setPanelIn] = useState(false);

  useEffect(() => {
    if (!open) {
      setPanelIn(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      setPanelIn(true);
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeDrawer]);

  const onBackdropPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.target === e.currentTarget) closeDrawer();
    },
    [closeDrawer],
  );

  return (
    <>
      <div
        className={cn(
          'transition-[transform,filter] duration-[520ms] ease-[cubic-bezier(0.25,0.8,0.25,1)]',
          open && panelIn && '-translate-x-[min(100vw,28rem)] brightness-[0.94]',
        )}
      >
        {children}
      </div>

      {open && post ? (
        <div
          className="fixed inset-0 z-[90] touch-none bg-black/45 transition-opacity duration-[520ms]"
          aria-hidden
          onPointerDown={onBackdropPointerDown}
        />
      ) : null}

      {open && post ? (
        <aside
          className={cn(
            'fixed inset-y-0 right-0 z-[100] flex h-dvh max-h-dvh w-[min(100vw,28rem)] flex-col overflow-hidden border-l border-border bg-background transition-transform duration-[520ms] ease-[cubic-bezier(0.25,0.8,0.25,1)] will-change-transform',
            panelIn ? 'translate-x-0' : 'translate-x-full',
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="post-drawer-title"
        >
          <span id="post-drawer-title" className="sr-only">
            Chi tiết bài đăng
          </span>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <PostDetailView
              post={post}
              variant="drawer"
              focusComments={focusComments}
              drawerPanelEntered={panelIn}
              onCloseDrawer={closeDrawer}
            />
          </div>
        </aside>
      ) : null}
    </>
  );
}
