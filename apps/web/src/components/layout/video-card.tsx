import Link from 'next/link';
import Image from 'next/image';
import type { Video } from 'shared-types';
import { formatNumber, formatDuration } from '@/lib/utils';
import { ROUTES } from '@/constants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <article className="group flex flex-col gap-2">
      <Link href={ROUTES.VIDEO(video.id)} className="relative block aspect-video overflow-hidden rounded-lg bg-muted">
        {video.thumbnailUrl && (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
          {formatDuration(video.duration)}
        </span>
      </Link>

      <div className="flex gap-2">
        <Link href={ROUTES.CHANNEL(video.author.username)}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={video.author.avatarUrl ?? undefined} alt={video.author.displayName} />
            <AvatarFallback>{video.author.displayName[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0">
          <Link href={ROUTES.VIDEO(video.id)}>
            <h3 className="line-clamp-2 text-sm font-medium leading-snug">{video.title}</h3>
          </Link>
          <Link
            href={ROUTES.CHANNEL(video.author.username)}
            className="mt-0.5 block text-xs text-muted-foreground hover:text-foreground"
          >
            {video.author.displayName}
          </Link>
          <p className="text-xs text-muted-foreground">{formatNumber(video.viewCount)} lượt xem</p>
        </div>
      </div>
    </article>
  );
}
