import type { Metadata } from 'next';
import { SiteLayout } from '@/components/layout/site-layout';

export const metadata: Metadata = { title: 'Trang chủ' };

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-video w-full animate-pulse rounded-lg bg-muted" />
      <div className="flex gap-2">
        <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-1.5 pt-0.5">
          <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
          <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <SiteLayout>
      <div className="space-y-6">
        <section>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] lg:grid-rows-2">
            <div className="relative col-span-2 overflow-hidden rounded-xl sm:col-span-3 lg:col-span-1 lg:row-span-2">
              <div className="aspect-video w-full animate-pulse bg-gradient-to-br from-muted via-muted to-accent/30 lg:h-full lg:aspect-auto" />
              <div className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-sm font-semibold text-white line-clamp-2">
                  Video nổi bật sẽ hiển thị ở đây
                </p>
                <p className="mt-0.5 text-xs text-white/70">Tên kênh · 1.2M lượt xem</p>
              </div>
            </div>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Video mới nhất</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
