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
    <div className="sticky top-14 z-10 bg-background border-b border-border">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <div className="flex">
          {TABS.map(({ id, label, disabled }) => (
            <button
              key={id}
              onClick={() => !disabled && handleChange(id)}
              disabled={disabled}
              className={cn(
                'relative px-5 py-3.5 text-sm font-medium transition-colors',
                activeTab === id ? 'text-[#00aeec]' : 'text-muted-foreground hover:text-foreground',
                disabled && 'cursor-not-allowed opacity-40',
              )}
            >
              {label}
              {activeTab === id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00aeec]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
