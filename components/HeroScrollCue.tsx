'use client';

import { useEffect, useState } from 'react';

/**
 * Scroll cue that lives inside the hero (not pinned to the viewport). It fades
 * and slides away the first time the visitor scrolls, and stays gone.
 */
export function HeroScrollCue() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let frame: number | null = null;

    const check = () => {
      if (window.scrollY > 40) setHidden(true);
    };
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

  return (
    <div className={`hero__scroll-cue${hidden ? ' hero__scroll-cue--out' : ''}`}>
      <span className="hero__scroll-cue__inner">
        <span className="hero__scroll-wheel" />
        <span className="hero__scroll-label">Scroll to explore</span>
      </span>
    </div>
  );
}
