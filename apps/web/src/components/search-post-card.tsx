'use client';

import { useState } from 'react';
import { Heart, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchPostCardProps {
  post: {
    id: string;
    title: string;
    sapo: string;
    author: string;
    date: string;
    isLiked: boolean;
    isSaved: boolean;
  };
}

export function SearchPostCard({ post }: SearchPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);

  return (
    <div className="hover:bg-accent/50 p-4 transition-colors cursor-pointer">
      <div className="space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2 hover:text-[#00aeec] transition-colors">
          {post.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{post.sapo}</p>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{post.author}</span> • {post.date}
        </p>
      </div>

      {/* Action buttons */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            isLiked
              ? 'bg-red-50 text-red-500'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground',
          )}
        >
          <Heart className={cn('h-3.5 w-3.5', isLiked && 'fill-current')} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsSaved(!isSaved);
          }}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            isSaved
              ? 'bg-amber-50 text-amber-600'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground',
          )}
        >
          <Bookmark className={cn('h-3.5 w-3.5', isSaved && 'fill-current')} />
        </button>
      </div>
    </div>
  );
}
