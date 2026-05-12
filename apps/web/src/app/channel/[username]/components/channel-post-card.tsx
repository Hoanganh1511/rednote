'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { PostFeedItem } from 'shared-types';
import { ROUTES } from '@/constants';
import { usePostDetailDrawerStore } from '@/stores/post-detail-drawer-store';
import { ChannelPostMenu } from './channel-post-menu';

interface ChannelPostCardProps {
  post: PostFeedItem;
}

export function ChannelPostCard({ post }: ChannelPostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const openDrawer = usePostDetailDrawerStore((s) => s.openDrawer);

  const thumbnail = post.imageUrls?.[0] || post.attachmentUrls?.[0];
  const hasContent = (post.content?.trim?.() ?? '').length > 0;

  const handleCardClick = () => {
    openDrawer(post);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-sm transition-shadow">
      {post.user && (
        <div className="flex gap-3 mb-3">
          {/* Author Avatar */}
          <Link href={ROUTES.CHANNEL(post.user.username)} className="flex-shrink-0">
            {post.user.avatarUrl ? (
              <img
                src={post.user.avatarUrl}
                alt={post.user.username}
                className="h-8 w-8 rounded-full object-cover hover:opacity-75 transition-opacity"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-xs font-semibold text-slate-600 hover:opacity-75 transition-opacity">
                {post.user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              href={ROUTES.CHANNEL(post.user.username)}
              className="text-xs font-semibold text-slate-900 hover:text-red-500"
            >
              {post.user.displayName || post.user.username}
            </Link>
            <p className="text-xs text-slate-500">@{post.user.username}</p>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {/* Thumbnail */}
        {thumbnail && (
          <button
            onClick={handleCardClick}
            className="flex-shrink-0 h-24 w-24 rounded-lg bg-slate-100 overflow-hidden hover:opacity-75 transition-opacity"
          >
            <img
              src={thumbnail}
              alt="Post thumbnail"
              className="h-full w-full object-cover"
            />
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {hasContent && (
            <button
              onClick={handleCardClick}
              className="block text-sm text-slate-900 font-medium line-clamp-2 hover:text-slate-700 text-left"
            >
              {post.content}
            </button>
          )}

          {/* Stats */}
          <div className="mt-3 flex gap-4 text-xs text-slate-600">
            {(post.likeCount ?? 0) > 0 && <span>{post.likeCount} thích</span>}
            {(post.commentCount ?? 0) > 0 && <span>{post.commentCount} bình luận</span>}
          </div>

          {/* Menu */}
          <div className="mt-3 flex justify-between items-center">
            <button
              onClick={handleCardClick}
              className="text-xs font-semibold text-red-500 hover:text-red-600"
            >
              Xem chi tiết ▸
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
                aria-label="Post menu"
              >
                <MoreHorizontal className="h-4 w-4 text-slate-600" />
              </button>
              {menuOpen && (
                <ChannelPostMenu post={post} onClose={() => setMenuOpen(false)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
