'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import {
  Crown, Coins, LogIn, PlayCircle, ThumbsUp, Share2, Trophy,
  ChevronRight, Upload, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/use-auth';
import { useUserStore } from '@/stores/user-store';
import { apiClient } from '@/lib/api-client';
import { AccountNavCards } from '@/components/layout/account-sidebar';

const DAILY_TASKS = [
  { label: 'Đăng nhập hàng ngày', icon: LogIn, exp: 5 },
  { label: 'Xem video hàng ngày', icon: PlayCircle, exp: 5 },
  { label: 'Đăng xu hàng ngày', icon: Coins, exp: 50 },
  { label: 'Chia sẻ video hàng ngày', icon: Share2, exp: 5 },
] as const;


export default function AccountHomePage() {
  const user = useCurrentUser();
  const displayName = user?.displayName ?? user?.username ?? 'Người dùng';
  const avatarLetter = displayName[0]?.toUpperCase() ?? 'U';
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  const logout = useUserStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      /* ignore */
    }
    logout();
    setShowLogoutConfirm(false);
    router.push('/');
  };

  return (
    <div>

      {/* ── MOBILE LAYOUT ─────────────────────────────────────────────────── */}
      <div className="space-y-3 md:hidden">

        {/* Profile card */}
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-[#00aeec] text-xl font-bold text-white overflow-hidden">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                : avatarLetter}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-bold">{displayName}</span>
                <span className="shrink-0 rounded bg-[#00aeec] px-1.5 py-0.5 text-[9px] font-bold text-white">LV0</span>
              </div>
              <span className="w-fit rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                Chưa là hội viên
              </span>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Coins className="h-3 w-3 text-yellow-500" />
                  Xu: <strong className="text-foreground">0</strong>
                </span>
              </div>
            </div>
            {user?.username && (
              <Link
                href={`/channel/${user.username}`}
                className="flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Trang cá nhân
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {/* Stats row */}
          <div className="mt-3 flex items-center border-t border-border pt-3">
            {([
              { label: 'Bài đăng', value: user?.videoCount ?? 0 },
              { label: 'Đang theo dõi', value: user?.followingCount ?? 0 },
              { label: 'Người theo dõi', value: user?.followerCount ?? 0 },
            ] as const).map(({ label, value }, i) => (
              <div
                key={label}
                className={cn('flex flex-1 flex-col items-center gap-0.5', i > 0 && 'border-l border-border')}
              >
                <span className="text-sm font-bold">{value}</span>
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Account nav grid */}
        <AccountNavCards />

        {/* VIP banner */}
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#00aeec] to-[#007ab8] p-4 text-white shadow-sm">
          <Crown className="h-6 w-6 shrink-0 opacity-80" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Nâng cấp hội viên</p>
            <p className="text-xs opacity-75">Khám phá đặc quyền hội viên</p>
          </div>
          <div className="relative shrink-0">
            <button className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#00aeec] transition-opacity hover:opacity-90">
              Đăng ký ngay
            </button>
            <span className="ring-background absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2" />
          </div>
        </div>



        {/* Upload prompt */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00aeec]/10">
            <Upload className="h-5 w-5 text-[#00aeec]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Đăng video đầu tiên!</p>
            <p className="text-xs text-muted-foreground">Chia sẻ nội dung với cộng đồng</p>
          </div>
          <div className="relative shrink-0">
            <Link
              href="/upload"
              className="rounded-full bg-[#00aeec] px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              Đăng tải
            </Link>
            <span className="ring-background absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2" />
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>

      </div>

      {/* ── DESKTOP LAYOUT ────────────────────────────────────────────────── */}
      <div className="hidden space-y-6 md:block">

        {/* Profile card */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-5 shadow-sm sm:flex-row sm:items-start sm:gap-6 sm:p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#00aeec] text-2xl font-bold text-white overflow-hidden sm:h-20 sm:w-20">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              : avatarLetter}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold">{displayName}</span>
              <span className="rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                Chưa là hội viên
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {user?.phoneNumber ?? 'Chưa liên kết số điện thoại'}
            </p>
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#00aeec] px-1.5 py-0.5 text-[10px] font-bold text-white">LV0</span>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-muted sm:w-48">
                <div className="h-full w-0 rounded-full bg-[#00aeec]" />
              </div>
              <span className="text-[11px] text-muted-foreground">0 / 1</span>
            </div>
            <div className="flex items-center gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-yellow-500" />
                Xu: <strong className="text-foreground">0</strong>
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent">
              Sửa thông tin
            </button>
            {user?.username && (
              <Link
                href={`/channel/${user.username}`}
                className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
              >
                Không gian cá nhân →
              </Link>
            )}
          </div>
        </div>

        {/* VIP banners */}
        <div className="flex flex-col overflow-hidden rounded-2xl text-white md:flex-row">
          <div className="relative flex flex-1 flex-col justify-center gap-2 bg-gradient-to-r from-[#00aeec] to-[#009fd4] p-5 sm:p-6">
            <p className="text-sm font-medium opacity-80">Nâng cấp hội viên</p>
            <p className="text-base font-semibold">Trở thành hội viên chính thức, mở ra thế giới mới (｀･ω･´)</p>
            <div className="relative mt-2 w-fit">
              <button className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-[#00aeec] transition-opacity hover:opacity-90">
                Nâng cấp ngay
              </button>
              <span className="ring-background absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2" />
            </div>
            <Crown className="absolute right-4 top-1/2 h-20 w-20 -translate-y-1/2 opacity-10" />
          </div>
          <div className="h-px w-full bg-white/20 md:h-auto md:w-px md:self-stretch" />
          <div className="flex flex-1 flex-col justify-center gap-2 bg-gradient-to-r from-[#0097c7] to-[#007ab8] p-5 sm:p-6">
            <p className="text-sm font-medium opacity-80">Kích hoạt bằng mã mời</p>
            <p className="text-base font-semibold">Nhập mã mời để nâng cấp ngay lập tức</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Nhập mã mời"
                className="flex-1 rounded-lg border border-white/30 bg-white/20 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-white/50"
              />
              <button className="shrink-0 rounded-lg border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20">
                Kích hoạt
              </button>
            </div>
          </div>
        </div>

        {/* Daily tasks */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="mb-5 flex items-baseline gap-2">
            <h2 className="text-base font-semibold">Nhiệm vụ hàng ngày</h2>
            <span className="text-xs text-muted-foreground">
              Trở thành hội viên chính thức mới nhận được phần thưởng hàng ngày
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {DAILY_TASKS.map(({ label, icon: Icon, exp }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 rounded-xl border border-border p-5 transition-colors hover:border-[#00aeec]/30 hover:bg-[#00aeec]/5"
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#00aeec] text-white">
                  <Icon className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 rounded-full bg-orange-400 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                    {exp}<span className="text-[8px]">EXP</span>
                  </span>
                </div>
                <p className="text-center text-xs text-muted-foreground">{label}</p>
                <span className="text-[11px] text-muted-foreground/60">Chưa hoàn thành</span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement badges */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-orange-400" />
            <h2 className="text-base font-semibold">Thành tích</h2>
          </div>
          <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
            <div className="rounded-full border-2 border-dashed border-border p-6">
              <Trophy className="h-10 w-10 opacity-20" />
            </div>
            <p className="text-sm">Bạn chưa nhận được thành tích nào!</p>
            <button className="rounded-lg border border-[#00aeec] px-4 py-1.5 text-sm text-[#00aeec] transition-colors hover:bg-[#00aeec]/10">
              Xem chi tiết thành tích
            </button>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>

      <Dialog
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Xác nhận đăng xuất"
        actions={[
          { label: 'Hủy', variant: 'outline', onClick: () => setShowLogoutConfirm(false) },
          { label: 'Đăng xuất', onClick: handleLogout, className: 'bg-red-500 hover:bg-red-500/90' },
        ]}
      >
        Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?
      </Dialog>
    </div>
  );
}
