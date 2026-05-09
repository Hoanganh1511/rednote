'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { extractApiError } from '@/lib/api-error';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h1 className="mb-2 font-semibold">Link không hợp lệ</h1>
          <p className="mb-6 text-sm text-muted-foreground">Link đặt lại mật khẩu không tồn tại hoặc đã hết hạn.</p>
          <Link href="/" className="text-sm text-[#00aeec] hover:opacity-80">← Về trang chủ</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError('Mật khẩu phải có ít nhất 8 ký tự');
    if (password !== confirm) return setError('Mật khẩu xác nhận không khớp');
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => router.push('/'), 2500);
    } catch (err: unknown) {
      setError(extractApiError(err, 'Link không hợp lệ hoặc đã hết hạn'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-[#00aeec]">RedNote</span>
        </div>

        <div className="rounded-2xl border border-border bg-background p-8 shadow-lg">
          {success ? (
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
              <h1 className="mb-2 text-lg font-semibold">Đặt lại thành công!</h1>
              <p className="text-sm text-muted-foreground">Đang chuyển hướng về trang chủ...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#00aeec]/10">
                  <KeyRound className="h-5 w-5 text-[#00aeec]" />
                </div>
                <h1 className="text-lg font-semibold">Đặt lại mật khẩu</h1>
                <p className="mt-1 text-sm text-muted-foreground">Nhập mật khẩu mới cho tài khoản của bạn.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="Ít nhất 8 ký tự"
                      className="field pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Xác nhận mật khẩu</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                    placeholder="Nhập lại mật khẩu"
                    className="field"
                  />
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-[#00aeec] py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? 'Đang xử lý...' : 'Xác nhận đặt lại mật khẩu'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
