'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import type { HomeNavTabSnippet } from 'shared-types';
import { SITE_MAIN_CONTENT_CLASS } from '@/constants';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

const FALLBACK_TABS: HomeNavTabSnippet[] = [
  { id: 'fb-posts', slug: 'posts', label: 'Post', sortOrder: 0 },
  { id: 'fb-videos', slug: 'videos', label: 'Video', sortOrder: 1 },
  { id: 'fb-suggested', slug: 'suggested', label: 'Đề xuất', sortOrder: 2 },
  { id: 'fb-following', slug: 'following', label: 'Theo dõi', sortOrder: 3 },
  { id: 'fb-weekly', slug: 'weekly-highlights', label: 'Nổi bật tuần này', sortOrder: 4 },
];

export function CategoryTabs() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['home-nav-tabs'],
    queryFn: () =>
      apiClient.get<HomeNavTabSnippet[]>('/features/home-nav-tabs').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const tabs = useMemo(() => {
    if (data && data.length > 0) return data;
    if (isError) return FALLBACK_TABS;
    return FALLBACK_TABS;
  }, [data, isError]);

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [underlineX, setUnderlineX] = useState(0);
  const [underlineWidth, setUnderlineWidth] = useState(20);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (tabs.length === 0) return;
    setActiveSlug((prev) => (prev && tabs.some((t) => t.slug === prev) ? prev : tabs[0]!.slug));
  }, [tabs]);

  const active = activeSlug ?? tabs[0]?.slug ?? 'posts';

  useEffect(() => {
    const activeButton = tabRefs.current[active];
    if (activeButton && activeButton.parentElement) {
      const buttonWidth = activeButton.offsetWidth;
      const buttonLeft = activeButton.offsetLeft;
      const parentPaddingLeft = parseInt(
        window.getComputedStyle(activeButton.parentElement).paddingLeft,
        10,
      );

      const x = buttonLeft - parentPaddingLeft + (buttonWidth - 20) / 2;
      setUnderlineX(x);
      setUnderlineWidth(20);
    }
  }, [active]);

  return (
    <div className="sticky top-16 z-sticky-sub bg-white shadow-none">
      <div className="relative">
        <div
          className={cn(
            SITE_MAIN_CONTENT_CLASS,
            'scrollbar-hide flex items-center justify-start gap-1 overflow-x-auto px-2 sm:gap-2 sm:px-4 md:px-5 lg:px-6',
            isPending && 'min-h-[48px] animate-pulse',
          )}
        >
          {tabs.map((tab) => {
            const isActive = tab.slug === active;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  if (el) tabRefs.current[tab.slug] = el;
                }}
                type="button"
                onClick={() => setActiveSlug(tab.slug)}
                className={cn(
                  'relative shrink-0 px-2.5 py-2 whitespace-nowrap transition-colors sm:px-3',
                  isActive ? 'text-[16px] font-semibold text-[#00A1D6]' : 'text-[15px] font-normal text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            );
          })}
          {/* Animated underline */}
          <motion.div
            className="absolute bottom-0 h-[3px] bg-[#00A1D6] rounded-full"
            style={{ width: underlineWidth }}
            animate={{ x: underlineX }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
      </div>
    </div>
  );
}
