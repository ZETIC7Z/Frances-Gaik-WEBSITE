'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nav, practiceNav } from '@/config/siteData';

/**
 * Quietly warms every route in the nav once the intro has cleared, so the first
 * click on any page in the header resolves from cache instead of waiting on a
 * cold render (which is exactly what happens on a dev server). Runs on idle and
 * only once per mount; failures are ignored — the real navigation still works.
 */
export default function RouteWarmup() {
  const router = useRouter();

  useEffect(() => {
    const hrefs = [...nav, ...practiceNav].map((item) => item.href);
    let cancelled = false;

    const warm = () => {
      if (cancelled) return;
      for (const href of hrefs) {
        try {
          router.prefetch(href);
        } catch {
          /* nothing to recover — navigation falls back to a normal request */
        }
      }
    };

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(warm, { timeout: 2500 })
      : window.setTimeout(warm, 1200);

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle as number);
      window.clearTimeout(idle as number);
    };
  }, [router]);

  return null;
}
