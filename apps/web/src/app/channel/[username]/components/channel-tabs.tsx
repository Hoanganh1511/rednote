'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type Tab = 'posts' | 'videos';

interface ChannelTabsProps {
  onTabChange?: (tab: Tab) => void;
}

export function ChannelTabs({ onTabChange }: ChannelTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="mb-6 border-b border-slate-200">
      <div className="flex gap-8">
        <button
          onClick={() => handleTabChange('posts')}
          className={cn(
            'pb-3 px-1 border-b-2 font-semibold text-sm transition-colors',
            activeTab === 'posts'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700',
          )}
        >
          Bài viết
        </button>
        <button
          onClick={() => handleTabChange('videos')}
          className={cn(
            'pb-3 px-1 border-b-2 font-semibold text-sm transition-colors opacity-50 cursor-not-allowed',
            activeTab === 'videos'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700',
          )}
          disabled
        >
          Video <span className="text-xs ml-1">Sắp có</span>
        </button>
      </div>
    </div>
  );
}
