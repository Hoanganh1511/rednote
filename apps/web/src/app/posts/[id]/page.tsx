import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteLayout } from '@/components/layout/site-layout';
import { getPublishedPostById } from '@/lib/server/home-queries';
import { ApiEnvelopeError } from '@/lib/server/api-envelope';
import { PostDetailView } from './post-detail-view';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const post = await getPublishedPostById(id);
    const line = post.content.replace(/\s+/g, ' ').trim().slice(0, 80);
    return { title: line || 'Chi tiết' };
  } catch {
    return { title: 'Chi tiết' };
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  try {
    const post = await getPublishedPostById(id);

    return (
      <SiteLayout>
        <PostDetailView post={post} />
      </SiteLayout>
    );
  } catch (e) {
    if (e instanceof ApiEnvelopeError && e.statusCode === 404) notFound();
    throw e;
  }
}
