'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
  id: 'video' | 'short' | 'article' | 'interactive' | 'audio';
  label: string;
  icon: LucideIcon;
}

interface UploadTabsProps {
  tabs: Tab[];
  activeTab: Tab['id'];
  onChange: (tab: Tab['id']) => void;
}

export function UploadTabs({ tabs, activeTab, onChange }: UploadTabsProps) {
  return (
    <div className="border-border overflow-x-auto border-b bg-white dark:bg-slate-950">
      <div className="flex gap-0 px-0 py-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 border-b-2 px-4 py-3 transition-all',
                activeTab === tab.id
                  ? 'border-[#00aeec] text-[#00aeec]'
                  : 'text-muted-foreground hover:text-foreground border-transparent hover:border-[#00aeec]/30',
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
