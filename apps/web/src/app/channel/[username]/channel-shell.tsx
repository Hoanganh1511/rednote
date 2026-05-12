'use client';

import { useCallback, useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import type { User, PostFeedPage } from 'shared-types';
import { ChannelHeader } from './components/channel-header';
import { ChannelCover } from './components/channel-cover';
import { ChannelUserInfo } from './components/channel-user-info';
import { ChannelBio } from './components/channel-bio';
import { ChannelTabs } from './components/channel-tabs';
import { ChannelPostList } from './components/channel-post-list';
import { ChannelMessageDrawer } from './components/channel-message-drawer';

interface ChannelShellProps {
  profile: User;
  initialPosts: PostFeedPage;
}

export function ChannelShell({ profile, initialPosts }: ChannelShellProps) {
  const [scrollY, setScrollY] = useState(0);
  const [messageDrawerOpen, setMessageDrawerOpen] = useState(false);

  const handleMainScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop);
  }, []);

  useEffect(() => {
    if (!messageDrawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [messageDrawerOpen]);

  useEffect(() => {
    if (!messageDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMessageDrawerOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [messageDrawerOpen]);

  return (
    <div className="relative w-full">
      <main
        className="w-full overflow-y-auto"
        style={{ height: '100dvh' }}
        onScroll={handleMainScroll}
      >
        {/* Cover — full-width, no padding */}
        <ChannelCover coverUrl={profile.coverUrl ?? null} />

        {/* Profile content */}
        <div className="mx-auto max-w-2xl px-4 pb-32">
          <ChannelUserInfo user={profile} />
          <ChannelBio user={profile} />

          {/* Power Up bar */}
          <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Zap className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>Tăng sức mạnh</span>
            </div>
            <span className="text-xs text-muted-foreground">0 người ủng hộ</span>
          </div>

          <ChannelTabs />
          <ChannelPostList userId={profile.id} initialPosts={initialPosts} />
        </div>
      </main>

      <ChannelHeader
        user={profile}
        scrollY={scrollY}
        onMessageClick={() => setMessageDrawerOpen(true)}
      />
      <ChannelMessageDrawer
        open={messageDrawerOpen}
        onClose={() => setMessageDrawerOpen(false)}
        userDisplayName={profile.displayName || profile.username}
      />
    </div>
  );
}
