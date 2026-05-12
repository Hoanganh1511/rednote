'use client';

import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChannelMessageDrawerProps {
  open: boolean;
  onClose: () => void;
  userDisplayName: string;
}

export function ChannelMessageDrawer({
  open,
  onClose,
  userDisplayName,
}: ChannelMessageDrawerProps) {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Implement message sending
      setMessage('');
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[80] bg-black/40 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-[90] w-full max-w-sm bg-background flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] will-change-transform',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-drawer-title"
      >
        {/* Header */}
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 id="message-drawer-title" className="font-semibold text-slate-900">
            {userDisplayName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-auto px-4 py-4">
          <p className="text-xs text-slate-500 text-center">
            Chức năng tin nhắn sắp có
          </p>
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Nhắn tin..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="p-2 hover:bg-slate-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send"
            >
              <Send className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
