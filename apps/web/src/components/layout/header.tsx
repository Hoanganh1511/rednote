'use client';

import Link from 'next/link';
import { Search, MessageCircle, Bookmark, Bell } from 'lucide-react';
import { useState } from 'react';
import { LoginModal } from '@/components/auth/login-modal';
import { ROUTES } from '@/constants';

const LEFT_LINKS = [
  { label: 'Trang chủ', href: ROUTES.HOME },
  { label: 'Xây hình ảnh cá nhân', href: '/creator' },
  { label: 'Phim đã xem', href: '/film-review' },
] as const;

const RIGHT_ACTIONS = [
  { label: 'Tin nhắn', href: '/messages', icon: MessageCircle },
  { label: 'Bộ sưu tập', href: '/collections', icon: Bookmark },
  { label: 'Thông báo', href: '/notifications', icon: Bell },
] as const;

export function Header() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="flex h-16 items-center gap-x-6 px-4">
          {/* Left slot — nav links */}
          <nav className="hidden shrink-0 items-center gap-x-5 lg:flex">
            {LEFT_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="whitespace-nowrap text-[13px] font-light text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Middle slot — search + login */}
          <div className="flex flex-1 items-center justify-center gap-3">
            <div className="flex w-full max-w-xl items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Tìm kiếm điều gì đó của tôi"
                  className="h-9 w-full rounded-full border border-input bg-muted pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                onClick={() => setLoginOpen(true)}
                className="shrink-0 rounded-md bg-[#00aeec] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Đăng nhập
              </button>
            </div>
          </div>

          {/* Right slot — icon + label buttons */}
          <nav className="hidden shrink-0 items-center gap-x-1 lg:flex">
            {RIGHT_ACTIONS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-y-2 rounded-md px-3 py-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
