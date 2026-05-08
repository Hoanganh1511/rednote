'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { extractApiError } from '@/lib/api-error';
import { useUserStore } from '@/stores/user-store';
import type { AuthTokens, User } from 'shared-types';

const TABS = [
  { id: 'password', label: 'Đăng nhập mật khẩu' },
  { id: 'sms', label: 'Đăng nhập SMS' },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [tab, setTab] = useState<TabId>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password tab
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // SMS tab
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const setTokens = useUserStore((s) => s.setTokens);
  const setUser = useUserStore((s) => s.setUser);
  const setJustLoggedIn = useUserStore((s) => s.setJustLoggedIn);

  useEffect(() => {
    if (devOtp && otpSent) setOtpCode(devOtp);
  }, [devOtp, otpSent]);

  const resetError = () => setError('');

  const handlePasswordLogin = async () => {
    if (!identifier || !password) return setError('Vui lòng nhập đầy đủ thông tin');
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post<AuthTokens>('/auth/login', { identifier, password });
      setTokens(res.data);
      const meRes = await apiClient.get<User>('/users/me', {
        headers: { Authorization: `Bearer ${res.data.accessToken}` },
      });
      setUser(meRes.data);
      setJustLoggedIn(true);
      onClose();
    } catch (err: unknown) {
      setError(extractApiError(err, 'Đăng nhập thất bại'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) return setError('Vui lòng nhập số điện thoại');
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post<{ message: string; devOtp?: string }>('/auth/otp/send', { phoneNumber });
      const devOtpCode = res.data.devOtp ?? null;
      setDevOtp(devOtpCode);
      if (devOtpCode) setOtpCode(devOtpCode);
      setOtpSent(true);
      setOtpCooldown(120);
      const timer = setInterval(() => {
        setOtpCooldown((v) => {
          if (v <= 1) { clearInterval(timer); return 0; }
          return v - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      setError(extractApiError(err, 'Gửi OTP thất bại'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async () => {
    if (!phoneNumber || !otpCode) return setError('Vui lòng nhập đầy đủ thông tin');
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post<AuthTokens>('/auth/otp/verify', { phoneNumber, code: otpCode });
      setTokens(res.data);
      const meRes = await apiClient.get<User>('/users/me', {
        headers: { Authorization: `Bearer ${res.data.accessToken}` },
      });
      setUser(meRes.data);
      setJustLoggedIn(true);
      onClose();
    } catch (err: unknown) {
      setError(extractApiError(err, 'Mã OTP không hợp lệ'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (tab === 'password') handlePasswordLogin();
    else handleOtpLogin();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="px-5 pb-8 pt-7 sm:px-7">
        {/* Tabs */}
        <div className="mb-6 flex items-center gap-5 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); resetError(); }}
              className={cn(
                'pb-3 text-sm font-medium whitespace-nowrap transition-colors',
                tab === t.id
                  ? 'border-b-2 border-[#00aeec] text-[#00aeec]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Password tab */}
        {tab === 'password' && (
          <div className="space-y-4">
            <FormRow label="Tài khoản">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Tên tài khoản hoặc email"
                className="field"
              />
            </FormRow>
            <FormRow label="Mật khẩu">
              <div className="relative w-full">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Vui lòng nhập mật khẩu"
                  className="field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormRow>
            <div className="flex justify-end">
              <button type="button" className="text-xs text-[#00aeec] transition-opacity hover:opacity-75">
                Quên mật khẩu?
              </button>
            </div>
          </div>
        )}

        {/* SMS tab */}
        {tab === 'sms' && (
          <div className="space-y-4">
            <FormRow label="Số điện thoại">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+84912345678"
                className="field"
              />
            </FormRow>
            <FormRow label="Mã OTP">
              <div className="flex w-full gap-2">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Nhập mã OTP"
                  className="field flex-1"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || otpCooldown > 0}
                  className="shrink-0 rounded-lg border border-[#00aeec] px-3 py-2 text-xs text-[#00aeec] transition-colors hover:bg-[#00aeec]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpCooldown > 0 ? `${otpCooldown}s` : 'Lấy mã'}
                </button>
              </div>
            </FormRow>
            {otpSent && (
              <p className="text-xs text-green-600">Mã OTP đã được gửi đến {phoneNumber}</p>
            )}
          </div>
        )}

        {/* Error */}
        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        {/* Action buttons */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => { setTab('sms'); resetError(); }}
            className="flex-1 rounded-lg border border-input py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            Đăng ký
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-lg bg-[#00aeec] py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </div>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">Các cách khác để đăng nhập</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Social login */}
        <div className="flex justify-center gap-4 sm:gap-6">
          <SocialButton label="Google"><div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white shadow-sm"><GoogleIcon /></div></SocialButton>
          <SocialButton label="Facebook"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877f2]"><FacebookIcon /></div></SocialButton>
          <SocialButton label="Apple ID"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-black"><AppleIcon /></div></SocialButton>
        </div>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
          Nếu bạn chưa đăng ký số điện thoại di động, chúng tôi sẽ tự động giúp bạn đăng ký tài khoản. Đăng nhập hoặc hoàn tất đăng ký để đồng ý{' '}
          <span className="cursor-pointer text-[#00aeec] hover:opacity-80">Thỏa thuận người dùng</span>{' '}
          và{' '}
          <span className="cursor-pointer text-[#00aeec] hover:opacity-80">Chính sách bảo mật</span>.
        </p>
      </div>
    </Modal>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <label className="text-sm text-muted-foreground sm:w-28 sm:shrink-0">{label}</label>
      {children}
    </div>
  );
}

function SocialButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button className="flex flex-col items-center gap-1.5 rounded-xl px-3 py-2 transition-colors hover:bg-accent">
      {children}
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}
