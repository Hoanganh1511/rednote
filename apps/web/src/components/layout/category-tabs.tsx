'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'anime', label: 'Anime' },
  { id: 'game', label: 'Game' },
  { id: 'music', label: 'Âm nhạc' },
  { id: 'tech', label: 'Công nghệ' },
  { id: 'food', label: 'Ẩm thực' },
  { id: 'sports', label: 'Thể thao' },
  { id: 'vlog', label: 'Vlog' },
  { id: 'film', label: 'Phim' },
  { id: 'tv', label: 'TV Series' },
  { id: 'knowledge', label: 'Kiến thức' },
  { id: 'news', label: 'Tin tức' },
  { id: 'fashion', label: 'Thời trang' },
  { id: 'car', label: 'Xe cộ' },
  { id: 'animal', label: 'Động vật' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

export function CategoryTabs() {
  const [category, setCategory] = useState<CategoryId | null>(null);

  return (
    <div className="sticky top-16 z-40 border-b border-border bg-background">
      {/* Category chips - horizontal scroll */}
      <div className="relative">
        <div className="scrollbar-hide mx-auto flex w-full max-w-screen-xl items-center gap-3 overflow-x-auto px-4 py-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(category === cat.id ? null : cat.id)}
              className={cn(
                'shrink-0 rounded px-4 py-1.5 text-xs font-medium transition-colors',
                category === cat.id
                  ? 'bg-[#00aeec]/10 text-[#00aeec] font-semibold'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {/* Fade gradient on right edge */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent" />
      </div>
    </div>
  );
}
