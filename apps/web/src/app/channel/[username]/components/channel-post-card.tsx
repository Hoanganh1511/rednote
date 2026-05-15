'use client';

import Link from 'next/link';
import { Share2, MessageSquareText, ThumbsUp, MoreVertical } from 'lucide-react';
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
  gridMode?: boolean;
  onPostLikeChange?: () => void;
}

export function ChannelPostCard({ post, gridMode = false, onPostLikeChange }: ChannelPostCardProps) {
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
  const author = post.user;
  const display = author?.displayName?.trim() || author?.username || 'Người dùng';
  const timeLabel = formatRelativeTimeVi(post.publishedAt ?? post.createdAt);

  const handleLike = () => {
    if (!accessToken) { toast.message('Đăng nhập để thích bài'); return; }
    toggleLike.mutate(undefined, {
      onSuccess: (data) => {
        setLikedByMe(data.liked);
        setLikeCount(data.likeCount);
        setTimeout(() => { onPostLikeChange?.(); }, 100);
      },
      onError: (err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401) toast.message('Đăng nhập để thích bài');
        else toast.message('Không thực hiện được. Thử lại sau.');
      },
    });
  };

  // ── Grid card (PC) ──────────────────────────────────────────────────────────
  if (gridMode) {
    return (
      <article className="group flex flex-col overflow-hidden rounded-xl bg-background border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
        {/* Thumbnail */}
        <button
          onClick={() => openDrawer(post)}
          className="block w-full overflow-hidden bg-muted"
        >
          {hasImages ? (
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img
                src={post.imageUrls[0]}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="aspect-[4/3] w-full bg-gradient-to-br from-[#00aeec]/10 to-[#00aeec]/5 flex items-center justify-center">
              <span className="text-[#00aeec]/40 text-4xl font-bold select-none">
                {display[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </button>

        {/* Content */}
        <button
          onClick={() => openDrawer(post)}
          className="flex-1 px-3 pt-2.5 pb-1 text-left"
        >
          {post.content && (
            <p className="line-clamp-2 text-[13px] leading-snug text-foreground/85">
              {post.content}
            </p>
          )}
        </button>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <Link
            href={author ? ROUTES.CHANNEL(author.username) : ROUTES.HOME}
            className="flex items-center gap-1.5 min-w-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="flex h-5 w-5 shrink-0 overflow-hidden rounded-full bg-[#00aeec] text-[9px] font-bold text-white">
              {author?.avatarUrl ? (
                <img src={author.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  {display[0]?.toUpperCase()}
                </span>
              )}
            </span>
            <span className="truncate text-[11px] text-muted-foreground">{timeLabel}</span>
          </Link>

          <div className="flex items-center gap-3 shrink-0">
            <button
              aria-pressed={likedByMe}
              disabled={toggleLike.isPending}
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              className={cn(
                'flex items-center gap-1 text-[12px] transition-colors',
                likedByMe ? 'text-[#00aeec]' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.75} fill={likedByMe ? 'currentColor' : 'none'} />
              {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); openDrawer(post, { focusComments: true }); }}
              className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageSquareText className="h-3.5 w-3.5" strokeWidth={1.75} />
              {(post.commentCount ?? 0) > 0 && <span className="tabular-nums">{post.commentCount}</span>}
            </button>
          </div>
        </div>

        <PostLikersDrawer open={likersDrawerOpen} postId={post.id} onClose={() => setLikersDrawerOpen(false)} />
      </article>
    );
  }

  // ── List card (Mobile / no-image) ───────────────────────────────────────────
  if (!hasImages) return <PostFeedCard post={post} />;

  return (
    <article className="border-border/20 bg-background border-b">
      <div className="flex items-center gap-2.5 pt-3 pb-2">
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
          <Link href={author ? ROUTES.CHANNEL(author.username) : ROUTES.HOME} className="text-foreground block truncate text-sm font-semibold hover:text-[#00A1D6]">
            {display}
          </Link>
          <p className="text-muted-foreground text-[11px] leading-tight">{timeLabel}</p>
        </div>
        <button className="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 rounded-full p-1 transition-colors">
          <MoreVertical className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="py-2 pr-3" style={{ paddingLeft: '58px' }}>
        {post.content && (
          <button onClick={() => openDrawer(post)} className="mb-2 block text-left">
            <p className="text-foreground line-clamp-2 text-[13px] leading-snug">{post.content}</p>
          </button>
        )}
        <button onClick={() => openDrawer(post)} className="mt-2 block w-full overflow-hidden rounded-md">
          <PostImageGrid urls={post.imageUrls} />
        </button>
      </div>

      <div className="flex items-center justify-end gap-6 px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-pressed={likedByMe}
            disabled={toggleLike.isPending}
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2 py-1.5 transition-colors',
              likedByMe ? 'text-[#00A1D6]' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              toggleLike.isPending && 'opacity-60',
            )}
          >
            <ThumbsUp className="h-5 w-5" strokeWidth={1.75} fill={likedByMe ? 'currentColor' : 'none'} />
          </button>
          {likeCount > 0 && (
            <button onClick={() => setLikersDrawerOpen(true)} className="text-[13px] font-medium text-[#00A1D6] tabular-nums hover:underline">
              {likeCount}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => openDrawer(post, { focusComments: true })} className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 rounded-full px-2 py-1.5 transition-colors">
            <MessageSquareText className="h-5 w-5" strokeWidth={1.75} />
          </button>
          {(post.commentCount ?? 0) > 0 && <span className="text-[13px] font-medium text-[#00A1D6] tabular-nums">{post.commentCount}</span>}
        </div>
        <button className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 rounded-full px-2 py-1.5 transition-colors">
          <Share2 className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>

      <PostLikersDrawer open={likersDrawerOpen} postId={post.id} onClose={() => setLikersDrawerOpen(false)} />
    </article>
  );
}
