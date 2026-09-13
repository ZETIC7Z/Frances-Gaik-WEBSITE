'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * The pill that returns the visitor to the top of the page once they have read
 * their way down it. It is deliberately the very last thing in the layout: it
 * belongs to the page's floor, and it stays out of the DOM's tab order's way
 * until it is actually useful (a hidden button that can still be focused is a
 * trap for keyboard users).
 */
export default function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let frame: number | null = null;
    const check = () => setShown(window.scrollY > window.innerHeight * 0.6);
    const onScroll = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        check();
      });
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  const toTop = useCallback(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }, []);

  return (
    <button
      type="button"
      className={`to-top${shown ? ' to-top--on' : ''}`}
      onClick={toTop}
      tabIndex={shown ? undefined : -1}
      aria-hidden={!shown}
      aria-label="Back to top"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 14.5 12 8.5l6 6" />
      </svg>
      <span>Back to top</span>
    </button>
  );
}
