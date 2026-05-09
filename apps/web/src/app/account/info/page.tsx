'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Camera, ChevronRight, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores/user-store';
import { useAccountUiStore } from '@/stores/account-ui-store';
import { apiClient } from '@/lib/api-client';
import { extractApiError } from '@/lib/api-error';
import { Dialog } from '@/components/ui/dialog';
import type { User } from 'shared-types';

const GENDER_LABELS: Record<string, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
  '': 'Chưa chọn',
};

export default function AccountInfoPage() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const setMobileBackOverride = useAccountUiStore((s) => s.setMobileBackOverride);

  const [form, setForm] = useState({ displayName: '', bio: '', gender: '', birthday: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [usernameEditing, setUsernameEditing] = useState(false);
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [mobileEditing, setMobileEditing] = useState(false);
  const [successDialog, setSuccessDialog] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        displayName: user.displayName ?? '',
        bio: user.bio ?? '',
        gender: user.gender ?? '',
        birthday: user.birthday ?? '',
      });
      setUsername(user.username ?? '');
    }
  }, [user]);

  useEffect(() => {
    if (mobileEditing) {
      setMobileBackOverride(() => setMobileEditing(false));
    } else {
      setMobileBackOverride(null);
    }
    return () => setMobileBackOverride(null);
  }, [mobileEditing, setMobileBackOverride]);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, string> = {};
      if (form.displayName) body.displayName = form.displayName;
      if (form.bio !== undefined) body.bio = form.bio;
      if (form.gender) body.gender = form.gender;
      if (form.birthday) body.birthday = form.birthday;

      const res = await apiClient.patch<User>('/users/me', body);
      setUser(res.data);
      setMobileEditing(false);
      setSuccessDialog('Thay đổi đã được cập nhật.');
    } catch (err: unknown) {
      setError(extractApiError(err, 'Lưu thất bại, vui lòng thử lại.'));
    } finally {
      setSaving(false);
    }
  };

  const handleUsernameSave = async () => {
    if (!username.trim() || username === user?.username) return;
    setUsernameSaving(true);
    setUsernameError(null);
    try {
      const res = await apiClient.patch<User>('/users/me', { username: username.trim() });
      setUser(res.data);
      setUsernameEditing(false);
      setSuccessDialog('Đã cập nhật tên người dùng!');
    } catch (err: unknown) {
      setUsernameError(extractApiError(err, 'Đổi tên người dùng thất bại.'));
    } finally {
      setUsernameSaving(false);
    }
  };

  const handleUsernameCancel = () => {
    setUsername(user?.username ?? '');
    setUsernameEditing(false);
    setUsernameError(null);
  };

  return (
    <div>

      {/* ── MOBILE LAYOUT ─────────────────────────────────────────────────── */}
      <div className="space-y-3 md:hidden">

        {/* Avatar — always at top */}
        <Link
          href="/account/avatar"
          className="flex flex-col items-center gap-2 py-2"
        >
          <div className="relative">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-[#00aeec] flex items-center justify-center text-2xl font-bold text-white">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                : (user?.displayName?.[0]?.toUpperCase() ?? 'U')}
            </div>
            <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#00aeec] text-white shadow">
              <Camera className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-xs text-[#00aeec]">Đổi ảnh đại diện</span>
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold">Thông tin của tôi</h1>
          <button
            onClick={() => setMobileEditing((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-[#00aeec]"
          >
            <Pencil className="h-3.5 w-3.5" />
            {mobileEditing ? 'Huỷ' : 'Chỉnh sửa'}
          </button>
        </div>

        {/* Read-only list view */}
        {!mobileEditing && (
          <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
            <MobileRow label="Tên hiển thị" value={form.displayName || '—'} />
            <MobileRow label="Tên người dùng" value={username ? `@${username}` : '—'} />
            <MobileRow label="Giới tính" value={GENDER_LABELS[form.gender] ?? '—'} />
            <MobileRow label="Ngày sinh" value={form.birthday || '—'} />
            <MobileRow label="Giới thiệu" value={form.bio || '—'} last />
          </div>
        )}

        {/* Edit form */}
        {mobileEditing && (
          <div className="space-y-3">
            {/* Username */}
            <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
              <p className="border-b border-border px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Tên người dùng
              </p>
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Chỉ được thay đổi 1 lần trong 7 ngày.
                </p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      readOnly={!usernameEditing}
                      className={cn('field pl-7', !usernameEditing && 'pointer-events-none bg-muted/40 text-muted-foreground')}
                    />
                  </div>
                  {!usernameEditing ? (
                    <button
                      onClick={() => setUsernameEditing(true)}
                      className="shrink-0 text-sm text-[#00aeec] underline underline-offset-2"
                    >
                      Thay đổi
                    </button>
                  ) : (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={handleUsernameSave}
                        disabled={usernameSaving || !username.trim() || username === user?.username}
                        className="rounded-lg bg-[#00aeec] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                      >
                        {usernameSaving ? '...' : 'Lưu'}
                      </button>
                      <button
                        onClick={handleUsernameCancel}
                        className="rounded-lg border border-border px-3 py-2 text-sm"
                      >
                        Huỷ
                      </button>
                    </div>
                  )}
                </div>
                {usernameError && <p className="text-xs text-red-500">{usernameError}</p>}
              </div>
            </div>

            {/* Main info */}
            <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
              <p className="border-b border-border px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Thông tin cá nhân
              </p>
              <div className="divide-y divide-border">
                <MobileEditRow label="Tên hiển thị">
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={set('displayName')}
                    placeholder="Nhập tên hiển thị"
                    className="field"
                  />
                </MobileEditRow>
                <MobileEditRow label="Giới tính">
                  <select value={form.gender} onChange={set('gender')} className="field">
                    <option value="">Chưa chọn</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </MobileEditRow>
                <MobileEditRow label="Ngày sinh">
                  <input type="date" value={form.birthday} onChange={set('birthday')} className="field" />
                </MobileEditRow>
                <MobileEditRow label="Giới thiệu">
                  <textarea
                    value={form.bio}
                    onChange={set('bio')}
                    placeholder="Viết vài dòng giới thiệu..."
                    rows={3}
                    maxLength={200}
                    className="field resize-none"
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">{form.bio.length}/200</p>
                </MobileEditRow>
              </div>
            </div>

            {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-xl bg-[#00aeec] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        )}
      </div>

      {/* ── DESKTOP LAYOUT ────────────────────────────────────────────────── */}
      <div className="hidden max-w-2xl space-y-6 md:block">
        <div>
          <h1 className="text-xl font-semibold">Thông tin của tôi</h1>
          <p className="mt-1 text-sm text-muted-foreground">Quản lý thông tin cá nhân của bạn</p>
        </div>

        {/* Avatar quick-access */}
        <div className="flex items-center gap-5 rounded-2xl border border-border bg-background p-5 shadow-sm">
          <div className="relative h-16 w-16 shrink-0">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-[#00aeec] flex items-center justify-center text-2xl font-bold text-white">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                : (user?.displayName?.[0]?.toUpperCase() ?? 'U')}
            </div>
            <a
              href="/account/avatar"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
            >
              <Camera className="h-5 w-5 text-white" />
            </a>
          </div>
          <div>
            <p className="text-sm font-medium">Ảnh đại diện</p>
            <a href="/account/avatar" className="text-xs text-[#00aeec] hover:underline">
              Thay đổi ảnh đại diện →
            </a>
          </div>
        </div>

        {/* Username card */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold">Tên người dùng</p>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Tên người dùng chỉ được thay đổi 1 lần trong 7 ngày. Tên người dùng hiển thị với mọi người trên nền tảng.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                readOnly={!usernameEditing}
                className={cn('field pl-7', !usernameEditing && 'pointer-events-none text-muted-foreground bg-muted/40')}
              />
            </div>
            {!usernameEditing ? (
              <button
                onClick={() => setUsernameEditing(true)}
                className="shrink-0 text-sm text-[#00aeec] underline underline-offset-2 hover:opacity-75 transition-opacity"
              >
                Thay đổi
              </button>
            ) : (
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={handleUsernameSave}
                  disabled={usernameSaving || !username.trim() || username === user?.username}
                  className="rounded-lg bg-[#00aeec] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {usernameSaving ? 'Đang lưu...' : 'Cập nhật'}
                </button>
                <button
                  onClick={handleUsernameCancel}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Huỷ
                </button>
              </div>
            )}
          </div>
          {usernameError && (
            <p className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{usernameError}</p>
          )}
        </div>

        {/* Main info form */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="space-y-5">
            <Field label="Tên hiển thị" hint="Tên này sẽ được hiển thị công khai trên trang cá nhân của bạn.">
              <input
                type="text"
                value={form.displayName}
                onChange={set('displayName')}
                placeholder="Nhập tên hiển thị"
                className="field"
              />
            </Field>
            <Field label="Giới tính">
              <select value={form.gender} onChange={set('gender')} className="field">
                <option value="">Chưa chọn</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </Field>
            <Field label="Ngày sinh">
              <input type="date" value={form.birthday} onChange={set('birthday')} className="field" />
            </Field>
            <Field label="Giới thiệu bản thân">
              <textarea
                value={form.bio}
                onChange={set('bio')}
                placeholder="Viết vài dòng giới thiệu về bản thân..."
                rows={4}
                maxLength={200}
                className="field resize-none"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{form.bio.length}/200</p>
            </Field>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-[#00aeec] px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>

      <Dialog
        open={successDialog !== null}
        onClose={() => setSuccessDialog(null)}

        actions={[{ label: 'OK', onClick: () => setSuccessDialog(null) }]}
      >
        {successDialog}
      </Dialog>
    </div>
  );
}

function MobileRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-3.5', !last && 'border-b border-border')}>
      <span className="w-28 shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="flex-1 truncate text-sm">{value}</span>
    </div>
  );
}

function MobileEditRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3.5 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 items-start gap-1.5 sm:grid-cols-[140px_1fr] sm:gap-4">
      <div className="sm:pt-2">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}
