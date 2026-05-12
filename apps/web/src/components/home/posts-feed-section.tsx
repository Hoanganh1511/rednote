import type { PostFeedPage } from 'shared-types';
import { ApiEnvelopeError } from '@/lib/server/api-envelope';
import { getHomePostsFeed } from '@/lib/server/home-queries';
import { PostsFeedLoadMore } from '@/components/home/posts-feed-load-more';

export async function PostsFeedSection() {
  let data: PostFeedPage;
  try {
    data = await getHomePostsFeed(1);
    console.log('data', data);
  } catch (e) {
    const hint =
      e instanceof ApiEnvelopeError
        ? e.message
        : 'Không tải được bài đăng. Kiểm tra API hoặc thử lại sau.';
    return (
      <section aria-labelledby="posts-feed-heading">
        <h2 id="posts-feed-heading" className="text-muted-foreground mb-2 text-sm font-semibold">
          Bài đăng
        </h2>
        <p className="border-border bg-muted/30 text-muted-foreground rounded-xl border border-dashed px-4 py-8 text-center text-sm">
          {hint}
        </p>
      </section>
    );
  }

  const { items, total } = data;

  return (
    <section aria-labelledby="posts-feed-heading">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 id="posts-feed-heading" className="text-muted-foreground text-sm font-semibold">
          Bài đăng
        </h2>
        {total > 0 ? (
          <span className="text-muted-foreground text-xs tabular-nums">{total} bài</span>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="border-border bg-muted/30 text-muted-foreground rounded-xl border border-dashed px-4 py-8 text-center text-sm">
          Chưa có bài đăng nào. Hãy là người đầu tiên đăng từ mục Đăng tải.
        </p>
      ) : (
        <PostsFeedLoadMore initialItems={items} total={total} />
      )}
    </section>
  );
}
