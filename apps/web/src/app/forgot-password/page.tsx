'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { extractApiError } from '@/lib/api-error';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Vui lòng nhập địa chỉ email');
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(extractApiError(err, 'Đã có lỗi xảy ra, vui lòng thử lại'));
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
          {submitted ? (
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
              <h1 className="mb-2 text-lg font-semibold">Kiểm tra hộp thư</h1>
              <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                Nếu email <span className="font-medium text-foreground">{email}</span> tồn tại trong hệ thống,
                chúng tôi đã gửi link đặt lại mật khẩu. Kiểm tra cả thư mục spam.
              </p>
              <Link
                href="/"
                className="text-sm text-[#00aeec] hover:opacity-80 transition-opacity"
              >
                ← Quay về trang chủ
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#00aeec]/10">
                  <Mail className="h-5 w-5 text-[#00aeec]" />
                </div>
                <h1 className="text-lg font-semibold">Quên mật khẩu?</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nhập email đã liên kết với tài khoản. Chúng tôi sẽ gửi link đặt lại mật khẩu.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="example@email.com"
                    className="field"
                    autoFocus
                  />
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-[#00aeec] py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
