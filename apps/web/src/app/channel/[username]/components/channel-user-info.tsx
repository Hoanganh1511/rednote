'use client';

import { useState } from 'react';
import type { User } from 'shared-types';

interface ChannelUserInfoProps {
  user: User;
}

export function ChannelUserInfo({ user }: ChannelUserInfoProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
    // TODO: Call follow API
  };

  return (
    <div className="flex items-end gap-4 -mt-16 relative z-10 mb-6">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
          />
        ) : (
          <div className="h-32 w-32 rounded-full border-4 border-white bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-semibold text-slate-600">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 pb-2">
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-slate-900">
            {user.displayName || user.username}
          </h1>
          <p className="text-sm text-slate-600">@{user.username}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm">
          <div>
            <div className="font-semibold text-slate-900">
              {user.videoCount || 0}
            </div>
            <div className="text-xs text-slate-600">Video</div>
          </div>
          <div>
            <div className="font-semibold text-slate-900">
              {user.followerCount || 0}
            </div>
            <div className="text-xs text-slate-600">Người theo dõi</div>
          </div>
          <div>
            <div className="font-semibold text-slate-900">
              {user.followingCount || 0}
            </div>
            <div className="text-xs text-slate-600">Đang theo dõi</div>
          </div>
        </div>
      </div>

      {/* Follow Button */}
      <div className="flex-shrink-0 pb-2">
        <button
          onClick={handleFollowClick}
          className={`px-6 py-2 rounded-full font-semibold transition-colors ${
            isFollowing
              ? 'bg-slate-200 text-slate-900 hover:bg-slate-300'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
        </button>
      </div>
    </div>
  );
}
