'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1606857521331-446a6e0e6af1?w=1200&h=300&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=300&fit=crop',
  'https://images.unsplash.com/photo-1557672172-298e090d0f80?w=1200&h=300&fit=crop',
  'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=1200&h=300&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-82f5486fbc13?w=1200&h=300&fit=crop',
  'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=1200&h=300&fit=crop',
  'https://images.unsplash.com/photo-1490300967868-a0a03bb94349?w=1200&h=300&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=300&fit=crop',
];

interface CoverImageSelectorDrawerProps {
  open: boolean;
  onClose: () => void;
  onCoverSelected?: (url: string) => void;
}

export function CoverImageSelectorDrawer({ open, onClose, onCoverSelected }: CoverImageSelectorDrawerProps) {
  const [drawerIn, setDrawerIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCover, setSelectedCover] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setDrawerIn(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      setDrawerIn(true);
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const handleCoverSelect = async (coverUrl: string) => {
    setSelectedCover(coverUrl);
    setIsLoading(true);
    try {
      await apiClient.patch('/users/me', { coverUrl });
      onCoverSelected?.(coverUrl);
      closeDrawer();
      toast.success('Cập nhật ảnh bìa thành công');
    } catch {
      toast.error('Không thực hiện được. Thử lại sau.');
      setSelectedCover(null);
    } finally {
      setIsLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerIn(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/50 transition-opacity duration-300 ${
          drawerIn ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          pointerEvents: drawerIn ? 'auto' : 'none',
        }}
        onClick={closeDrawer}
      />

      {/* Drawer - Bottom */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[9999] bg-background rounded-t-2xl shadow-lg transition-transform duration-300 will-change-transform ${
          drawerIn ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          WebkitTransform: drawerIn ? 'translateY(0)' : 'translateY(100%)',
          WebkitTransition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Chọn ảnh bìa</h2>
          <button
            onClick={closeDrawer}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-6">
            {PRESET_COVERS.map((coverUrl, idx) => (
              <button
                key={idx}
                onClick={() => handleCoverSelect(coverUrl)}
                disabled={isLoading && selectedCover !== coverUrl}
                className={cn(
                  'relative overflow-hidden rounded-[12px] aspect-video transition-all duration-200',
                  selectedCover === coverUrl && isLoading ? 'ring-2 ring-[#00A1D6] opacity-60' : 'hover:opacity-80',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                <img
                  src={coverUrl}
                  alt={`Cover ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                {selectedCover === coverUrl && isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
