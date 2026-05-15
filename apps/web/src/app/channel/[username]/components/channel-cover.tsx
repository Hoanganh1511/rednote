'use client';

import { Camera } from 'lucide-react';

interface ChannelCoverProps {
  coverUrl?: string | null;
  isOwnProfile?: boolean;
  onCoverSelectClick?: () => void;
}

export function ChannelCover({ coverUrl, isOwnProfile = false, onCoverSelectClick }: ChannelCoverProps) {
  return (
    <div
      className="relative h-52 md:h-64 lg:h-72 w-full overflow-hidden"
      role="img"
      aria-label="Channel cover"
    >
      <div
        className="h-full w-full bg-gradient-to-br from-[#00aeec] via-[#0099d6] to-[#005f8a] transition-all duration-500"
        style={
          coverUrl
            ? { backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        }
      />

      {/* Bottom gradient overlay for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      {isOwnProfile && (
        <button
          onClick={onCoverSelectClick}
          className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg bg-black/40 backdrop-blur-sm px-3 py-2 text-white text-xs font-medium hover:bg-black/55 transition-colors shadow-md"
          aria-label="Đổi ảnh bìa"
        >
          <Camera className="h-3.5 w-3.5" />
          <span>Đổi ảnh bìa</span>
        </button>
      )}
    </div>
  );
}
