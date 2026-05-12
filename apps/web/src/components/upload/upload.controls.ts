import { cn } from '@/lib/utils';

const CONTROL_BASE =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition-shadow placeholder:text-slate-400';

const CONTROL_FOCUS =
  'focus-visible:border-cyan-300 focus-visible:ring-4 focus-visible:ring-cyan-100';

export const creatorInputClassName = cn(CONTROL_BASE, CONTROL_FOCUS);

export const creatorSelectClassName = cn(
  'w-full appearance-none pr-10',
  CONTROL_BASE,
  CONTROL_FOCUS,
);

export const creatorTextareaClassName = cn(
  'w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base leading-relaxed text-slate-900 shadow-sm outline-none transition-shadow placeholder:text-slate-400',
  CONTROL_FOCUS,
);

