'use client';

import { useCallback, useEffect, useState } from 'react';
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

  const refetchUserData = useCallback(async () => {
    try {
      const response = await apiClient.get<User>(`/users/${profile.id}`);
      setProfileData(response.data);
    } catch {
      // Silent fail
    }
  }, [profile.id]);

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
    const handleUnfollowComplete = () => { setIsUnfollowing(false); };
    window.addEventListener('unfollowComplete', handleUnfollowComplete as EventListener);
    return () => window.removeEventListener('unfollowComplete', handleUnfollowComplete as EventListener);
  }, []);

  useEffect(() => {
    if (!followingOptionsOpen) { setFollowingOptionsIn(false); return; }
    const id = requestAnimationFrame(() => { setFollowingOptionsIn(true); });
    return () => cancelAnimationFrame(id);
  }, [followingOptionsOpen]);

  const closeFollowingOptions = () => {
    setFollowingOptionsIn(false);
    setTimeout(() => { setFollowingOptionsOpen(false); }, 500);
  };

  const displayName = profileData.displayName || profileData.username;
  const isOwnProfile = currentUser?.id === profile.id;

  const sharedUserInfoProps = {
    user: profileData,
    onFollowingChange: setIsFollowing,
    onStatsClick: () => setOpenStatsDrawer(true),
    onFollowingOptionsOpen: () => setFollowingOptionsOpen(true),
    onFollowingOptionsClose: closeFollowingOptions,
    onUnfollowStart: () => setIsUnfollowing(true),
    onUnfollowEnd: () => setIsUnfollowing(false),
    onUserDataRefresh: setProfileData,
    onEditProfileClick: () => router.push(ROUTES.ACCOUNT_INFO),
  };

  return (
    <div className="relative w-full">
      <main
        className="w-full overflow-y-auto"
        style={{ height: '100dvh' }}
        onScroll={handleMainScroll}
      >
        {/* Cover */}
        <ChannelCover
          coverUrl={profileData.coverUrl ?? null}
          isOwnProfile={isOwnProfile}
          onCoverSelectClick={() => setCoverImageSelectorOpen(true)}
        />

        {/* ── PC Profile Section (md+) ─────────────────────────────────────── */}
        <div className="hidden md:block bg-background border-b border-border/50">
          <div className="mx-auto max-w-5xl px-8">
            <div className="flex items-end gap-8 pb-6">
              {/* Large avatar overlapping cover */}
              <div className="-mt-14 shrink-0">
                {profileData.avatarUrl ? (
                  <img
                    src={profileData.avatarUrl}
                    alt={displayName}
                    className="h-28 w-28 rounded-full border-4 border-background object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-background bg-[#00aeec] shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Bio — center */}
              <div className="flex-1 pb-1 pt-4">
                <ChannelBio user={profileData} />
              </div>

              {/* Stats + buttons — right */}
              <div className="pb-1 pt-4">
                <ChannelUserInfo {...sharedUserInfoProps} hideAvatar />
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile Profile Section (< md) ───────────────────────────────── */}
        <div className="md:hidden mx-auto max-w-2xl px-4 pb-4">
          <ChannelUserInfo {...sharedUserInfoProps} />
          <ChannelBio user={profileData} />
        </div>

        {/* Tabs */}
        <ChannelTabs />

        {/* Posts */}
        <div className="mx-auto max-w-5xl px-4 md:px-8 pb-8 pt-5">
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

      {/* Following options bottom sheet */}
      {isFollowing && followingOptionsOpen && (
        <div
          className="fixed inset-0 z-50"
          style={{ pointerEvents: followingOptionsIn ? 'auto' : 'none' }}
        >
          <div
            className={`fixed inset-0 bg-black/50 transition-opacity duration-500 ${followingOptionsIn ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeFollowingOptions}
          />
          <div
            className={`bg-background border-border fixed right-0 bottom-0 left-0 z-50 rounded-t-lg border border-b-0 shadow-lg transition-transform duration-500 will-change-transform ${followingOptionsIn ? 'translate-y-0' : 'translate-y-full'}`}
          >
            <div className="flex-1 px-[15px] py-2">
              <button onClick={() => {}} className="text-foreground w-full text-left text-sm transition-opacity hover:opacity-70" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
                Thêm người này vào danh sách Special Follow
              </button>
              <div className="bg-border my-0 h-px" />
              <button onClick={() => setShowUnfollowConfirm(true)} className="w-full text-left text-sm text-red-600 transition-opacity hover:opacity-70" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
                Unfollow
              </button>
            </div>
            <div className="bg-border h-[2px]" />
            <button onClick={closeFollowingOptions} className="text-foreground w-full py-3 text-center text-sm font-medium transition-opacity hover:opacity-70">
              Cancel
            </button>
          </div>
        </div>
      )}

      <Dialog
        open={showUnfollowConfirm}
        onClose={() => setShowUnfollowConfirm(false)}
        title="Hủy theo dõi?"
        actions={[
          { label: 'Hủy', variant: 'outline', onClick: () => setShowUnfollowConfirm(false) },
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
        Bạn sẽ không còn nhận được thông tin về {profileData.displayName || profileData.username}
      </Dialog>

      <ChannelStatsDrawer open={openStatsDrawer} onClose={() => setOpenStatsDrawer(false)} user={profileData} />
      <CoverImageSelectorDrawer
        open={coverImageSelectorOpen}
        onClose={() => setCoverImageSelectorOpen(false)}
        onCoverSelected={(url) => { setProfileData((prev) => ({ ...prev, coverUrl: url })); }}
      />
    </div>
  );
}
