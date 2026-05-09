'use client';

import { useState } from 'react';
import {
  KeyRound,
  Mail,
  Phone,
  ChevronDown,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { extractApiError } from '@/lib/api-error';
import type { User } from 'shared-types';
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
        <p className="text-muted-foreground mt-1 text-sm">
          Quản lý thông tin bảo mật và xác thực tài khoản
        </p>
      </div>

      <div className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm space-y-3">
        <SecuritySection
          id="password"
          icon={KeyRound}
          title="Đặt mật khẩu"
          desc={
            hasPassword
              ? 'Thay đổi mật khẩu đăng nhập của bạn'
              : 'Tài khoản chưa có mật khẩu, hãy thiết lập ngay'
          }
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
        className="hover:bg-accent/40 flex w-full items-center gap-4 px-6 py-5 text-left transition-colors"
      >
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00aeec]/10">
          <Icon className="h-5 w-5 text-[#00aeec]" />
          {warn && <AlertCircle className="absolute -right-1 -top-1 h-4 w-4 text-orange-400" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-muted-foreground mt-0.5 text-xs">{desc}</p>
        </div>
        <span
          className={cn(
            'shrink-0 text-xs font-medium',
            statusOk ? 'text-emerald-500' : warn ? 'text-orange-400' : 'text-amber-500',
          )}
        >
          {status}
        </span>
        <ChevronDown
          className={cn(
            'text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-border bg-accent/20 border-t px-6 py-5">{children}</div>
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
          <label className="text-muted-foreground text-xs font-medium">
            {k === 'current'
              ? 'Mật khẩu hiện tại'
              : k === 'next'
                ? 'Mật khẩu mới'
                : 'Xác nhận mật khẩu mới'}
          </label>
          <div className="relative">
            <input
              type={show[k] ? 'text' : 'password'}
              className="field pr-9"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShow((s) => ({ ...s, [k]: !s[k] }))}
              className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
            >
              {show[k] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ))}
      <button className="mt-2 rounded-lg bg-[#00aeec] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
        {hasPassword ? 'Cập nhật mật khẩu' : 'Thiết lập mật khẩu'}
      </button>
    </div>
  );
}

