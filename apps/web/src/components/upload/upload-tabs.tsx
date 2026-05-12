'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UploadTabId } from './upload.types';

export interface CreatorUploadTab {
  id: UploadTabId;
  label: string;
  icon: LucideIcon;
}

interface UploadTabsProps {
  tabs: CreatorUploadTab[];
  activeTab: UploadTabId;
  onChange: (tab: UploadTabId) => void;
}

export function UploadTabs({ tabs, activeTab, onChange }: UploadTabsProps) {
  return (
    <div className="border-b border-slate-200/90 bg-white">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <nav
          className="-mx-1 flex gap-1 overflow-x-auto pb-0 pt-1 scrollbar-hide"
          aria-label="Loại đăng tải"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={cn(
                  'group relative flex shrink-0 items-center gap-2 rounded-t-lg px-4 py-3.5 text-sm transition-colors duration-200',
                  isActive
                    ? 'font-semibold text-slate-900'
                    : 'font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                )}
              >
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] transition-transform duration-200',
                    isActive ? 'text-[#00A1D6]' : 'text-slate-400 group-hover:text-slate-600',
                  )}
                />
                <span className="whitespace-nowrap">{tab.label}</span>
                {isActive ? (
                  <span
                    className="pointer-events-none absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#00A1D6]"
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
