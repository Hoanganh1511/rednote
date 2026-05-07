import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Đăng nhập' };

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-border p-6 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-bold">Đăng nhập</h1>
        <p className="text-center text-sm text-muted-foreground">Form login sẽ được implement ở đây</p>
      </div>
    </div>
  );
}
