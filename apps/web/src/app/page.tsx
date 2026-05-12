import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import { LatestVideosSection } from '@/components/home/featured-sections';
import { PostsFeedSection } from '@/components/home/posts-feed-section';
import { PostsFeedSkeleton } from '@/components/home/posts-feed-skeleton';

export const metadata: Metadata = { title: 'Trang chủ' };

/**
 * Trang chủ: từng khối dữ liệu tách Suspense + query riêng (home-queries) để sau này
 * song song hoá fetch, cache theo tag, hoặc chuyển từng section sang client + TanStack Query.
 */
export default function HomePage() {
  return (
    <SiteLayout>
      <div className="space-y-6">
        {/* Tạm tắt FeaturedVideoSection */}

        <Suspense fallback={<PostsFeedSkeleton />}>
          <PostsFeedSection />
        </Suspense>

        <LatestVideosSection />
      </div>
    </SiteLayout>
  );
}
