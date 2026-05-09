'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Trash2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog } from '@/components/ui/dialog';
import { notify } from '@/stores/notification-store';

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 20;

export function SearchDropdown() {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  // Lock body scroll when overlay is rendered
  useEffect(() => {
    if (!rendered) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [rendered]);

  // Auto-focus input when overlay becomes visible
  useEffect(() => {
    if (!visible || !inputRef.current) return;

    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [visible]);

  const handleOpen = () => {
    setRendered(true);
    requestAnimationFrame(() => setVisible(true));
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setRendered(false);
      setQuery('');
    }, 300);
  };

  const handleSearch = () => {
    if (!query.trim()) return;

    // Add to history (avoid duplicates, move to front)
    const newHistory = [query, ...history.filter(h => h !== query)].slice(0, MAX_HISTORY);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));

    // TODO: navigate to full search results page with query
    handleClose();
  };

  const handleHistoryClick = (term: string) => {
    setQuery(term);
    // Optional: auto-search on click, or let user press Enter
    // handleSearch();
  };

  const handleDeleteHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    setShowDeleteConfirm(false);
    notify.info('Xóa lịch sử tìm kiếm thành công');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <>
      {/* Trigger input in header */}
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
        <input
          type="search"
          placeholder="Tìm kiếm"
          readOnly
          onClick={handleOpen}
          className="border-input bg-muted focus:ring-ring h-10 w-full rounded-full border pr-4 pl-9 text-base md:text-sm focus:ring-2 focus:outline-none transition-colors cursor-pointer"
        />
      </div>

      {/* Full-screen overlay */}
      {rendered && (
        <div
          className={cn(
            'fixed inset-0 z-modal bg-background flex flex-col transition-all duration-300',
            visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full',
          )}
        >
          {/* Header */}
          <div className="border-border flex items-center gap-3 h-16 px-4 border-b shrink-0">
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <input
              ref={inputRef}
              type="search"
              placeholder="Tìm kiếm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-input bg-muted h-10 flex-1 rounded-full border px-4 text-base focus:outline-none focus:ring-2 focus:ring-[#00aeec]"
            />

            <button
              onClick={handleSearch}
              disabled={!query.trim()}
              className="shrink-0 text-sm font-medium text-[#00aeec] transition-opacity hover:opacity-70 disabled:opacity-40"
            >
              Tìm kiếm
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 pt-5">
            {/* History section header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Lịch sử tìm kiếm</h2>
              {history.length > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Delete history"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* History tags */}
            {history.length > 0 ? (
              <div className="flex flex-wrap gap-x-2 gap-y-1.5">
                {history.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleHistoryClick(term)}
                    className="bg-gray-100 text-foreground text-sm px-3 py-1 rounded-sm transition-colors hover:bg-gray-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-muted-foreground">
                <Search className="h-8 w-8 opacity-30" />
                <p className="text-sm">Chưa có lịch sử tìm kiếm</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Thông báo"
        actions={[
          { label: 'Hủy', variant: 'outline', onClick: () => setShowDeleteConfirm(false) },
          { label: 'Xóa', onClick: handleDeleteHistory },
        ]}
      >
        Bạn có chắc muốn xóa toàn bộ lịch sử tìm kiếm không?
      </Dialog>

    </>
  );
}
