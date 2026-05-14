'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Bookmark, MessageCircle, MoreVertical, Share2, ThumbsUp, UserX } from 'lucide-react';
import { FaMars, FaVenus } from 'react-icons/fa';
import { toast } from 'sonner';
import type { PostFeedItem } from 'shared-types';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';
import { useTogglePostLike } from '@/hooks/use-toggle-post-like';
import { usePostDetailDrawerStore } from '@/stores/post-detail-drawer-store';
import { useUserStore } from '@/stores/user-store';
import { apiClient } from '@/lib/api-client';
import {
  HASHTAG_TEXT_CLASS,
  splitForHashtagHighlight,
} from '@/components/upload/hashtag-highlight';
import { formatRelativeTimeVi } from '@/lib/format-relative-time-vi';
import { PostImageGrid } from '@/components/home/post-image-grid';
import { ComingSoonBadge } from '@/components/ui/coming-soon-badge';
import { PostLikersDrawer } from '@/app/channel/[username]/components/post-likers-drawer';

type PostFeedCardProps = {
  post: PostFeedItem;
  priority?: boolean;
  className?: string;
};

function PostTextWithHashtags({ text, className }: { text: string; className?: string }) {
  const tokens = useMemo(() => splitForHashtagHighlight(text), [text]);
  return (
    <p
      className={cn(
        'text-foreground text-[13px] leading-snug break-words whitespace-pre-wrap',
        className,
      )}
    >
      {tokens.map((tok, i) =>
        tok.type === 'hashtag' ? (
          <span key={`h-${i}`} className={HASHTAG_TEXT_CLASS}>
            {tok.text}
          </span>
        ) : (
          <span key={`t-${i}`}>{tok.text}</span>
        ),
      )}
    </p>
  );
}

