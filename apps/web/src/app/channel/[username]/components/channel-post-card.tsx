'use client';

import Link from 'next/link';
import { Share2, MessageCircle, ThumbsUp, MoreVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { PostFeedItem } from 'shared-types';
import { ROUTES } from '@/constants';
import { usePostDetailDrawerStore } from '@/stores/post-detail-drawer-store';
import { useUserStore } from '@/stores/user-store';
import { useTogglePostLike } from '@/hooks/use-toggle-post-like';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { PostFeedCard } from '@/components/home/post-feed-card';
import { PostImageGrid } from '@/components/home/post-image-grid';
import { formatRelativeTimeVi } from '@/lib/format-relative-time-vi';

interface ChannelPostCardProps {
  post: PostFeedItem;
}

export function ChannelPostCard({ post }: ChannelPostCardProps) {
  const accessToken = useUserStore((s) => s.accessToken);
  const currentUser = useUserStore((s) => s.user);
  const openDrawer = usePostDetailDrawerStore((s) => s.openDrawer);
  const toggleLike = useTogglePostLike(post.id);

  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [likedByMe, setLikedByMe] = useState(post.likedByMe ?? false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(post.isFollowingAuthor ?? false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followDrawerOpen, setFollowDrawerOpen] = useState(false);
  const [followDrawerIn, setFollowDrawerIn] = useState(false);

  useEffect(() => {
    setLikeCount(post.likeCount ?? 0);
    setLikedByMe(post.likedByMe ?? false);
    setIsFollowingAuthor(post.isFollowingAuthor ?? false);
  }, [post.id, post.likeCount, post.likedByMe, post.isFollowingAuthor]);

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

      {/* Content text + Image section (indented) */}
      <div className="pr-3 py-2" style={{ paddingLeft: '58px' }}>
        {/* Content text */}
        {post.content && (
          <button
            onClick={() => openDrawer(post)}
            className="block text-left mb-2"
          >
            <p className="text-[13px] text-foreground leading-snug line-clamp-2">{post.content}</p>
          </button>
        )}

        {/* Image grid */}
        <button
          onClick={() => openDrawer(post)}
          className="block w-full overflow-hidden rounded-md mt-2"
        >
          <PostImageGrid urls={post.imageUrls} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-6 px-3 py-2">
        <button
          type="button"
          aria-pressed={likedByMe}
          aria-label="Thích"
          disabled={toggleLike.isPending}
          onClick={() => {
            if (!accessToken) {
              toast.message('Đăng nhập để thích bài');
              return;
            }
            toggleLike.mutate(undefined, {
              onSuccess: (data) => {
                setLikedByMe(data.liked);
                setLikeCount(data.likeCount);
              },
              onError: (err: unknown) => {
                const status = (err as { response?: { status?: number } })?.response?.status;
                if (status === 401) toast.message('Đăng nhập để thích bài');
                else toast.message('Không thực hiện được. Thử lại sau.');
              },
            });
          }}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2 py-1.5 transition-colors',
            likedByMe ? 'text-[#00A1D6]' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            toggleLike.isPending && 'opacity-60',
          )}
        >
          <ThumbsUp
            className="h-5 w-5"
            strokeWidth={1.75}
            fill={likedByMe ? 'currentColor' : 'none'}
          />
          <span className="text-[13px] font-medium tabular-nums">{likeCount}</span>
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
