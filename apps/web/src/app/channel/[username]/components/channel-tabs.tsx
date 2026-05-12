'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type Tab = 'home' | 'posts' | 'videos';

const TABS: { id: Tab; label: string; disabled?: boolean }[] = [
  { id: 'home', label: 'Trang chủ' },
  { id: 'posts', label: 'Bài đăng' },
  { id: 'videos', label: 'Video', disabled: true },
];

interface ChannelTabsProps {
  onTabChange?: (tab: Tab) => void;
}

export function ChannelTabs({ onTabChange }: ChannelTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const handleChange = (tab: Tab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="sticky top-14 z-20 bg-background border-b border-border mb-3">
      <div className="flex">
        {TABS.map(({ id, label, disabled }) => (
          <button
            key={id}
            onClick={() => !disabled && handleChange(id)}
            disabled={disabled}
            className={cn(
              'relative flex-1 py-3 text-sm font-medium transition-colors',
              activeTab === id
                ? 'text-[#00aeec]'
                : 'text-muted-foreground hover:text-foreground',
              disabled && 'cursor-not-allowed opacity-40',
            )}
          >
            {label}
            {activeTab === id && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-[#00aeec]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