function EmailForm({ currentEmail }: { currentEmail: string | null }) {
  const setUser = useUserStore((s) => s.setUser);

  const [editing, setEditing] = useState(!currentEmail);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState('');

  const startCooldown = () => {
    setCooldown(60);
    const t = setInterval(() => {
      setCooldown((v) => {
        if (v <= 1) { clearInterval(t); return 0; }
        return v - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!email) return setError('Vui lòng nhập địa chỉ email');
    setSending(true);
    setError('');
    try {
      const res = await apiClient.post<{ devOtp?: string }>('/auth/email/send-otp', { email });
      if (res.data.devOtp) { setDevOtp(res.data.devOtp); setCode(res.data.devOtp); }
      setOtpSent(true);
      startCooldown();
    } catch (err: unknown) {
      setError(extractApiError(err, 'Gửi mã thất bại'));
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (!code) return setError('Vui lòng nhập mã xác nhận');
    setVerifying(true);
    setError('');
    try {
      await apiClient.post('/auth/email/verify', { email, code });
      const meRes = await apiClient.get<User>('/users/me');
      setUser(meRes.data);
      toast.success(`Đã liên kết email ${email}`);
      setEditing(false);
      setEmail('');
      setCode('');
      setOtpSent(false);
      setDevOtp(null);
      setCooldown(0);
    } catch (err: unknown) {
      setError(extractApiError(err, 'Mã xác nhận không hợp lệ'));
    } finally {
      setVerifying(false);
    }
  };

  // Đã có email, chưa bấm "Thay đổi" → hiện input disabled + nút Thay đổi
  if (currentEmail && !editing) {
    return (
      <div className="space-y-1.5 sm:max-w-sm">
        <p className="text-xs font-medium text-muted-foreground">Tài khoản đã liên kết email:</p>
        <div className="flex gap-2">
          <input
            type="email"
            className="field flex-1 opacity-60"
            value={currentEmail}
            disabled
            readOnly
          />
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-lg border border-[#00aeec] px-3 py-2 text-xs text-[#00aeec] transition-colors hover:bg-[#00aeec]/10"
          >
            Thay đổi
          </button>
        </div>
      </div>
    );
  }

  // Editing mode (hoặc chưa có email)
  return (
    <div className="space-y-4 sm:max-w-sm">
      {currentEmail && (
        <p className="text-xs text-muted-foreground">
          Email hiện tại:{' '}
          <span className="font-medium text-foreground">{currentEmail}</span>
        </p>
      )}

      {/* Email input + Gửi mã */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          {currentEmail ? 'Email mới' : 'Địa chỉ email'}
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            className="field flex-1"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
              if (otpSent) { setOtpSent(false); setCode(''); setDevOtp(null); }
            }}
            disabled={sending}
            autoFocus
          />
          {!otpSent && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sending}
              className="shrink-0 flex items-center justify-center rounded-lg border border-[#00aeec] px-4 py-2 text-xs text-[#00aeec] transition-colors hover:bg-[#00aeec]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Gửi mã'}
            </button>
          )}
        </div>
        {otpSent && (
          devOtp
            ? <p className="text-xs text-amber-600">[DEV] Mã OTP: <span className="font-medium">{devOtp}</span></p>
            : <p className="text-xs text-emerald-600">Mã OTP đã được gửi tới email bạn vừa nhập, hãy kiểm tra và xác nhận.</p>
        )}
      </div>

      {/* OTP input + Xác thực liên kết */}
      {otpSent && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Mã xác nhận</label>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sending || cooldown > 0}
              className="text-xs text-[#00aeec] transition-opacity hover:opacity-70 disabled:opacity-40"
            >
              {cooldown > 0 ? `Gửi lại (${cooldown}s)` : 'Gửi lại'}
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="field flex-1"
              placeholder="Nhập mã 6 số"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
              disabled={verifying}
              autoFocus
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying || code.length < 6}
              className="shrink-0 flex items-center justify-center rounded-lg bg-[#00aeec] px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {verifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Xác thực liên kết'}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function PhoneForm({ currentPhone }: { currentPhone: string | null }) {
  const setUser = useUserStore((s) => s.setUser);

  const [editing, setEditing] = useState(!currentPhone);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState('');

  const startCooldown = () => {
    setCooldown(120);
    const t = setInterval(() => {
      setCooldown((v) => {
        if (v <= 1) { clearInterval(t); return 0; }
        return v - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!phone) return setError('Vui lòng nhập số điện thoại');
    setSending(true);
    setError('');
    try {
      const res = await apiClient.post<{ devOtp?: string }>('/auth/phone/send-otp', { phoneNumber: phone });
      if (res.data.devOtp) { setDevOtp(res.data.devOtp); setCode(res.data.devOtp); }
      setOtpSent(true);
      startCooldown();
    } catch (err: unknown) {
      setError(extractApiError(err, 'Gửi mã thất bại'));
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (!code) return setError('Vui lòng nhập mã xác nhận');
    setVerifying(true);
    setError('');
    try {
      await apiClient.post('/auth/phone/verify', { phoneNumber: phone, code });
      const meRes = await apiClient.get<User>('/users/me');
      setUser(meRes.data);
      toast.success(`Đã liên kết số ${phone}`);
      setEditing(false);
      setPhone('');
      setCode('');
      setOtpSent(false);
      setDevOtp(null);
      setCooldown(0);
    } catch (err: unknown) {
      setError(extractApiError(err, 'Mã OTP không hợp lệ'));
    } finally {
      setVerifying(false);
    }
  };

  if (currentPhone && !editing) {
    return (
      <div className="space-y-1.5 sm:max-w-sm">
        <p className="text-xs font-medium text-muted-foreground">Tài khoản đã liên kết số điện thoại:</p>
        <div className="flex gap-2">
          <input
            type="tel"
            className="field flex-1 opacity-60"
            value={currentPhone}
            disabled
            readOnly
          />
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-lg border border-[#00aeec] px-3 py-2 text-xs text-[#00aeec] transition-colors hover:bg-[#00aeec]/10"
          >
            Thay đổi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:max-w-sm">
      {currentPhone && (
        <p className="text-xs text-muted-foreground">
          Số hiện tại:{' '}
          <span className="font-medium text-foreground">{currentPhone}</span>
        </p>
      )}

      {/* Phone input + Gửi mã */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          {currentPhone ? 'Số mới' : 'Số điện thoại'}
        </label>
        <div className="flex gap-2">
          <input
            type="tel"
            className="field flex-1"
            placeholder="+84912345678"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError('');
              if (otpSent) { setOtpSent(false); setCode(''); setDevOtp(null); }
            }}
            disabled={sending}
            autoFocus
          />
          {!otpSent && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sending}
              className="shrink-0 flex items-center justify-center rounded-lg border border-[#00aeec] px-4 py-2 text-xs text-[#00aeec] transition-colors hover:bg-[#00aeec]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Gửi mã'}
            </button>
          )}
        </div>
        {otpSent && (
          devOtp
            ? <p className="text-xs text-amber-600">[DEV] Mã OTP: <span className="font-medium">{devOtp}</span></p>
            : <p className="text-xs text-emerald-600">Mã OTP đã được gửi tới số điện thoại bạn vừa nhập, hãy kiểm tra và xác nhận.</p>
        )}
      </div>

      {/* OTP input + Xác thực liên kết */}
      {otpSent && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Mã xác nhận</label>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sending || cooldown > 0}
              className="text-xs text-[#00aeec] transition-opacity hover:opacity-70 disabled:opacity-40"
            >
              {cooldown > 0 ? `Gửi lại (${cooldown}s)` : 'Gửi lại'}
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="field flex-1"
              placeholder="Nhập mã 6 số"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
              disabled={verifying}
              autoFocus
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying || code.length < 6}
              className="shrink-0 flex items-center justify-center rounded-lg bg-[#00aeec] px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {verifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Xác thực liên kết'}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
