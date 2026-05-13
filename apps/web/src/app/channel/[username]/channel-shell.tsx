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
  const [followingOptionsOpen, setFollowingOptionsOpen] = useState(false);
  const [isFollowingOptionsClosing, setIsFollowingOptionsClosing] = useState(false);
  const [isUnfollowing, setIsUnfollowing] = useState(false);

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

  useEffect(() => {
    const handleUnfollowComplete = () => {
      setIsUnfollowing(false);
    };
    window.addEventListener('unfollowComplete', handleUnfollowComplete as EventListener);
    return () => window.removeEventListener('unfollowComplete', handleUnfollowComplete as EventListener);
  }, []);

  const closeFollowingOptions = () => {
    setIsFollowingOptionsClosing(true);
    setTimeout(() => {
      setFollowingOptionsOpen(false);
      setIsFollowingOptionsClosing(false);
    }, 500);
  };

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
          <ChannelUserInfo
            user={profile}
            onFollowingOptionsOpen={() => setFollowingOptionsOpen(true)}
            onFollowingOptionsClose={closeFollowingOptions}
            onUnfollowStart={() => setIsUnfollowing(true)}
            onUnfollowEnd={() => setIsUnfollowing(false)}
          />
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

      {/* Following options bottom sheet drawer — rendered at viewport level */}
      {followingOptionsOpen && (
        <div className={`fixed inset-0 z-50 transition-opacity duration-500 ${isFollowingOptionsClosing ? 'opacity-0' : 'opacity-100'}`}>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/50 transition-opacity duration-500 ${isFollowingOptionsClosing ? 'opacity-0' : 'opacity-100'}`}
            onClick={closeFollowingOptions}
          />

          {/* Bottom sheet */}
          <div className={`fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-lg border border-b-0 border-border shadow-lg transition-all duration-500 ${
            isFollowingOptionsClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100 animate-in slide-in-from-bottom-5'
          }`}>
            <div className="px-[15px] py-4">
              {/* Option: Special Follow */}
              <button
                onClick={() => {}}
                className="w-full text-left py-[6px] text-sm text-foreground hover:opacity-70 transition-opacity"
              >
                Thêm người này vào danh sách Special Follow
              </button>
              <div className="h-px bg-border my-0" />

              {/* Option: Unfollow - calls parent handler */}
              <button
                onClick={() => {
                  setIsUnfollowing(true);
                  // Dispatch custom event that ChannelUserInfo listens to
                  window.dispatchEvent(new CustomEvent('performUnfollow'));
                }}
                disabled={isUnfollowing}
                className="w-full text-left py-[6px] text-sm text-red-600 hover:opacity-70 disabled:opacity-50 transition-opacity"
              >
                {isUnfollowing ? 'Đang hủy...' : 'Unfollow'}
              </button>
              <div className="h-px bg-border my-0" />

              {/* Cancel button */}
              <button
                onClick={closeFollowingOptions}
                className="w-full text-center py-[6px] text-sm text-foreground hover:opacity-70 transition-opacity font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
