import type { Metadata } from 'next';
import type { User } from 'shared-types';
import { getUserByUsername, getUserPublishedPosts } from '@/lib/server/channel-queries';
import { ChannelShell } from './channel-shell';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);
  return {
    title: `${user.displayName || user.username} | RedNote`,
    description: user.bio || `${user.displayName || user.username}'s profile on RedNote`,
    openGraph: {
      title: `${user.displayName || user.username} | RedNote`,
      description: user.bio || `${user.displayName || user.username}'s profile on RedNote`,
      images: user.avatarUrl ? [{ url: user.avatarUrl }] : [],
    },
  };
}

export default async function ChannelPage({ params }: PageProps) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  const initialPostsData = await getUserPublishedPosts(user.id, 1);

  return <ChannelShell profile={user} initialPosts={initialPostsData} />;
}
