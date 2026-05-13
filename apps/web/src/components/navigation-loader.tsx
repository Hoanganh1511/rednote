'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const NavigationLoadingContext = createContext<boolean>(false);

export function NavigationLoaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  // Detect pathname changes (navigation complete)
  useEffect(() => {
    setIsLoading(false);
    // Keep showing loader for at least 300ms for visibility
    setTimeout(() => setShowLoader(false), 300);
  }, [pathname]);

  // Global click handler for all links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href && !link.target && !link.hasAttribute('data-no-loader')) {
        const url = new URL(link.href);
        // Only show loader for local navigation
        if (url.origin === window.location.origin) {
          setIsLoading(true);
          // Show loader after 100ms to avoid flicker on fast navigation
          setTimeout(() => setShowLoader(true), 100);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <NavigationLoadingContext.Provider value={isLoading}>
      {children}
      {showLoader && (
        <div className="fixed inset-x-0 top-3 z-[999] flex justify-center pointer-events-none">
          <div
            className="h-[18px] w-[18px] rounded-full animate-spin"
            style={{
              background: 'conic-gradient(from 0deg, #00aeec, #ffffff, #00aeec)',
              padding: '2px',
            }}
          >
            <div className="h-full w-full rounded-full bg-transparent" />
          </div>
        </div>
      )}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading() {
  return useContext(NavigationLoadingContext);
}
