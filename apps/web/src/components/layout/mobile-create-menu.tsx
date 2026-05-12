'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Clapperboard, FileText, NotebookPen, X } from 'lucide-react';
import { ComingSoonBadge } from '@/components/ui/coming-soon-badge';
import { useUserStore } from '@/stores/user-store';

const CREATE_OPTIONS: {
  key: string;
  label: string;
  description: string;
  href: string;
  icon: typeof Clapperboard;
  cardClassName: string;
  upcoming?: boolean;
  requiresAuth?: boolean;
}[] = [
  {
    key: 'video',
    label: 'Đăng video',
    description: 'Tải lên, quay video',
    href: '/upload/video',
    icon: Clapperboard,
    cardClassName: 'bg-[#A8E7FA]',
    upcoming: true,
    requiresAuth: true,
  },
  {
    key: 'post',
    label: 'Đăng post',
    description: 'Đăng suy nghĩ của bạn',
    href: '/upload/post',
    icon: FileText,
    cardClassName: 'bg-[#F3E08F]',
    requiresAuth: true,
  },
  {
    key: 'article',
    label: 'Viết chuyên mục',
    description: 'Viết chuyên mục',
    href: '/upload/article',
    icon: NotebookPen,
    cardClassName: 'bg-[#CDEA95]',
    upcoming: true,
    requiresAuth: true,
  },
];

interface MobileCreateMenuProps {
  open: boolean;
  onClose: () => void;
  onLoginRequired?: () => void;
}

export function MobileCreateMenu({ open, onClose, onLoginRequired }: MobileCreateMenuProps) {
  const isLoggedIn = useUserStore((s) => !!s.accessToken);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div key="mobile-create-root" className="fixed inset-0 z-[100] flex items-end">
          <div className="pointer-events-none w-full">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-create-menu-title"
              className="pointer-events-auto w-full bg-white px-4 pt-5 pb-[max(0.9rem,env(safe-area-inset-bottom))] shadow-[0_-6px_24px_rgba(15,23,42,0.08)]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: 'easeInOut' }}
            >
              <h2 id="mobile-create-menu-title" className="sr-only">
                Tạo nội dung
              </h2>

              <ul className="space-y-2.5">
                {CREATE_OPTIONS.map(
                  ({ key, label, description, href, icon: Icon, cardClassName, upcoming, requiresAuth }) => (
                    <li key={key}>
                      {upcoming ? (
                        <button
                          type="button"
                          disabled
                          className={`relative flex w-full cursor-not-allowed items-center justify-between rounded-2xl px-4 py-3 text-left text-slate-900 ${cardClassName} opacity-95`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-[28px] leading-none" aria-hidden />
                            <span className="block text-base font-bold text-slate-900">
                              {label} <span className="text-base">▸</span>
                            </span>
                            <span className="mt-0.5 block text-sm text-slate-700/90">
                              {description}
                            </span>
                          </span>
                          <span className="ml-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/55 text-slate-700">
                            <Icon className="h-6 w-6" strokeWidth={1.8} />
                          </span>
                          <ComingSoonBadge />
                        </button>
                      ) : (
                        <Link
                          href={href}
                          onClick={(e) => {
                            if (requiresAuth && !isLoggedIn) {
                              e.preventDefault();
                              onLoginRequired?.();
                              return;
                            }
                            onClose();
                          }}
                          className={`flex items-center justify-between rounded-2xl px-4 py-3 text-slate-900 transition-transform active:scale-[0.995] ${cardClassName}`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-base font-bold text-slate-900">
                              {label} <span className="text-base">▸</span>
                            </span>
                            <span className="mt-0.5 block text-sm text-slate-700/90">
                              {description}
                            </span>
                          </span>
                          <span className="ml-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/55 text-slate-700">
                            <Icon className="h-6 w-6" strokeWidth={1.8} />
                          </span>
                        </Link>
                      )}
                    </li>
                  ),
                )}
              </ul>

              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm transition-colors hover:bg-slate-200"
                  aria-label="Đóng menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
