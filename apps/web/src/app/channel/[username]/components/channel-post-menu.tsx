'use client';

import { Clock, Share2 } from 'lucide-react';
import type { PostFeedItem } from 'shared-types';

interface ChannelPostMenuProps {
  post: PostFeedItem;
  onClose: () => void;
}

export function ChannelPostMenu({ post, onClose }: ChannelPostMenuProps) {
  const handleAddToWatchLater = () => {
    // TODO: Implement watch later
    onClose();
  };

  const handleShare = () => {
    // TODO: Implement share
    if (navigator.share) {
      navigator.share({
        title: post.content?.substring(0, 100) || 'Post',
        text: post.content || '',
        url: window.location.href,
      });
    }
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
      <button
        onClick={handleAddToWatchLater}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-50 first:rounded-t-lg"
      >
        <Clock className="h-4 w-4" />
        Xem sau
      </button>
      <button
        onClick={handleShare}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-900 hover:bg-slate-50 last:rounded-b-lg"
      >
        <Share2 className="h-4 w-4" />
        Chia sẻ
      </button>
    </div>
  );
}
