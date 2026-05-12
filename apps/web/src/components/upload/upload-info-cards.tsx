'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { Film, HardDrive, MonitorPlay } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SHORT_VIDEO_MAX_DURATION_MIN,
  SHORT_VIDEO_MAX_SIZE_LABEL,
} from './upload-constants';

type ShortInfoItem = {
  key: string;
  title: string;
  titleSuffix?: string;
  body: string;
  /** Dòng mô tả nhạt hơn (ô chỉ mang tính gợi ý). */
  bodyMuted?: boolean;
  Icon: LucideIcon;
};

const SHORT_ITEMS: ShortInfoItem[] = [
  {
    key: 'size',
    title: 'Thời lượng & dung lượng',
    body: `Tối đa ${SHORT_VIDEO_MAX_DURATION_MIN} phút · file ≤ ${SHORT_VIDEO_MAX_SIZE_LABEL}`,
    Icon: HardDrive,
  },
  {
    key: 'format',
    title: 'Khung hình',
    titleSuffix: 'khuyến nghị',
    body: '9:16 dọc · MP4 / MOV',
    bodyMuted: true,
    Icon: Film,
  },
  {
    key: 'resolution',
    title: 'Độ phân giải',
    titleSuffix: 'khuyến nghị',
    body: '720P–1080P dọc',
    bodyMuted: true,
    Icon: MonitorPlay,
  },
];

function MiniIcon({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
      <div
        className="absolute inset-0 rotate-6 rounded-lg bg-gradient-to-br from-cyan-100 via-sky-50 to-teal-100/90"
        aria-hidden
      />
      <div className="relative text-[#00A1D6]">{children}</div>
    </div>
  );
}

export function UploadInfoCards() {
  const items = SHORT_ITEMS;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
        Lưu ý khi tải lên
      </h2>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm"
      >
        <ul className="divide-y divide-slate-100 sm:flex sm:divide-x sm:divide-y-0">
          {items.map((item) => {
            const Icon = item.Icon;
            return (
              <li
                key={item.key}
                className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 sm:px-4 sm:py-2"
              >
                <MiniIcon>
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </MiniIcon>
                <div className="min-w-0 leading-tight">
                  <p className="text-xs font-semibold text-slate-800">
                    {item.title}
                    {item.titleSuffix ? (
                      <span className="text-[10px] font-normal text-slate-400 sm:text-[11px]">
                        {' '}
                        ({item.titleSuffix})
                      </span>
                    ) : null}
                  </p>
                  <p
                    className={cn(
                      'truncate text-[11px] sm:text-xs',
                      item.bodyMuted ? 'text-slate-400' : 'text-slate-500',
                    )}
                  >
                    {item.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </motion.div>
      <p className="text-[11px] leading-relaxed text-slate-400 sm:text-xs">
        Mức ~300MB/clip giúp giữ object storage (vd. S3) trong tầm vài USD/tháng khi lưu vài chục GB
        cho nhóm nhỏ; chi phí egress/CDN tính riêng khi có lượt xem.
      </p>
    </div>
  );
}
