'use client';

import { useCallback, useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import type { User, PostFeedPage } from 'shared-types';
import { Dialog } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { ChannelHeader } from './components/channel-header';
import { ChannelCover } from './components/channel-cover';
import { ChannelUserInfo } from './components/channel-user-info';
import { ChannelBio } from './components/channel-bio';
import { ChannelTabs } from './components/channel-tabs';
import { ChannelPostList } from './components/channel-post-list';
import { ChannelMessageDrawer } from './components/channel-message-drawer';
import { ChannelStatsDrawer } from './components/channel-stats-drawer';
import { CoverImageSelectorDrawer } from './components/cover-image-selector-drawer';
import { useCurrentUser } from '@/hooks/use-auth';
import { ROUTES } from '@/constants';
import { useNavigationWithLoader } from '@/hooks/use-navigation-with-loader';

interface ChannelShellProps {
  profile: User;
  initialPosts: PostFeedPage;
}

export function ChannelShell({ profile, initialPosts }: ChannelShellProps) {
  const currentUser = useCurrentUser();
  const router = useNavigationWithLoader();
  const [scrollY, setScrollY] = useState(0);
  const [messageDrawerOpen, setMessageDrawerOpen] = useState(false);
  const [followingOptionsOpen, setFollowingOptionsOpen] = useState(false);
  const [followingOptionsIn, setFollowingOptionsIn] = useState(false);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [isUnfollowing, setIsUnfollowing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [openStatsDrawer, setOpenStatsDrawer] = useState(false);
  const [coverImageSelectorOpen, setCoverImageSelectorOpen] = useState(false);
  const [profileData, setProfileData] = useState<User>(profile);

  // Refetch user data from server to keep stats in sync
  const refetchUserData = useCallback(async () => {
    try {
      const response = await apiClient.get<User>(`/users/${profile.id}`);
      setProfileData(response.data);
    } catch {
      // Silent fail - keep current state
    }
  }, [profile.id]);

  const handleMainScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop);
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

  useEffect(() => {
    const handleUnfollowComplete = () => {
      setIsUnfollowing(false);
    };
    window.addEventListener('unfollowComplete', handleUnfollowComplete as EventListener);
    return () =>
      window.removeEventListener('unfollowComplete', handleUnfollowComplete as EventListener);
  }, []);

  useEffect(() => {
    if (!followingOptionsOpen) {
      setFollowingOptionsIn(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      setFollowingOptionsIn(true);
    });
    return () => cancelAnimationFrame(id);
  }, [followingOptionsOpen]);

  const closeFollowingOptions = () => {
    setFollowingOptionsIn(false);
    setTimeout(() => {
      setFollowingOptionsOpen(false);
    }, 520);
  };

  return (
    <div className="relative w-full">
      <main
        className="w-full overflow-y-auto"
        style={{ height: '100dvh' }}
        onScroll={handleMainScroll}
      >
        {/* Cover — full-width, no padding */}
        <ChannelCover
          coverUrl={profileData.coverUrl ?? null}
          isOwnProfile={currentUser?.id === profile.id}
          onCoverSelectClick={() => setCoverImageSelectorOpen(true)}
        />

        {/* Profile content */}
        <div className="mx-auto max-w-2xl px-4 pb-6">
          <ChannelUserInfo
            user={profileData}
            onFollowingChange={setIsFollowing}
            onStatsClick={() => setOpenStatsDrawer(true)}
            onFollowingOptionsOpen={() => setFollowingOptionsOpen(true)}
            onFollowingOptionsClose={closeFollowingOptions}
            onUnfollowStart={() => setIsUnfollowing(true)}
            onUnfollowEnd={() => setIsUnfollowing(false)}
            onUserDataRefresh={setProfileData}
            onEditProfileClick={() => router.push(ROUTES.ACCOUNT_INFO)}
          />
          <ChannelBio user={profileData} />

          {/* Power Up bar */}
          {/* <div className="border-border bg-background mb-4 flex items-center justify-between rounded-xl border px-4 py-3">
            <div className="text-foreground flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>Tăng sức mạnh</span>
            </div>
            <span className="text-muted-foreground text-xs">0 người ủng hộ</span>
          </div> */}
        </div>

        {/* Sticky tabs — full width */}
        <ChannelTabs />

        {/* Posts */}
        <div className="mx-auto max-w-2xl px-4 pb-6">
          <ChannelPostList
            userId={profileData.id}
            initialPosts={initialPosts}
            onAuthorStatsChange={refetchUserData}
          />
        </div>
      </main>

      <ChannelHeader
        user={profileData}
        scrollY={scrollY}
        onMessageClick={() => setMessageDrawerOpen(true)}
      />
      <ChannelMessageDrawer
        open={messageDrawerOpen}
        onClose={() => setMessageDrawerOpen(false)}
        userDisplayName={profileData.displayName || profileData.username}
      />

      {/* Following options bottom sheet drawer — rendered at viewport level */}
      {isFollowing && followingOptionsOpen ? (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-[200ms] ${
            followingOptionsIn ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
            pointerEvents: followingOptionsIn ? 'auto' : 'none',
          }}
        >
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/50 transition-opacity duration-[520ms] ${
              followingOptionsIn ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
            }}
            onClick={closeFollowingOptions}
          />

          {/* Bottom sheet */}
          <div
            className={`bg-background border-border fixed right-0 bottom-0 left-0 z-50 rounded-t-lg border border-b-0 shadow-lg transition duration-[520ms] will-change-transform ${
              followingOptionsIn ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
            }}
          >
            <div className="flex-1 px-[15px] py-4">
              {/* Option: Special Follow */}
              <button
                onClick={() => {}}
                className="text-foreground w-full py-3 text-left text-sm transition-opacity hover:opacity-70"
              >
                Thêm người này vào danh sách Special Follow
              </button>
              <div className="bg-border my-0 h-px" />

              {/* Option: Unfollow - shows confirmation */}
              <button
                onClick={() => setShowUnfollowConfirm(true)}
                className="w-full py-3 text-left text-sm text-red-600 transition-opacity hover:opacity-70"
              >
                Unfollow
              </button>
            </div>

            {/* Divider */}
            <div className="bg-border h-[2px]" />

            {/* Cancel button — separated at bottom */}
            <button
              onClick={closeFollowingOptions}
              className="text-foreground w-full py-3 text-center text-sm font-medium transition-opacity hover:opacity-70"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {/* Unfollow confirmation dialog */}
      <Dialog
        open={showUnfollowConfirm}
        onClose={() => setShowUnfollowConfirm(false)}
        title="Xác nhận hủy theo dõi?"
        actions={[
          {
            label: 'Hủy',
            variant: 'outline',
            onClick: () => setShowUnfollowConfirm(false),
          },
          {
            label: isUnfollowing ? 'Đang hủy...' : 'Hủy theo dõi',
            onClick: () => {
              setShowUnfollowConfirm(false);
              setIsUnfollowing(true);
              window.dispatchEvent(new CustomEvent('performUnfollow'));
            },
            disabled: isUnfollowing,
            className: 'bg-red-600 hover:bg-red-700 text-white',
          },
        ]}
      >
        Bạn sẽ không còn nhận được cập nhật từ {profileData.displayName || profileData.username}
      </Dialog>

      {/* Stats drawer — viewport level to avoid clipping */}
      <ChannelStatsDrawer
        open={openStatsDrawer}
        onClose={() => setOpenStatsDrawer(false)}
        user={profileData}
      />

      {/* Cover image selector drawer */}
      <CoverImageSelectorDrawer
        open={coverImageSelectorOpen}
        onClose={() => setCoverImageSelectorOpen(false)}
        onCoverSelected={(url) => {
          setProfileData((prev) => ({ ...prev, coverUrl: url }));
        }}
      />
    </div>
  );
}
