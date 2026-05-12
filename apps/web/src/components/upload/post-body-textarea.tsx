'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { cn } from '@/lib/utils';
import { HASHTAG_TEXT_CLASS, splitForHashtagHighlight } from './hashtag-highlight';

export type PostBodyTextareaHandle = {
  scrollToEnd: () => void;
};

type PostBodyTextareaProps = {
  /** id cho label htmlFor (desktop). */
  id?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  /** Class áp cho wrapper (kích thước / flex). */
  className?: string;
  /** Class chung cho lớp mirror + textarea (font, line-height, padding). */
  editorClassName?: string;
  /** Nền lớp mirror (khớp nền textarea, vd. bg-white trên desktop). */
  mirrorBgClassName?: string;
  minHeightClassName?: string;
  maxHeightClassName?: string;
};

export const PostBodyTextarea = forwardRef<PostBodyTextareaHandle, PostBodyTextareaProps>(
  function PostBodyTextarea(
    {
      value,
      onChange,
      placeholder,
      maxLength = 1000,
      disabled,
      id,
      className,
      editorClassName,
      mirrorBgClassName = 'bg-transparent',
      minHeightClassName,
      maxHeightClassName,
    },
    ref,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mirrorRef = useRef<HTMLDivElement>(null);

    const tokens = useMemo(() => splitForHashtagHighlight(value), [value]);

    const syncScroll = useCallback(() => {
      const ta = textareaRef.current;
      const mirror = mirrorRef.current;
      if (ta && mirror) mirror.scrollTop = ta.scrollTop;
    }, []);

    useEffect(() => {
      syncScroll();
    }, [value, syncScroll]);

    useImperativeHandle(
      ref,
      () => ({
        scrollToEnd: () => {
          const ta = textareaRef.current;
          const mirror = mirrorRef.current;
          if (ta) {
            ta.scrollTop = ta.scrollHeight;
          }
          if (mirror) {
            mirror.scrollTop = mirror.scrollHeight;
          }
        },
      }),
      [],
    );

    return (
      <div className={cn('relative', className)}>
        <div
          ref={mirrorRef}
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 z-0 overflow-y-auto whitespace-pre-wrap break-words',
            mirrorBgClassName,
            editorClassName,
            minHeightClassName,
            maxHeightClassName,
          )}
        >
          {tokens.length === 0
            ? null
            : tokens.map((tok, i) =>
                tok.type === 'hashtag' ? (
                  <span key={`h-${i}`} className={HASHTAG_TEXT_CLASS}>
                    {tok.text}
                  </span>
                ) : (
                  <span key={`t-${i}`} className="text-slate-700">
                    {tok.text}
                  </span>
                ),
              )}
        </div>
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          disabled={disabled}
          maxLength={maxLength}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          onScroll={syncScroll}
          placeholder={placeholder}
          className={cn(
            'relative z-10 w-full resize-none overflow-y-auto whitespace-pre-wrap break-words bg-transparent text-transparent caret-slate-800 outline-none placeholder:text-slate-300',
            editorClassName,
            minHeightClassName,
            maxHeightClassName,
            'bg-transparent',
          )}
        />
      </div>
    );
  },
);
