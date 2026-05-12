'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import type { UploadedVideo } from './upload.types';

interface UploadProgressProps {
  video: UploadedVideo;
  onComplete: (video: UploadedVideo) => void;
  onCancel: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i > 1 ? 1 : 0)} ${sizes[i]}`;
}

function displayName(video: UploadedVideo): string {
  if (video.name && video.name !== 'video.mp4') return video.name;
  return 'VID_20260105_183355_DOLBY.mp4';
}

export function UploadProgress({ video, onComplete, onCancel }: UploadProgressProps) {
  const [progress, setProgress] = useState(4);
  const [paused, setPaused] = useState(false);
  const objectUrl = useMemo(() => URL.createObjectURL(video.file), [video.file]);
  const completedRef = useRef(false);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const tick = useCallback(() => {
    setProgress((p) => {
      if (p >= 100) return 100;
      return Math.min(100, p + Math.random() * 9 + 3);
    });
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(tick, 700);
    return () => window.clearInterval(id);
  }, [paused, tick]);

  useEffect(() => {
    if (progress < 100 || completedRef.current) return;
    completedRef.current = true;
    onComplete({ ...video });
  }, [progress, onComplete, video]);

  const speedMbps = (8 + Math.random() * 6).toFixed(1);
  const etaSec = Math.max(8, Math.round((100 - progress) * 1.4));
  const etaLabel =
    etaSec >= 60
      ? `Còn ${Math.floor(etaSec / 60)} phút ${etaSec % 60} giây`
      : `Còn ${etaSec} giây`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
        <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80 sm:h-[88px] sm:w-[156px]">
          <img src={objectUrl} alt="" className="h-full w-full object-cover" />
          {video.hdr ? (
            <span className="absolute left-2 top-2 rounded-md bg-[#00A1D6] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              HDR
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900" title={displayName(video)}>
                {displayName(video)}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{formatBytes(video.size)}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-cyan-300 hover:text-[#00A1D6]"
                aria-label={paused ? 'Tiếp tục' : 'Tạm dừng'}
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  completedRef.current = false;
                  setProgress(2);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-cyan-300 hover:text-[#00A1D6]"
                aria-label="Thử lại"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="ml-1 rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
              >
                Hủy
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-[#00A1D6]"
                initial={false}
                animate={{ width: `${Math.min(100, progress)}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>
                {speedMbps} MB/s · {etaLabel}
              </span>
              <span className="font-medium text-[#00A1D6]">{Math.round(Math.min(100, progress))}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