export function PostFeedCard({ post, priority = false, className }: PostFeedCardProps) {
  const accessToken = useUserStore((s) => s.accessToken);
  const currentUser = useUserStore((s) => s.user);
  const openDrawer = usePostDetailDrawerStore((s) => s.openDrawer);
  const drawerPost = usePostDetailDrawerStore((s) => s.post);
  const patchDrawerPost = usePostDetailDrawerStore((s) => s.patchDrawerPost);
  const toggleLike = useTogglePostLike(post.id);

  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [likedByMe, setLikedByMe] = useState(post.likedByMe ?? false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(post.isFollowingAuthor ?? false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followDrawerOpen, setFollowDrawerOpen] = useState(false);
  const [followDrawerIn, setFollowDrawerIn] = useState(false);
  const [likersDrawerOpen, setLikersDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLikeCount(post.likeCount ?? 0);
    setLikedByMe(post.likedByMe ?? false);
    setIsFollowingAuthor(post.isFollowingAuthor ?? false);
  }, [post.id, post.likeCount, post.likedByMe, post.isFollowingAuthor]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const author = post.user;
  const display = author?.displayName?.trim() || author?.username || 'Người dùng';
  const initial = display[0]?.toUpperCase() ?? '?';
  const hasPdf = (post.attachmentUrls?.length ?? 0) > 0;
  const hasImages = post.imageUrls.length > 0;
  const timeLabel = formatRelativeTimeVi(post.publishedAt ?? post.createdAt);
  const commentCount = post.commentCount ?? 0;

  return (
    <article
      className={cn(
        'border-border/20 bg-background text-card-foreground flex flex-col border-b',
        'max-sm:rounded-none max-sm:border-x-0 max-sm:shadow-none',
        'sm:overflow-hidden sm:rounded-lg sm:shadow-none',
        className,
      )}
    >
      {/* Header: avatar + LV + tên + thời gian | Theo dõi + ⋮ */}
      <div className="flex items-start gap-3 px-3 pt-2.5 sm:gap-3.5 sm:px-3 sm:pt-3">
        <Link
          href={author ? ROUTES.CHANNEL(author.username) : ROUTES.HOME}
          className="relative shrink-0"
          aria-label={`Trang ${display}`}
        >
          <span className="ring-background relative flex h-9 w-9 overflow-hidden rounded-full bg-[#00A1D6] text-xs font-semibold text-white ring-2">
            {author?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={author.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center">{initial}</span>
            )}
          </span>
          {author?.gender && (
            <span
              className="ring-background absolute left-1/2 -bottom-1 flex -translate-x-1/2 items-center gap-0.5 rounded-full px-1.5 py-0.5 shadow-sm"
              style={{
                background: author.gender === 'male' ? '#0084FF' : '#FF1493',
              }}
              aria-hidden
            >
              {author.gender === 'male' ? (
                <FaMars className="h-2.5 w-2.5 text-white flex-shrink-0" />
              ) : (
                <FaVenus className="h-2.5 w-2.5 text-white flex-shrink-0" />
              )}
              {author.age && <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'white', lineHeight: '1', display: 'flex', alignItems: 'center' }}>{author.age}</span>}
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1 space-y-0.5 pt-0.5">
          <Link
            href={author ? ROUTES.CHANNEL(author.username) : ROUTES.HOME}
            className="text-foreground block truncate text-sm font-semibold hover:text-[#00A1D6]"
          >
            {display}
          </Link>
          <p className="text-muted-foreground text-[11px] leading-snug">{timeLabel}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          {currentUser?.id !== post.userId && (
            <button
              type="button"
              disabled={isFollowLoading}
              onClick={async () => {
                if (!accessToken) {
                  toast.message('Đăng nhập để theo dõi');
                  return;
                }
                if (isFollowingAuthor) {
                  setFollowDrawerOpen(true);
                  requestAnimationFrame(() => setFollowDrawerIn(true));
                } else {
                  setIsFollowLoading(true);
                  try {
                    await apiClient.post(`/users/${post.userId}/follow`);
                    setIsFollowingAuthor(true);
                    // Notify other components to refetch user data
                    window.dispatchEvent(new CustomEvent('userFollowed', { detail: { userId: post.userId } }));
                  } catch {
                    toast.message('Không thực hiện được. Thử lại sau.');
                  } finally {
                    setIsFollowLoading(false);
                  }
                }
              }}
              className={cn(
                'flex items-center justify-center rounded-full px-2 py-1 text-[11px] font-semibold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60',
                isFollowingAuthor
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-[#00A1D6] text-white'
              )}
            >
              {isFollowingAuthor ? 'Đang theo dõi' : 'Theo dõi'}
            </button>
          )}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="Thêm tùy chọn"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full p-1 transition-colors"
            >
              <MoreVertical className="h-4 w-4" strokeWidth={2} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-background shadow-lg z-50">
                <button
                  type="button"
                  onClick={() => {
                    toast.message('Yêu thích — sắp có');
                    setMenuOpen(false);
                  }}
                  className="relative flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs text-foreground hover:bg-muted transition-colors first:rounded-t-lg"
                >
                  <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Yêu thích</span>
                  <ComingSoonBadge />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.message('Báo cáo — sắp có');
                    setMenuOpen(false);
                  }}
                  className="relative flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs text-foreground hover:bg-muted transition-colors last:rounded-b-lg border-t border-border"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Báo cáo</span>
                  <ComingSoonBadge />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nội dung: thụt lề thẳng hàng với tên (spacer = chiều rộng avatar) */}
      <div className="flex gap-3 px-3 pt-2 pr-[22px] pb-1 sm:gap-3.5 sm:pt-2 sm:pr-[22px] sm:pb-1.5">
        <div className="w-9 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <button type="button" className="block text-left w-full" onClick={() => openDrawer(post)}>
            <PostTextWithHashtags text={post.content} className="line-clamp-3" />
          </button>

          {hasImages && (
            <button
              type="button"
              className="mt-2 block overflow-hidden rounded-xl w-full text-left"
              title="Xem bài đăng"
              onClick={() => openDrawer(post)}
            >
              <PostImageGrid urls={post.imageUrls} priority={priority} />
            </button>
          )}
          {!hasImages && hasPdf && (
            <button type="button" className="mt-2 block w-full text-left" title="Xem bài đăng" onClick={() => openDrawer(post)}>
              <div className="border-border bg-muted/40 text-muted-foreground flex items-center justify-center rounded-xl border border-dashed py-5 text-xs">
                Bài có file PDF — xem chi tiết
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Thanh tương tác */}
      <div className="flex items-center justify-end gap-6 px-3 pt-2 pb-2.5 sm:gap-7 sm:px-4 sm:pb-3">
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
                    if (drawerPost?.id === post.id) {
                      patchDrawerPost({ likedByMe: data.liked, likeCount: data.likeCount });
                    }
                  },
                  onError: (err: unknown) => {
                    const status = (err as { response?: { status?: number } })?.response?.status;
                    if (status === 401) toast.message('Đăng nhập để thích bài');
                    else toast.message('Không thực hiện được. Thử lại sau.');
                  },
                });
              }}
              className={cn(
                'hover:bg-muted flex items-center gap-1.5 rounded-full px-2 py-1.5 transition-colors',
                likedByMe ? 'text-[#00A1D6]' : 'text-muted-foreground hover:text-foreground',
                toggleLike.isPending && 'opacity-60',
              )}
            >
              <ThumbsUp
                className="h-5 w-5"
                strokeWidth={1.75}
                fill={likedByMe ? 'currentColor' : 'none'}
              />
            </button>
            {likeCount > 0 && (
              <button
                onClick={() => setLikersDrawerOpen(true)}
                className="text-[13px] font-medium text-[#00A1D6] tabular-nums hover:underline"
              >
                {likeCount}
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label={`Bình luận (${commentCount})`}
            onClick={() => openDrawer(post, { focusComments: true })}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 rounded-full px-2 py-1.5 transition-colors"
          >
            <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
            {commentCount > 0 && (
              <span className="text-[13px] font-medium text-[#00A1D6] tabular-nums">{commentCount}</span>
            )}
          </button>
          <button
            type="button"
            aria-label="Chia sẻ"
            onClick={() => toast.message('Chia sẻ — sắp có')}
            className="relative text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 rounded-full px-2 py-1.5 transition-colors"
          >
            <Share2 className="h-5 w-5" strokeWidth={1.75} />
            <ComingSoonBadge />
          </button>
      </div>

      {/* Follow drawer */}
      {followDrawerOpen && (
        <>
          <div
            className={cn(
              'fixed inset-0 bg-black/50 transition-opacity duration-300 z-[999]',
              followDrawerIn ? 'opacity-100' : 'opacity-0',
            )}
            onClick={() => {
              setFollowDrawerIn(false);
              setTimeout(() => setFollowDrawerOpen(false), 300);
            }}
          />
          <div
            className={cn(
              'fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-lg z-[1000] transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]',
              followDrawerIn ? 'translate-y-0' : 'translate-y-full',
            )}
          >
            <div className="p-4">
              <button
                type="button"
                disabled={isFollowLoading}
                onClick={async () => {
                  setIsFollowLoading(true);
                  try {
                    await apiClient.delete(`/users/${post.userId}/follow`);
                    setIsFollowingAuthor(false);
                    setFollowDrawerIn(false);
                    setTimeout(() => setFollowDrawerOpen(false), 300);
                    // Notify other components to refetch user data
                    window.dispatchEvent(new CustomEvent('userUnfollowed', { detail: { userId: post.userId } }));
                  } catch {
                    toast.message('Không thực hiện được. Thử lại sau.');
                  } finally {
                    setIsFollowLoading(false);
                  }
                }}
                className={cn(
                  'flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-60',
                )}
              >
                <UserX className="h-4 w-4" />
                <span>Bỏ theo dõi</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Likers drawer */}
      <PostLikersDrawer
        open={likersDrawerOpen}
        postId={post.id}
        onClose={() => setLikersDrawerOpen(false)}
      />
    </article>
  );
}
