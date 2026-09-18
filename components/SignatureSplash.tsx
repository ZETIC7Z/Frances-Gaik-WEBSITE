'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/** Video is ~10.23 s — auto-dismiss just after it finishes */
const HOLD_MS = 10_300;
/** Duration of the outro fade (ms) */
const FADE_MS = 1200;

type Phase = 'showing' | 'outro' | 'hidden';

export function SplashGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('showing');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Desktop only — on mobile skip immediately (before hydration CSS also hides it)
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 ||
        window.matchMedia('(max-width: 767px)').matches ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
      setPhase('hidden');
      return;
    }

    setPhase('showing');
    // Fallback: dismiss after HOLD_MS if onEnded doesn't fire
    const timer = window.setTimeout(() => {
      setPhase((cur) => (cur === 'showing' ? 'outro' : cur));
    }, HOLD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Outro → hidden after fade
  useEffect(() => {
    if (phase !== 'outro') return;
    const timer = window.setTimeout(() => setPhase('hidden'), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // Any user interaction skips early
  useEffect(() => {
    if (phase !== 'showing') return;
    const dismiss = () => setPhase('outro');
    window.addEventListener('pointerdown', dismiss, { passive: true });
    window.addEventListener('keydown', dismiss);
    window.addEventListener('wheel', dismiss, { passive: true });
    window.addEventListener('touchstart', dismiss, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', dismiss);
      window.removeEventListener('keydown', dismiss);
      window.removeEventListener('wheel', dismiss);
      window.removeEventListener('touchstart', dismiss);
    };
  }, [phase]);

  // Lock scrolling while splash is active
  useEffect(() => {
    document.body.classList.toggle('is-splashing', phase !== 'hidden');
    return () => document.body.classList.remove('is-splashing');
  }, [phase]);

  // Natural outro when the video reaches its end
  const handleVideoEnded = () => {
    setPhase((cur) => (cur === 'showing' ? 'outro' : cur));
  };

  return (
    <>
      {children}

      <AnimatePresence>
        {phase !== 'hidden' && (
          <motion.div
            className={`splash ${phase === 'outro' ? 'splash--outro' : ''}`}
            role="status"
            aria-label="Dr. Frances Gaik — Intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Full-screen splash video — preload=auto with hardware GPU compositing */}
            <video
              ref={videoRef}
              src="/brand/splash.mp4"
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={handleVideoEnded}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            />

            {/* Cinematic vignette overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.60) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Skip hint */}
            <p
              style={{
                position: 'absolute',
                bottom: 28,
                right: 32,
                color: 'rgba(255,255,255,0.40)',
                fontSize: 12,
                letterSpacing: '0.08em',
                fontFamily: 'inherit',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              Click anywhere to skip
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}