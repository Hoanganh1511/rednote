'use client';

import { useState } from 'react';

interface ChannelBioProps {
  bio?: string | null;
}

export function ChannelBio({ bio }: ChannelBioProps) {
  const [expanded, setExpanded] = useState(false);

  if (!bio) return null;

  const isLong = bio.split('\n').length > 2 || bio.length > 150;

  return (
    <div className="mb-6">
      <p
        className={`text-sm text-slate-700 transition-all duration-300 ${
          expanded ? 'line-clamp-none' : 'line-clamp-2'
        }`}
      >
        {bio}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs font-semibold text-red-500 hover:text-red-600"
        >
          {expanded ? 'Ẩn bớt' : 'Xem thêm'}
        </button>
      )}
    </div>
  );
}
