'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLoginModalStore } from '@/stores/login-modal-store';

interface LoginRequiredModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginRequiredModal({ open, onClose }: LoginRequiredModalProps) {
  const openLoginModal = useLoginModalStore((s) => s.openModal);

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

  const handleLogin = () => {
    onClose();
    openLoginModal();
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          key="login-required-root"
          className="fixed inset-0 z-[120] flex items-center justify-center p-5"
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-[310px] overflow-hidden rounded-3xl bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ type: 'spring', duration: 0.38, bounce: 0.22 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3.5 top-3.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
              aria-label="Đóng"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="flex justify-center bg-gradient-to-b from-[#E0F5FF] to-white pb-1 pt-7">
              <LockCharacterSVG />
            </div>

            <div className="px-6 pb-7 pt-1 text-center">
              <h2 className="mb-2 text-[18px] font-bold tracking-tight text-slate-900">
                Ôi, bạn chưa đăng nhập!
              </h2>
              <p className="mb-5 text-[13px] leading-relaxed text-slate-500">
                Đăng nhập để đăng bài, bình luận và theo dõi các nhà sáng tạo yêu thích trên{' '}
                <span className="font-semibold text-[#00aeec]">RedNote</span> nhé ~
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full rounded-2xl bg-[#00aeec] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  Đăng nhập ngay
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 active:scale-[0.98]"
                >
                  Để sau
                </button>
              </div>

              <p className="mt-4 text-[11px] text-slate-400">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={handleLogin}
                  className="font-medium text-[#00aeec] transition-opacity hover:opacity-75"
                >
                  Đăng ký miễn phí
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function LockCharacterSVG() {
  return (
    <svg
      width="128"
      height="118"
      viewBox="0 0 128 118"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lrm-body" x1="64" y1="58" x2="64" y2="116" gradientUnits="userSpaceOnUse">
          <stop stopColor="#33BBFF" />
          <stop offset="1" stopColor="#0090CC" />
        </linearGradient>
        <linearGradient id="lrm-shackle" x1="64" y1="0" x2="64" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0090CC" />
          <stop offset="1" stopColor="#006FA8" />
        </linearGradient>
      </defs>

      {/* Sparkle top-left */}
      <path
        d="M14 16 L15.6 20.9 L20.5 22.5 L15.6 24.1 L14 29 L12.4 24.1 L7.5 22.5 L12.4 20.9 Z"
        fill="#FFD700"
        opacity="0.9"
      />
      {/* Sparkle top-right */}
      <path
        d="M113 10 L114.2 13.8 L118 15 L114.2 16.2 L113 20 L111.8 16.2 L108 15 L111.8 13.8 Z"
        fill="#FF9AA2"
        opacity="0.9"
      />
      {/* Sparkle bottom-right */}
      <path
        d="M116 90 L117.2 93.8 L121 95 L117.2 96.2 L116 100 L114.8 96.2 L111 95 L114.8 93.8 Z"
        fill="#B5EAD7"
        opacity="0.9"
      />
      {/* Dot bottom-left */}
      <circle cx="10" cy="88" r="4" fill="#C7CEEA" opacity="0.75" />
      {/* Small floating dots */}
      <circle cx="117" cy="50" r="2.8" fill="#FFD700" opacity="0.5" />
      <circle cx="9" cy="55" r="2.2" fill="#FF9AA2" opacity="0.5" />

      {/* Lock shackle */}
      <path
        d="M40 60 L40 44 C40 24 88 24 88 44 L88 60"
        stroke="url(#lrm-shackle)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Lock body */}
      <rect x="22" y="58" width="84" height="58" rx="16" fill="url(#lrm-body)" />

      {/* Eye whites */}
      <circle cx="48" cy="80" r="9.5" fill="white" opacity="0.96" />
      <circle cx="80" cy="80" r="9.5" fill="white" opacity="0.96" />

      {/* Pupils */}
      <circle cx="49.5" cy="81.5" r="5.5" fill="#1A1A3E" />
      <circle cx="81.5" cy="81.5" r="5.5" fill="#1A1A3E" />

      {/* Eye shine main */}
      <circle cx="51.8" cy="79.2" r="2.3" fill="white" />
      <circle cx="83.8" cy="79.2" r="2.3" fill="white" />

      {/* Eye shine small */}
      <circle cx="53.2" cy="83.5" r="1.1" fill="white" opacity="0.65" />
      <circle cx="85.2" cy="83.5" r="1.1" fill="white" opacity="0.65" />

      {/* Blush left */}
      <ellipse cx="38" cy="89" rx="8.5" ry="5" fill="#FF9AA2" opacity="0.48" />
      {/* Blush right */}
      <ellipse cx="90" cy="89" rx="8.5" ry="5" fill="#FF9AA2" opacity="0.48" />

      {/* Smile */}
      <path
        d="M51 99 Q64 108.5 77 99"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  );
}
