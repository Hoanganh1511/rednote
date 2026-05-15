'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

const SPRING = { type: 'spring', stiffness: 380, damping: 38, mass: 0.8 } as const;

interface SheetContentProps {
  open: boolean;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  title?: string;
}

export function SheetContent({
  open,
  children,
  className,
  onClose,
  title = 'Panel',
}: SheetContentProps) {
  return (
    <DialogPrimitive.Portal forceMount>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                key="sheet-overlay"
                className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
              />
            </DialogPrimitive.Overlay>

            {/* Panel */}
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                key="sheet-content"
                className={cn(
                  'fixed right-0 top-0 z-[61] flex h-full w-[420px] max-w-[95vw] flex-col',
                  'bg-background shadow-2xl outline-none',
                  className,
                )}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={SPRING}
              >
                {/* Visually hidden title for screen readers */}
                <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>

                {children}

                <DialogPrimitive.Close
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Đóng"
                >
                  <X className="h-4 w-4" />
                </DialogPrimitive.Close>
              </motion.div>
            </DialogPrimitive.Content>
          </>
        )}
      </AnimatePresence>
    </DialogPrimitive.Portal>
  );
}
