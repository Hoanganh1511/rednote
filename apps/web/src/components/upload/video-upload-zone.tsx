'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { CloudUpload } from 'lucide-react';
import {
  SHORT_VIDEO_MAX_SIZE_BYTES,
  SHORT_VIDEO_MAX_SIZE_LABEL,
  SHORT_VIDEO_MAX_DURATION_MIN,
} from './upload-constants';
import type { UploadedVideo } from './upload.types';

interface VideoUploadZoneProps {
  onVideoSelected: (video: UploadedVideo) => void;
}

function inferHdr(file: File): boolean {
  const n = file.name.toUpperCase();
  return n.includes('HDR') || n.includes('DOLBY') || n.includes('DV');
}

export function VideoUploadZone({ onVideoSelected }: VideoUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxBytes = SHORT_VIDEO_MAX_SIZE_BYTES;
  const maxLabel = SHORT_VIDEO_MAX_SIZE_LABEL;

  const processFile = (file: File) => {
    if (file.size > maxBytes) {
      window.alert(`File vượt quá ${maxLabel}. Vui lòng chọn file nhỏ hơn.`);
      return;
    }

    const video: UploadedVideo = {
      id: crypto.randomUUID(),
      file,
      name: file.name || 'video.mp4',
      size: file.size,
      hdr: inferHdr(file),
    };

    onVideoSelected(video);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find((f) => f.type.startsWith('video/'));
    if (videoFile) processFile(videoFile);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) processFile(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        'mx-auto max-w-xl rounded-2xl border border-dashed transition-colors duration-300',
        isDragOver
          ? 'border-[#00A1D6] bg-cyan-50/60'
          : 'border-slate-200/90 bg-[#F7F8FA] hover:border-cyan-300/70',
      ].join(' ')}
    >
      <div className="flex flex-col items-center px-5 pb-9 pt-8 sm:px-6 sm:pb-10 sm:pt-9">
        <motion.div
          animate={{ y: isDragOver ? -2 : 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200/80 sm:h-14 sm:w-14"
        >
          <CloudUpload
            className={`h-6 w-6 transition-colors duration-300 sm:h-7 sm:w-7 ${
              isDragOver ? 'text-[#00A1D6]' : 'text-slate-400'
            }`}
            strokeWidth={1.25}
          />
        </motion.div>

        <p className="mt-3.5 max-w-md text-center text-sm font-medium text-slate-800 sm:text-base">
          Tải video ngắn (kéo thả hoặc chọn file)
        </p>
        <p className="mt-1.5 max-w-md text-center text-xs leading-relaxed text-slate-500 sm:text-sm">
          {`MP4 / MOV · tối đa ${SHORT_VIDEO_MAX_DURATION_MIN} phút · file ≤ ${maxLabel} (ước tính 1080p dọc)`}
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-9 rounded-full bg-[#00A1D6] px-8 py-3 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-[#00b3ea] active:scale-[0.99] sm:mt-10 sm:px-9 sm:py-3.5 sm:text-[0.9375rem]"
        >
          Tải video ngắn
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </motion.div>
  );
}
