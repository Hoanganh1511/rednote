'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle2, XCircle, Info } from 'lucide-react';
import { useNotificationStore, type AppNotification } from '@/stores/notification-store';
import { cn } from '@/lib/utils';

const THEMES = {
  success: {
    gradient: 'from-emerald-500 to-teal-400',
    glow: 'shadow-emerald-500/40',
    icon: CheckCircle2,
  },
  error: {
    gradient: 'from-red-500 to-rose-400',
    glow: 'shadow-red-500/40',
    icon: XCircle,
  },
  info: {
    gradient: 'from-[#00aeec] to-[#0097c7]',
    glow: 'shadow-[#00aeec]/40',
    icon: Info,
  },
} as const;

export function LiveNotificationStack() {
  const notifications = useNotificationStore((s) => s.notifications);
  return (
    <div className="fixed bottom-5 left-5 z-toast flex flex-col-reverse gap-2.5 pointer-events-none">
      {notifications.map((n) => (
        <LiveNotificationItem key={n.id} notification={n} />
      ))}
    </div>
  );
}

function LiveNotificationItem({ notification: n }: { notification: AppNotification }) {
  const dismiss = useNotificationStore((s) => s.dismiss);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    const leaveTimer = setTimeout(() => setLeaving(true), 4000);
    return () => { cancelAnimationFrame(t); clearTimeout(leaveTimer); };
  }, []);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => dismiss(n.id), 350);
  };

  const theme = THEMES[n.type];
  const Icon = theme.icon;

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3',
        'bg-gradient-to-r text-white',
        'shadow-lg',
        theme.gradient,
        theme.glow,
        'transition-all duration-300 ease-out will-change-transform',
        visible && !leaving
          ? 'translate-x-0 opacity-100 scale-100'
          : '-translate-x-6 opacity-0 scale-95',
      )}
      style={{ minWidth: 240, maxWidth: 320 }}
    >
      {/* Avatar or icon */}
      {n.avatarUrl ? (
        <img
          src={n.avatarUrl}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white/50"
        />
      ) : n.avatarInitial ? (
        <div className="h-9 w-9 shrink-0 rounded-full bg-white/20 ring-2 ring-white/40 flex items-center justify-center text-sm font-bold">
          {n.avatarInitial}
        </div>
      ) : (
        <Icon className="h-5 w-5 shrink-0 text-white/90" />
      )}

      <p className="flex-1 text-sm font-medium leading-snug">{n.message}</p>

      <button
        onClick={handleDismiss}
        className="shrink-0 text-white/60 hover:text-white transition-colors ml-1"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
