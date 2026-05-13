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
import { cn } from '@/lib/utils';
import { PostFeedCard } from '@/components/home/post-feed-card';
import { PostImageGrid } from '@/components/home/post-image-grid';
import { formatRelativeTimeVi } from '@/lib/format-relative-time-vi';
import { PostLikersDrawer } from './post-likers-drawer';

interface ChannelPostCardProps {
  post: PostFeedItem;
  onPostLikeChange?: () => void; // Callback to refetch author stats when post is liked
}

export function ChannelPostCard({ post, onPostLikeChange }: ChannelPostCardProps) {
  const accessToken = useUserStore((s) => s.accessToken);
  const openDrawer = usePostDetailDrawerStore((s) => s.openDrawer);
  const toggleLike = useTogglePostLike(post.id);

  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [likedByMe, setLikedByMe] = useState(post.likedByMe ?? false);
  const [likersDrawerOpen, setLikersDrawerOpen] = useState(false);

  useEffect(() => {
    setLikeCount(post.likeCount ?? 0);
    setLikedByMe(post.likedByMe ?? false);
  }, [post.id, post.likeCount, post.likedByMe]);

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
    <article className="border-border/60 bg-background border-b">
      {/* Author row */}
      <div className="flex items-center gap-2.5 px-3 pb-2 pt-3">
        <Link href={author ? ROUTES.CHANNEL(author.username) : ROUTES.HOME} className="shrink-0">
          <span className="ring-background flex h-9 w-9 overflow-hidden rounded-full bg-[#00A1D6] text-xs font-semibold text-white ring-2">
            {author?.avatarUrl ? (
              <img src={author.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                {display[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </span>
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={author ? ROUTES.CHANNEL(author.username) : ROUTES.HOME}
            className="text-foreground block truncate text-sm font-semibold hover:text-[#00A1D6]"
          >
            {display}
          </Link>
          <p className="text-muted-foreground text-[11px] leading-tight">{timeLabel}</p>
        </div>

        <button className="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 rounded-full p-1 transition-colors">
          <MoreVertical className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Content text + Image section (indented) */}
      <div className="py-2 pr-3" style={{ paddingLeft: '58px' }}>
        {/* Content text */}
        {post.content && (
          <button onClick={() => openDrawer(post)} className="mb-2 block text-left">
            <p className="text-foreground line-clamp-2 text-[13px] leading-snug">{post.content}</p>
          </button>
        )}

        {/* Image grid */}
        <button
          onClick={() => openDrawer(post)}
          className="mt-2 block w-full overflow-hidden rounded-md"
        >
          <PostImageGrid urls={post.imageUrls} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-6 px-3 py-2">
        {/* Like button + count */}
        <div className="flex items-center gap-1">
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
                  // Notify parent to refetch author data (totalLikesReceived)
                  setTimeout(() => {
                    onPostLikeChange?.();
                  }, 100);
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
              likedByMe
                ? 'text-[#00A1D6]'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              toggleLike.isPending && 'opacity-60',
            )}
          >
            <ThumbsUp
              className="h-5 w-5"
              strokeWidth={1.75}
              fill={likedByMe ? 'currentColor' : 'none'}
            />
          </button>
          <button
            onClick={() => likeCount > 0 && setLikersDrawerOpen(true)}
            disabled={likeCount === 0}
            className="text-[13px] font-medium tabular-nums text-[#00A1D6] hover:underline disabled:opacity-50 disabled:hover:no-underline"
          >
            {likeCount}
          </button>
          <button
            onClick={() => likeCount > 0 && setLikersDrawerOpen(true)}
            disabled={likeCount === 0}
            className="text-[13px] font-medium tabular-nums text-[#00A1D6] hover:underline disabled:opacity-50 disabled:hover:no-underline"
          >
            {likeCount}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => openDrawer(post, { focusComments: true })}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 rounded-full px-2 py-1.5 transition-colors"
          >
            <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <span className="text-[13px] font-medium tabular-nums text-muted-foreground">{post.commentCount ?? 0}</span>
        </div>
        <button className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 rounded-full px-2 py-1.5 transition-colors">
          <Share2 className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Likers drawer */}
      <PostLikersDrawer
        open={likersDrawerOpen}
        postId={post.id}
        onClose={() => setLikersDrawerOpen(false)}
      />
    </article>
  );
}
