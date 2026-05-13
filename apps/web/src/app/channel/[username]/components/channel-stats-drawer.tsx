'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Filter } from 'lucide-react';
import type { User } from 'shared-types';
import { apiClient } from '@/lib/api-client';
import { useCurrentUser } from '@/hooks/use-auth';

type Tab = 'followers' | 'following';
type SortOption = 'default' | 'newest' | 'oldest';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'default', label: 'Mặc định' },
  { id: 'newest', label: 'Ngày theo dõi: Mới nhất' },
  { id: 'oldest', label: 'Ngày theo dõi: Sớm nhất' },
];

interface ChannelStatsDrawerProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

export function ChannelStatsDrawer({ open, onClose, user }: ChannelStatsDrawerProps) {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>('followers');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [sortDrawerOpen, setSortDrawerOpen] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<Map<string, boolean>>(new Map());
  const [followerFollowsBack, setFollowerFollowsBack] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'followers') {
          const response = await apiClient.get(`/users/${user.id}/followers`);
          const followersList = response.data?.items || [];
          setFollowers(followersList);

          // Check following status for each follower
          if (currentUser) {
            const statusMap = new Map<string, boolean>();
            for (const follower of followersList) {
              try {
                const checkResponse = await apiClient.get(`/users/${follower.id}/is-following`);
                statusMap.set(follower.id, checkResponse.data?.isFollowing ?? false);
              } catch {
                statusMap.set(follower.id, false);
              }
            }
            setFollowingStatus(statusMap);
          }
        } else if (activeTab === 'following') {
          const response = await apiClient.get(`/users/${user.id}/following`);
          const followingList = response.data?.items || [];
          setFollowing(followingList);

          // Check if each following person follows back
          if (currentUser) {
            const followsBackMap = new Map<string, boolean>();
            for (const followedUser of followingList) {
              try {
                const checkResponse = await apiClient.get(`/users/${followedUser.id}/is-following`);
                followsBackMap.set(followedUser.id, checkResponse.data?.isFollowing ?? false);
              } catch {
                followsBackMap.set(followedUser.id, false);
              }
            }
            setFollowerFollowsBack(followsBackMap);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [open, activeTab, user.id, currentUser]);

  const getSortLabel = () => {
    return SORT_OPTIONS.find(opt => opt.id === sortOption)?.label || 'Mặc định';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[45] bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-lg transition-transform duration-500 flex flex-col ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`} style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)' }}>
        {/* Header */}
        <div className="flex items-center justify-center px-4 py-4 border-b border-border">
          <button
            onClick={onClose}
            className="absolute left-4 flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-semibold text-foreground">Danh sách bạn bè</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {['followers', 'following'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-[#00aeec] text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'following' && `Đang theo dõi (${user.followingCount})`}
              {tab === 'followers' && `Người theo dõi (${user.followerCount})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {/* Following Tab Content */}
          <div
            className="absolute inset-0 overflow-y-auto transition-transform duration-500"
            style={{
              transform: activeTab === 'following' ? 'translateX(0)' : 'translateX(100%)',
              transitionTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
            }}
          >
            {/* Search Bar */}
            <div className="sticky top-0 border-b border-border bg-background px-4 py-3">
              <input
                type="text"
                placeholder="Tìm kiếm"
                className="w-full rounded-full bg-muted px-4 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-[#00aeec]"
              />
            </div>

            {/* Sort Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <p className="text-xs font-normal text-muted-foreground">Sắp xếp theo</p>
                <span className="text-sm font-semibold text-foreground">{getSortLabel()}</span>
              </div>
              <button
                onClick={() => setSortDrawerOpen(true)}
                className="p-1.5 hover:bg-accent rounded-full transition-colors"
              >
                <Filter className="h-4 w-4 text-foreground" />
              </button>
            </div>

            {/* Following List */}
            {isLoading ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">Đang tải...</p>
              </div>
            ) : following.length > 0 ? (
              <div>
                {following.map((followedUser, index) => {
                  const isLastItem = index === following.length - 1;
                  const followsBack = followerFollowsBack.get(followedUser.id) ?? false;
                  return (
                    <div key={followedUser.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors relative cursor-pointer" onClick={() => router.push(`/channel/${followedUser.username}`)}>
                      {!isLastItem && (
                        <div className="absolute bottom-0 left-[68px] right-0 h-px bg-border/40"></div>
                      )}
                      {followedUser.avatarUrl ? (
                        <img
                          src={followedUser.avatarUrl}
                          alt={followedUser.displayName || followedUser.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#00aeec] flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {(followedUser.displayName || followedUser.username).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {followedUser.displayName || followedUser.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">@{followedUser.username}</p>
                      </div>
                      {!currentUser ? (
                        <span className="text-xs text-muted-foreground">Đăng nhập để quản lý</span>
                      ) : currentUser.id !== followedUser.id ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!followsBack) {
                              (async () => {
                                try {
                                  await apiClient.post(`/users/${followedUser.id}/follow`);
                                  setFollowerFollowsBack(prev => new Map(prev).set(followedUser.id, true));
                                } catch {
                                  console.error('Failed to follow');
                                }
                              })();
                            }
                          }}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                            followsBack
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-[#00aeec] text-white hover:bg-[#00aeec]/90'
                          }`}
                        >
                          {followsBack ? 'Nhắn tin' : 'Theo dõi'}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Chưa theo dõi ai
                </p>
              </div>
            )}
          </div>

          {/* Followers Tab Content */}
          <div
            className="absolute inset-0 overflow-y-auto transition-transform duration-500"
            style={{
              transform: activeTab === 'followers' ? 'translateX(0)' : 'translateX(-100%)',
              transitionTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
            }}
          >
            {/* Search Bar */}
            <div className="sticky top-0 border-b border-border bg-background px-4 py-3">
              <input
                type="text"
                placeholder="Tìm kiếm"
                className="w-full rounded-full bg-muted px-4 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-[#00aeec]"
              />
            </div>

            {/* Sort Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <p className="text-xs font-normal text-muted-foreground">Sắp xếp theo</p>
                <span className="text-sm font-semibold text-foreground">{getSortLabel()}</span>
              </div>
              <button
                onClick={() => setSortDrawerOpen(true)}
                className="p-1.5 hover:bg-accent rounded-full transition-colors"
              >
                <Filter className="h-4 w-4 text-foreground" />
              </button>
            </div>

            {/* Followers List */}
            {isLoading ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">Đang tải...</p>
              </div>
            ) : followers.length > 0 ? (
              <div>
                {followers.map((follower, index) => {
                  const isFollowingBack = followingStatus.get(follower.id) ?? false;
                  const isLastItem = index === followers.length - 1;
                  return (
                    <div key={follower.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors relative cursor-pointer" onClick={() => router.push(`/channel/${follower.username}`)}>
                      {!isLastItem && (
                        <div className="absolute bottom-0 left-[68px] right-0 h-px bg-border/40"></div>
                      )}
                      {follower.avatarUrl ? (
                        <img
                          src={follower.avatarUrl}
                          alt={follower.displayName || follower.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#00aeec] flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {(follower.displayName || follower.username).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {follower.displayName || follower.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">@{follower.username}</p>
                      </div>
                      {!currentUser ? (
                        <span className="text-xs text-muted-foreground">Đăng nhập để theo dõi</span>
                      ) : currentUser.id !== follower.id ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isFollowingBack) {
                              (async () => {
                                try {
                                  await apiClient.post(`/users/${follower.id}/follow`);
                                  setFollowingStatus(prev => new Map(prev).set(follower.id, true));
                                } catch {
                                  console.error('Failed to follow');
                                }
                              })();
                            }
                          }}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                            isFollowingBack
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-[#00aeec] text-white hover:bg-[#00aeec]/90'
                          }`}
                        >
                          {isFollowingBack ? 'Nhắn tin' : 'Theo dõi'}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Chưa có người theo dõi
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sort Bottom Sheet Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          sortDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
        }}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
            sortDrawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
          }}
          onClick={() => setSortDrawerOpen(false)}
        />

        {/* Bottom Sheet */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-lg border border-b-0 border-border shadow-lg transition-transform duration-500 ${
            sortDrawerOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-center py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Sắp xếp theo</h3>
          </div>

          {/* Options */}
          <div className="px-4 py-4 space-y-3">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSortOption(option.id);
                  setSortDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-accent transition-colors"
              >
                {/* Radio button */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  sortOption === option.id
                    ? 'border-[#00aeec] bg-[#00aeec]'
                    : 'border-border'
                }`}>
                  {sortOption === option.id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-foreground">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
