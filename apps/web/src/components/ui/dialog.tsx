'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from './button';
import { Modal } from './modal';

export interface DialogAction {
  label: string;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  onClick?: () => void;
  /** Đẩy nút sang trái (side='left') hoặc phải (mặc định) khi có mix */
  side?: 'left' | 'right';
  disabled?: boolean;
  className?: string;
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  actions?: DialogAction[];
  /** Căn cả nhóm button — chỉ có tác dụng khi không có button nào dùng side */
  actionsAlign?: 'left' | 'center' | 'right';
  className?: string;
}

const groupAlign: Record<NonNullable<DialogProps['actionsAlign']>, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export function Dialog({
  open,
  onClose,
  title = 'Thông báo',
  children,
  actions,
  actionsAlign = 'center',
  className,
}: DialogProps) {
  const leftBtns = actions?.filter((a) => a.side === 'left') ?? [];
  const rightBtns = actions?.filter((a) => a.side !== 'left') ?? [];
  const isSplit = leftBtns.length > 0 && rightBtns.length > 0;

  return (
    <Modal open={open} onClose={onClose} {...(className !== undefined ? { className } : {})}>
      {/* Header: title centered + X absolute right */}
      <div className="relative flex items-center justify-center border-b border-border/60 px-10 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <button
          onClick={onClose}
          className="absolute right-3 rounded-md p-1.5 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      {children && (
        <div className="px-6 py-6 text-center text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      )}

      {/* Footer */}
      {actions && actions.length > 0 && (
        <div
          className={cn(
            'flex gap-2 border-t border-border/60 px-6 py-3',
            isSplit ? 'justify-between' : groupAlign[actionsAlign],
          )}
        >
          {isSplit ? (
            <>
              <div className="flex gap-2">
                {leftBtns.map((action, i) => (
                  <ActionButton key={i} action={action} />
                ))}
              </div>
              <div className="flex gap-2">
                {rightBtns.map((action, i) => (
                  <ActionButton key={i} action={action} />
                ))}
              </div>
            </>
          ) : (
            actions.map((action, i) => <ActionButton key={i} action={action} />)
          )}
        </div>
      )}
    </Modal>
  );
}

function ActionButton({ action }: { action: DialogAction }) {
  const isDefault = !action.variant || action.variant === 'default';
  return (
    <Button
      variant={action.variant ?? 'default'}
      size={action.size}
      onClick={action.onClick}
      disabled={action.disabled}
      className={cn(isDefault && 'bg-[#00aeec] hover:bg-[#00aeec]/90', action.className)}
    >
      {action.label}
    </Button>
  );
}
