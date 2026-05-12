/**
 * Chi tiết post (mobile-first, giống Bilibili).
 *
 * Trang đầy đủ: `/posts/[id]` (+ hash `#comments` để nhảy xuống bình luận).
 * Ngăn kéo phải: `PostDetailDrawerShell` + `variant="drawer"` (mở từ feed, không đổi URL).
 */
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  Bookmark,
  ChevronLeft,
  Loader2,
  MessageCircle,
  MoreVertical,
  Search,
  Send,
  Share2,
  ThumbsUp,
} from 'lucide-react';
import { FaMars, FaVenus } from 'react-icons/fa';
import { toast } from 'sonner';
import type { PostFeedItem } from 'shared-types';
import { apiClient } from '@/lib/api-client';
import { ROUTES } from '@/constants';
import { useTogglePostLike } from '@/hooks/use-toggle-post-like';
import { usePostDetailDrawerStore } from '@/stores/post-detail-drawer-store';
import { useUserStore } from '@/stores/user-store';
import { cn } from '@/lib/utils';
import { HASHTAG_TEXT_CLASS, splitForHashtagHighlight } from '@/components/upload/hashtag-highlight';
import { formatRelativeTimeVi } from '@/lib/format-relative-time-vi';
import { ComingSoonBadge } from '@/components/ui/coming-soon-badge';
import { PostImageGrid } from '@/components/home/post-image-grid';

type PostCommentsResponse = { items: unknown[]; total: number };

export type PostDetailViewProps = {
  post: PostFeedItem;
  variant?: 'page' | 'drawer';
  /** Drawer: cuộn tới bình luận sau khi mở. */
  focusComments?: boolean;
  /** Drawer: panel đã trượt xong — căn cuộn theo khung ngăn kéo. */
  drawerPanelEntered?: boolean;
  onCloseDrawer?: () => void;
};

