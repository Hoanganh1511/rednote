'use client';

import Link from 'next/link';
import { Share2, MessageCircle, ThumbsUp, MoreVertical } from 'lucide-react';
import type { PostFeedItem } from 'shared-types';
import { ROUTES } from '@/constants';
import { usePostDetailDrawerStore } from '@/stores/post-detail-drawer-store';
import { PostFeedCard } from '@/components/home/post-feed-card';
import { PostImageGrid } from '@/components/home/post-image-grid';
import { formatRelativeTimeVi } from '@/lib/format-relative-time-vi';

interface ChannelPostCardProps {
  post: PostFeedItem;
}

export function ChannelPostCard({ post }: ChannelPostCardProps) {
  const openDrawer = usePostDetailDrawerStore((s) => s.openDrawer);
  const hasImages = post.imageUrls.length > 0;

  // No images → reuse the Home feed card as-is
  if (!hasImages) {
    return <PostFeedCard post={post} />;
  }

  // Has images → channel-style layout: author + image grid + title + actions
  const author = post.user;
  const display = author?.displayName?.trim() || author?.username || 'Người dùng';
  const timeLabel = formatRelativeTimeVi(post.publishedAt ?? post.createdAt);

  return (
    <article className="border-b border-border/60 bg-background">
      {/* Author row */}
      <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
        <Link
          href={author ? ROUTES.CHANNEL(author.username) : ROUTES.HOME}
          className="shrink-0"
        >
          <span className="flex h-9 w-9 overflow-hidden rounded-full bg-[#00A1D6] text-xs font-semibold text-white ring-2 ring-background">
            {author?.avatarUrl ? (
              <img src={author.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                {display[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </span>
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            href={author ? ROUTES.CHANNEL(author.username) : ROUTES.HOME}
            className="block truncate text-sm font-semibold text-foreground hover:text-[#00A1D6]"
          >
            {display}
          </Link>
          <p className="text-[11px] text-muted-foreground leading-tight">{timeLabel}</p>
        </div>

        <button className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
          <MoreVertical className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Image grid */}
      <button
        onClick={() => openDrawer(post)}
        className="block w-full overflow-hidden text-left"
      >
        <PostImageGrid urls={post.imageUrls} />
      </button>

      {/* Title */}
      {post.content && (
        <button
          onClick={() => openDrawer(post)}
          className="w-full px-3 pt-2 pb-1 text-left"
        >
          <p className="text-[13px] text-foreground leading-snug line-clamp-2">{post.content}</p>
        </button>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-6 px-3 pt-1.5 pb-2.5">
        <button
          onClick={() => openDrawer(post)}
          className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ThumbsUp className="h-5 w-5" strokeWidth={1.75} />
          <span className="text-[13px] font-medium tabular-nums">{post.likeCount ?? 0}</span>
        </button>
        <button
          onClick={() => openDrawer(post, { focusComments: true })}
          className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
          <span className="text-[13px] font-medium tabular-nums">{post.commentCount ?? 0}</span>
        </button>
        <button className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Share2 className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
    </article>
  );
}
