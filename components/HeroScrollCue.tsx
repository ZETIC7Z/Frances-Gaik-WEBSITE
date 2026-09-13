'use client';

import { useEffect, useState } from 'react';

/**
 * The hero's scroll cue. It sits inside the hero (not pinned to the viewport)
 * and fades out as soon as the visitor leaves the top of the page — then
 * fades back in when they return there, so the invitation is always available
 * on the page's opening screen rather than being spent on the first scroll.
 */
export function HeroScrollCue() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let frame: number | null = null;

    const check = () => setHidden(window.scrollY > 40);
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
        <span className="hero__scroll-label hero__scroll-label--desktop">Scroll to discover</span>
        <span className="hero__scroll-label hero__scroll-label--mobile">Swipe down to discover</span>
      </span>
    </div>
  );
}
