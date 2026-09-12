'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

/** How long the signature holds the screen before it fades away. */
const HOLD_MS = 4200;
/** How long the overlay is kept mounted after the fade starts (CSS: 1.05s). */
const FADE_MS = 1200;
/**
 * When hydration lands after this point the CSS safety net has already started
 * fading the panel off the page, so there is nothing left to hold: the overlay
 * is dropped immediately rather than faded a second time.
 */
const CSS_TIMELINE_MS = 6000;
/** Remembers the intro for the rest of the tab, so later page loads are instant. */
const SEEN_KEY = 'fg-intro-played';

type Phase = 'showing' | 'outro' | 'hidden';

/**
 * The once-per-session decision is made at module scope, not in a ref: React
 * StrictMode mounts effects twice, and a ref-based guard would let the second
 * pass clear the hold timer that the first pass created (leaving a splash that
 * never leaves on its own). The decision is idempotent here, so both passes
 * agree to play the intro and only the last timer survives.
 */
let introDecision: 'pending' | 'play' | 'skip' = 'pending';

/**
 * Signature intro — the author's REAL signature artwork (their supplied SVG,
 * exported as amber PNG) writes itself: a left-to-right ink reveal with a
 * travelling pen-glow, starting at "Dr." and finishing with the tail.
 *
 * The splash is server-rendered and its whole write-on timeline is CSS, so it
 * literally is the first thing painted and it animates even before hydration.
 * The full site is painted underneath it from that same frame, so the intro
 * always ends as a plain cross-fade — no black-out, no second reveal. The exit
 * is a plain opacity transition on the panel, which the component starts early
 * on a skip and which the CSS timer also runs, so no late hand-over can replay
 * a finished fade and flash the signature back.
 *
 * It plays once per tab session, and any click, key or scroll skips it, so the
 * intro never stands between a visitor and a one-click page change. Visitors
 * who prefer reduced motion never see it at all.
 */
export function SplashGate({ children }: { children: React.ReactNode }) {
  // Starts true: the splash belongs to the very first paint, not to hydration.
  const [phase, setPhase] = useState<Phase>('showing');

  // Decide whether this visit gets an intro at all, then run the hold timer.
  useEffect(() => {
    if (introDecision === 'pending') {
      let seen = false;
      try {
        seen = window.sessionStorage.getItem(SEEN_KEY) === '1';
        window.sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        /* storage unavailable — the intro simply plays again */
      }
      introDecision =
        seen ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        performance.now() > CSS_TIMELINE_MS
          ? 'skip'
          : 'play';
    }

    if (introDecision === 'skip') {
      setPhase('hidden');
      return;
    }

    const timer = window.setTimeout(() => {
      setPhase((current) => (current === 'showing' ? 'outro' : current));
    }, HOLD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // The fade-out plays, then the overlay unmounts.
  useEffect(() => {
    if (phase !== 'outro') return;
    const timer = window.setTimeout(() => setPhase('hidden'), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // Any interaction during the hold starts the fade instead of being eaten.
  useEffect(() => {
    if (phase !== 'showing') return;
    const skip = () => setPhase((current) => (current === 'showing' ? 'outro' : current));
    const options = { passive: true } as const;
    window.addEventListener('pointerdown', skip, options);
    window.addEventListener('keydown', skip);
    window.addEventListener('wheel', skip, options);
    window.addEventListener('touchstart', skip, options);
    return () => {
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchstart', skip);
    };
  }, [phase]);

  // Lock scrolling while the splash owns the screen. Applied from JavaScript
  // only (never server-rendered), so a visitor without JavaScript is never
  // locked out of the page the CSS timeline has already uncovered.
  useEffect(() => {
    document.body.classList.toggle('is-splashing', phase !== 'hidden');
  }, [phase]);

  return (
    <>
      {children}

      {phase !== 'hidden' && (
        <div
          className={`splash${phase === 'outro' ? ' splash--outro' : ''}`}
          role="status"
          aria-label="Dr. Fran Gaik — Author"
        >
          <div className="splash__glow" />

          <div className="splash__mark">
            <div className="splash__ink">
              <Image
                src="/brand/logo-amber.png"
                alt="Dr. Fran Gaik — handwritten signature"
                width={494}
                height={118}
                priority
                sizes="(max-width: 640px) 88vw, 494px"
              />
            </div>

            {/* Pen-tip glow travelling along the writing line */}
            <span className="splash__pen" />
          </div>

          <p className="splash__sub">Author &nbsp;•&nbsp; Managing Depression with Qigong</p>
          <div className="splash__rule" />
        </div>
      )}
    </>
  );
}