function PostTextWithHashtags({ text, className }: { text: string; className?: string }) {
  const tokens = useMemo(() => splitForHashtagHighlight(text), [text]);
  return (
    <p className={cn('whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground', className)}>
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

function CommentsEmptyIllustration() {
  return (
    <div className="flex flex-col items-center pt-1">
      <div className="relative flex h-28 w-36 items-end justify-center" aria-hidden>
        <div className="absolute bottom-0 left-1/2 h-14 w-20 -translate-x-1/2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/40" />
        <div className="relative z-[1] flex h-16 w-14 flex-col items-center justify-end rounded-t-lg bg-[#00A1D6]/15 pb-1.5">
          <div className="mb-1 flex h-8 w-10 items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-border">
            <div className="h-4 w-6 rounded-sm bg-muted" />
          </div>
          <div className="h-1.5 w-8 rounded-full bg-[#00A1D6]/40" />
        </div>
        <div className="absolute right-4 bottom-6 z-[2] flex h-7 w-7 items-center justify-center rounded-full bg-white shadow ring-1 ring-border">
          <Search className="h-3.5 w-3.5 text-[#00A1D6]" strokeWidth={2} />
        </div>
      </div>
      <p className="mt-5 max-w-xs text-center text-sm leading-relaxed text-muted-foreground">
        Chưa có bình luận nào. Hãy là người đầu tiên
      </p>
    </div>
  );
}

function ScrollMaybe({
  variant,
  children,
}: {
  variant: 'page' | 'drawer';
  children: ReactNode;
}) {
  if (variant !== 'drawer') return <>{children}</>;
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
        data-post-drawer-scroll
      >
        {children}
      </div>
    </div>
  );
}

export function PostDetailView({
  post,
  variant = 'page',
  focusComments = false,
  drawerPanelEntered = false,
  onCloseDrawer,
}: PostDetailViewProps) {
  const accessToken = useUserStore((s) => s.accessToken);
  const currentUser = useUserStore((s) => s.user);
  const patchDrawerPost = usePostDetailDrawerStore((s) => s.patchDrawerPost);
  const toggleLike = useTogglePostLike(post.id);

  const author = post.user;
  const display = author?.displayName?.trim() || author?.username || 'Người dùng';
  const initial = display[0]?.toUpperCase() ?? '?';
  const timeLabel = formatRelativeTimeVi(post.publishedAt ?? post.createdAt);
  const [commentsTotal, setCommentsTotal] = useState<number | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [likedByMe, setLikedByMe] = useState(post.likedByMe ?? false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentInputOpen, setCommentInputOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLikeCount(post.likeCount ?? 0);
    setLikedByMe(post.likedByMe ?? false);
  }, [post.id, post.likeCount, post.likedByMe]);

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

  const [hashComments, setHashComments] = useState(false);
  useEffect(() => {
    if (variant !== 'page') return;
    setHashComments(window.location.hash === '#comments');
    const onHash = () => setHashComments(window.location.hash === '#comments');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [variant]);

  const scrollCommentsSectionIntoView = useCallback(() => {
    if (!commentsLoading && commentsTotal !== null && commentsTotal === 0) return;
    const el = document.getElementById('post-comments');
    if (!el) return;
    if (variant === 'drawer') {
      const scrollRoot = el.closest('[data-post-drawer-scroll]');
      if (!(scrollRoot instanceof HTMLElement)) return;
      const sr = scrollRoot.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      scrollRoot.scrollTop += er.top - sr.top;
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [variant, commentsLoading, commentsTotal]);

  useLayoutEffect(() => {
    if (variant !== 'drawer' || !focusComments || !drawerPanelEntered) return;
    if (commentsLoading || commentsTotal === null) return;
    if (commentsTotal === 0) return;
    scrollCommentsSectionIntoView();
  }, [
    variant,
    focusComments,
    drawerPanelEntered,
    commentsLoading,
    commentsTotal,
    scrollCommentsSectionIntoView,
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCommentsLoading(true);
      setCommentsTotal(null);
      try {
        const res = await apiClient.get<PostCommentsResponse>(`/posts/${post.id}/comments`);
        const data = res.data;
        if (!cancelled) setCommentsTotal(data.total);
      } catch {
        if (!cancelled) setCommentsTotal(0);
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [post.id]);

  useEffect(() => {
    if (variant !== 'page' || !hashComments) return;
    if (commentsLoading || commentsTotal === null) return;
    if (commentsTotal === 0) return;
    const t = window.setTimeout(() => scrollCommentsSectionIntoView(), 80);
    return () => clearTimeout(t);
  }, [variant, hashComments, commentsLoading, commentsTotal, scrollCommentsSectionIntoView]);

  return (
    <div
      className={cn(
        'mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-3xl',
        variant === 'page' && 'pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-8',
        variant === 'drawer' && 'flex h-full min-h-0 flex-1 flex-col overflow-hidden',
      )}
    >
      {/* Thanh Chi tiết — drawer: mọi breakpoint; page: chỉ mobile */}
      <div
        className={cn(
          'sticky top-0 z-30 flex shrink-0 items-center gap-3 bg-white py-3 shadow-none',
          variant === 'page' && 'md:hidden',
        )}
      >
        {variant === 'drawer' ? (
          <button
            type="button"
            onClick={() => onCloseDrawer?.()}
            className="rounded-full p-1.5 text-foreground outline-none transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A1D6]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Đóng"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2} />
          </button>
        ) : (
          <Link
            href={ROUTES.HOME}
            className="rounded-full p-1.5 text-foreground transition-colors hover:bg-muted"
            aria-label="Quay lại"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2} />
          </Link>
        )}
        <h1 className="flex-1 text-center text-base font-semibold">Chi tiết</h1>
        <span className="w-9 shrink-0" aria-hidden />
      </div>

      <ScrollMaybe variant={variant}>
        <article className="space-y-0 px-0 pt-2 md:pt-4">
        {variant === 'page' ? (
          <nav className="hidden px-1 text-sm text-muted-foreground md:block">
            <Link href={ROUTES.HOME} className="hover:text-foreground">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Bài đăng</span>
          </nav>
        ) : null}

        <div
          className={cn(
            'max-h-[50svh] min-h-0 overflow-y-auto overscroll-y-contain md:max-h-[min(50svh,520px)]',
            variant === 'page' && 'md:max-h-none md:overflow-visible',
          )}
        >
        <div
          className={cn(
            'flex items-start gap-4 px-3 py-4 md:gap-4 md:px-1',
            variant === 'page' && 'border-b border-border',
          )}
        >
          <Link
            href={author ? ROUTES.CHANNEL(author.username) : ROUTES.HOME}
            className="relative shrink-0"
            aria-label={display}
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
          <div className="min-w-0 flex-1 space-y-1 pt-0.5">
            <Link
              href={author ? ROUTES.CHANNEL(author.username) : ROUTES.HOME}
              className="line-clamp-2 text-[15px] font-semibold text-foreground hover:text-[#00A1D6]"
            >
              {display}
            </Link>
            <p className="text-xs text-muted-foreground">{timeLabel}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {currentUser?.id !== post.userId && (
              <button
                type="button"
                onClick={() => toast.message('Theo dõi — sắp có')}
                className="relative rounded-full bg-[#00A1D6] px-3 py-1 text-xs font-semibold text-white"
              >
                Theo dõi
                <ComingSoonBadge />
              </button>
            )}
            <div ref={menuRef} className="relative">
              <button
                type="button"
                aria-label="Thêm"
                onClick={() => setMenuOpen(!menuOpen)}
                className="relative rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-background shadow-lg z-50">
                  <button
                    type="button"
                    onClick={() => {
                      toast.message('Yêu thích — sắp có');
                      setMenuOpen(false);
                    }}
                    className="relative flex w-full items-center gap-3 px-4 py-3.5 text-sm text-foreground hover:bg-muted transition-colors first:rounded-t-lg"
                  >
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                    <span>Yêu thích</span>
                    <ComingSoonBadge />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toast.message('Báo cáo — sắp có');
                      setMenuOpen(false);
                    }}
                    className="relative flex w-full items-center gap-3 px-4 py-3.5 text-sm text-foreground hover:bg-muted transition-colors last:rounded-b-lg border-t border-border"
                  >
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span>Báo cáo</span>
                    <ComingSoonBadge />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-3 py-4 md:px-1">
          <PostTextWithHashtags text={post.content} />
        </div>

        {post.imageUrls.length > 0 ? (
          variant === 'drawer' ? (
            <div className="px-3 overflow-x-auto">
              <div className="flex gap-2 min-w-min">
                {post.imageUrls.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="h-[280px] w-[280px] shrink-0 rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className={cn('px-3 md:px-1', variant === 'page' && 'mx-auto max-w-md')}>
              <PostImageGrid urls={post.imageUrls} />
            </div>
          )
        ) : null}
        </div>

        {post.locationText ? (
          <p className="px-3 text-sm text-muted-foreground md:px-1">
            <span className="font-medium text-foreground">Địa điểm:</span> {post.locationText}
          </p>
        ) : null}

        {(post.attachmentUrls?.length ?? 0) > 0 ? (
          <div className="mx-3 rounded-xl border border-border bg-muted/30 p-4 text-sm md:mx-1">
            <p className="font-medium">File đính kèm</p>
            <ul className="mt-2 space-y-1">
              {post.attachmentUrls!.map((url) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#00A1D6] hover:underline">
                    Mở PDF
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}


        {/* Bình luận */}
        <section
          id="post-comments"
          className={cn(
            'scroll-mt-24 px-3 md:scroll-mt-28 md:px-1',
            variant === 'drawer' ? 'border-t-0 pt-3' : 'border-t border-border pt-4',
          )}
          aria-labelledby="comments-heading"
        >
          <h2 id="comments-heading" className="text-sm font-semibold text-foreground">
            Bình luận {commentsLoading ? '…' : commentsTotal ?? 0}
          </h2>

          <div
            className={cn(
              'flex min-h-[12rem] flex-col py-2',
              commentsLoading ? 'justify-center' : 'justify-start',
            )}
          >
            {commentsLoading ? (
              <div className="flex flex-col items-center justify-center py-16" aria-live="polite" aria-busy="true">
                <Loader2 className="h-10 w-10 animate-spin text-[#00A1D6]" strokeWidth={2} aria-label="Đang tải" />
                <p className="mt-3 text-xs text-muted-foreground">Đang tải bình luận…</p>
              </div>
            ) : (
              <CommentsEmptyIllustration />
            )}
          </div>
        </section>
        </article>
      </ScrollMaybe>

      {variant === 'drawer' ? (
        <div className="shrink-0 bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-none">
          {!commentInputOpen ? (
            <div className="flex items-center gap-2 px-3">
              <button
                type="button"
                onClick={() => setCommentInputOpen(true)}
                className="min-w-0 flex-1 rounded-full border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground text-left outline-none hover:bg-muted transition-colors"
              >
                Nói gì đó...
              </button>
              <button
                type="button"
                className={cn(
                  'flex shrink-0 items-center justify-center rounded-full p-2 transition-colors',
                  likedByMe ? 'text-[#00A1D6]' : 'text-muted-foreground hover:text-foreground',
                  toggleLike.isPending && 'opacity-60',
                )}
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
                      patchDrawerPost({ likedByMe: data.liked, likeCount: data.likeCount });
                    },
                    onError: (err: unknown) => {
                      const status = (err as { response?: { status?: number } })?.response?.status;
                      if (status === 401) toast.message('Đăng nhập để thích bài');
                      else toast.message('Không thực hiện được. Thử lại sau.');
                    },
                  });
                }}
              >
                <ThumbsUp className="h-5 w-5" strokeWidth={1.75} fill={likedByMe ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                className="flex shrink-0 items-center justify-center rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Bình luận"
                onClick={() => scrollCommentsSectionIntoView()}
              >
                <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                className="relative flex shrink-0 items-center justify-center rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Chia sẻ"
                onClick={() => toast.message('Chia sẻ — sắp có')}
              >
                <Share2 className="h-5 w-5" strokeWidth={1.75} />
                <ComingSoonBadge />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3">
              <input
                type="text"
                readOnly
                placeholder="Nói gì đó..."
                onFocus={() => toast.message('Gửi bình luận — sắp có')}
                className="min-w-0 flex-1 rounded-full border border-border bg-muted/50 px-4 py-2.5 text-sm outline-none focus-visible:border-[#00A1D6] focus-visible:ring-2 focus-visible:ring-[#00A1D6]/25"
              />
              <button
                type="button"
                className="relative flex shrink-0 items-center justify-center rounded-full bg-[#00A1D6] px-3 py-3 text-white transition-opacity hover:opacity-90 active:opacity-80"
                aria-label="Gửi"
                onClick={() => {
                  toast.message('Gửi bình luận — sắp có');
                  setCommentInputOpen(false);
                }}
              >
                <Send className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                <ComingSoonBadge />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] z-[60] bg-white shadow-none md:hidden',
          )}
        >
          <div className="mx-auto flex max-w-lg items-center gap-2 px-3 py-2">
            <input
              type="text"
              readOnly
              placeholder="Nói gì đó..."
              onFocus={() => toast.message('Gửi bình luận — sắp có')}
              className="min-w-0 flex-1 rounded-full border border-border bg-muted/50 px-4 py-2.5 text-sm outline-none focus-visible:border-[#00A1D6] focus-visible:ring-2 focus-visible:ring-[#00A1D6]/25"
            />
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                className={cn(
                  'flex flex-col items-center gap-0.5 p-1.5',
                  likedByMe ? 'text-[#00A1D6]' : 'text-muted-foreground',
                  toggleLike.isPending && 'opacity-60',
                )}
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
              >
                <ThumbsUp className="h-6 w-6" strokeWidth={1.75} />
                <span className="text-[10px] font-medium tabular-nums">{likeCount}</span>
              </button>
              <Link
                href={`${ROUTES.POST(post.id)}#comments`}
                className="p-1.5 text-muted-foreground"
                aria-label="Bình luận"
                scroll={false}
              >
                <MessageCircle className="h-6 w-6" strokeWidth={1.75} />
              </Link>
              <button
                type="button"
                className="relative p-1.5 text-muted-foreground"
                aria-label="Chia sẻ"
                onClick={() => toast.message('Chia sẻ — sắp có')}
              >
                <Share2 className="h-6 w-6" strokeWidth={1.75} />
                <ComingSoonBadge />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
