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
    <div className="sticky top-14 bg-background border-b border-border mb-3">
      <div className="flex">
        {TABS.map(({ id, label, disabled }) => (
          <button
            key={id}
            onClick={() => !disabled && handleChange(id)}
            disabled={disabled}
            className={cn(
              'relative flex-1 py-3 text-sm font-medium transition-colors',
              activeTab === id
                ? 'border-b-2 border-[#00aeec] text-foreground'
                : 'text-muted-foreground hover:text-foreground',
              disabled && 'cursor-not-allowed opacity-40',
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
