import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useNavigationLoading } from '@/components/navigation-loader';

export function useNavigationWithLoader() {
  const router = useRouter();
  const { showLoader } = useNavigationLoading();

  const push = useCallback(
    (href: string) => {
      // Show loader before navigation
      showLoader();

      // Navigate after a small delay to ensure loader is visible
      setTimeout(() => {
        router.push(href);
      }, 50);
    },
    [router, showLoader],
  );

  const replace = useCallback(
    (href: string) => {
      showLoader();

      setTimeout(() => {
        router.replace(href);
      }, 50);
    },
    [router, showLoader],
  );

  return { push, replace, back: router.back, forward: router.forward, refresh: router.refresh };
}
