'use client';

import { useCallback, useEffect, useState } from 'react';
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
    const element = e.currentTarget;
    setScrollY(element.scrollTop);
  }, []);

  useEffect(() => {
    if (!messageDrawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [messageDrawerOpen]);

  useEffect(() => {
    if (!messageDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMessageDrawerOpen(false);
    };
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
        <ChannelCover coverUrl={profile.coverUrl ?? null} />
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:px-8 pb-32">
          <ChannelUserInfo user={profile} />
          <ChannelBio bio={profile.bio} />
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
