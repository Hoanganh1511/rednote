'use client';

import { useState } from 'react';
import { KeyRound, Mail, Phone, ChevronDown, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores/user-store';

type SectionId = 'password' | 'email' | 'phone';

export default function AccountSecurityPage() {
  const user = useUserStore((s) => s.user);
  const [open, setOpen] = useState<SectionId | null>(null);
  const toggle = (id: SectionId) => setOpen((v) => (v === id ? null : id));

  const hasPhone = !!user?.phoneNumber;
  const hasEmail = !!user?.email;
  const hasPassword = user?.hasPassword ?? false;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Bảo mật tài khoản</h1>
        <p className="mt-1 text-sm text-muted-foreground">Quản lý thông tin bảo mật và xác thực tài khoản</p>
      </div>

      <div className="divide-y divide-border rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
        <SecuritySection
          id="password"
          icon={KeyRound}
          title="Đặt mật khẩu"
          desc={hasPassword ? 'Thay đổi mật khẩu đăng nhập của bạn' : 'Tài khoản chưa có mật khẩu, hãy thiết lập ngay'}
          status={hasPassword ? 'Đã thiết lập' : 'Chưa thiết lập'}
          statusOk={hasPassword}
          warn={!hasPassword}
          open={open === 'password'}
          onToggle={() => toggle('password')}
        >
          <PasswordForm hasPassword={hasPassword} />
        </SecuritySection>

        <SecuritySection
          id="email"
          icon={Mail}
          title="Email ràng buộc"
          desc="Liên kết email để khôi phục tài khoản và nhận thông báo"
          status={hasEmail ? 'Đã liên kết' : 'Chưa liên kết'}
          statusOk={hasEmail}
          open={open === 'email'}
          onToggle={() => toggle('email')}
        >
          <EmailForm currentEmail={user?.email ?? null} />
        </SecuritySection>

        <SecuritySection
          id="phone"
          icon={Phone}
          title="Ràng buộc số điện thoại"
          desc="Liên kết số điện thoại để bảo mật và đăng nhập nhanh"
          status={hasPhone ? 'Đã liên kết' : 'Chưa liên kết'}
          statusOk={hasPhone}
          open={open === 'phone'}
          onToggle={() => toggle('phone')}
        >
          <PhoneForm currentPhone={user?.phoneNumber ?? null} />
        </SecuritySection>
      </div>
    </div>
  );
}

function SecuritySection({
  icon: Icon,
  title,
  desc,
  status,
  statusOk,
  warn = false,
  open,
  onToggle,
  children,
}: {
  id: SectionId;
  icon: React.ElementType;
  title: string;
  desc: string;
  status: string;
  statusOk: boolean;
  warn?: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-6 py-5 text-left transition-colors hover:bg-accent/40"
      >
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00aeec]/10">
          <Icon className="h-5 w-5 text-[#00aeec]" />
          {warn && (
            <AlertCircle className="absolute -top-1 -right-1 h-4 w-4 text-orange-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
        <span className={cn(
          'shrink-0 text-xs font-medium',
          statusOk ? 'text-emerald-500' : warn ? 'text-orange-400' : 'text-amber-500',
        )}>
          {status}
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <div className={cn('overflow-hidden transition-all duration-300', open ? 'max-h-[600px]' : 'max-h-0')}>
        <div className="border-t border-border bg-accent/20 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const fields = hasPassword
    ? (['current', 'next', 'confirm'] as const)
    : (['next', 'confirm'] as const);

  return (
    <div className="space-y-4 sm:max-w-sm">
      {!hasPassword && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-orange-700">
          Tài khoản của bạn chưa có mật khẩu. Thiết lập mật khẩu để tăng bảo mật.
        </div>
      )}
      {fields.map((k) => (
        <div key={k} className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {k === 'current' ? 'Mật khẩu hiện tại' : k === 'next' ? 'Mật khẩu mới' : 'Xác nhận mật khẩu mới'}
          </label>
          <div className="relative">
            <input
              type={show[k] ? 'text' : 'password'}
              className="field pr-9"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShow((s) => ({ ...s, [k]: !s[k] }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show[k] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ))}
      <button className="mt-2 rounded-lg bg-[#00aeec] px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
        {hasPassword ? 'Cập nhật mật khẩu' : 'Thiết lập mật khẩu'}
      </button>
    </div>
  );
}

function EmailForm({ currentEmail }: { currentEmail: string | null }) {
  const [email, setEmail] = useState(currentEmail ?? '');
  return (
    <div className="space-y-4 sm:max-w-sm">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Địa chỉ email</label>
        <input
          type="email"
          className="field"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Mã xác nhận</label>
        <div className="flex gap-2">
          <input type="text" className="field flex-1" placeholder="Nhập mã xác nhận" maxLength={6} />
          <button className="shrink-0 rounded-lg border border-[#00aeec] px-3 py-2 text-xs text-[#00aeec] hover:bg-[#00aeec]/10 transition-colors">
            Gửi mã
          </button>
        </div>
      </div>
      <button className="rounded-lg bg-[#00aeec] px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
        {currentEmail ? 'Cập nhật email' : 'Liên kết email'}
      </button>
    </div>
  );
}

function PhoneForm({ currentPhone }: { currentPhone: string | null }) {
  const [phone, setPhone] = useState(currentPhone ?? '');
  const [sent, setSent] = useState(false);
  return (
    <div className="space-y-4 sm:max-w-sm">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Số điện thoại</label>
        <input
          type="tel"
          className="field"
          placeholder="+84 912 345 678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          readOnly={!!currentPhone && !sent}
        />
        {currentPhone && !sent && (
          <p className="text-xs text-muted-foreground">Nhập số mới để thay đổi số điện thoại.</p>
        )}
      </div>
      {sent && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Mã OTP</label>
          <input type="text" className="field" placeholder="Nhập mã OTP" maxLength={6} />
        </div>
      )}
      <div className="flex gap-2">
        {!sent ? (
          <button
            onClick={() => { setPhone(''); setSent(true); }}
            className="rounded-lg bg-[#00aeec] px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            {currentPhone ? 'Đổi số điện thoại' : 'Gửi mã OTP'}
          </button>
        ) : (
          <>
            <button className="rounded-lg bg-[#00aeec] px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
              Xác nhận
            </button>
            <button onClick={() => { setPhone(currentPhone ?? ''); setSent(false); }}
              className="rounded-lg border border-border px-5 py-2 text-sm font-medium hover:bg-accent transition-colors">
              Huỷ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
