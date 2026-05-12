'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { User } from 'shared-types';

interface ChannelBioProps {
  user: User;
}

export function ChannelBio({ user }: ChannelBioProps) {
  const [expanded, setExpanded] = useState(false);
  const displayName = user.displayName || user.username;
  const bio = user.bio;
  const isLong = !!bio && (bio.split('\n').length > 2 || bio.length > 120);

  return (
    <div className="mt-3 mb-4 space-y-2">
      {/* Display name + level badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-xl font-bold leading-tight text-foreground">{displayName}</h1>
        <span className="rounded bg-[#00aeec] px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
          LV0
        </span>
      </div>

      {/* @username */}
      <p className="text-xs text-muted-foreground">@{user.username}</p>

      {/* Bio */}
      {bio && (
        <div>
          <p
            className={`text-sm text-foreground/80 leading-relaxed ${
              expanded ? '' : 'line-clamp-2'
            }`}
          >
            {bio}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-0.5 text-xs font-semibold text-[#00aeec] hover:opacity-75 transition-opacity"
            >
              {expanded ? 'Thu gọn' : 'Chi tiết'}
            </button>
          )}
        </div>
      )}

      {/* IP Location */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0" />
        <span>Vị trí IP: Việt Nam</span>
      </div>
    </div>
  );
}
