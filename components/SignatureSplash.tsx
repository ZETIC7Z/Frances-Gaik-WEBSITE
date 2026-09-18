'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/** Duration of the outro fade into the main site (ms) */
const FADE_MS = 900;

type Phase = 'showing' | 'outro' | 'hidden';

export function SplashGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('showing');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Desktop only — on mobile skip immediately
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
  }, []);

  // Video playback management — strictly let the video fully finish before revealing main site
  useEffect(() => {
    if (phase === 'hidden') return;

    const video = videoRef.current;
    if (!video) return;

    let outroTriggered = false;
    const triggerOutro = () => {
      if (!outroTriggered) {
        outroTriggered = true;
        setPhase('outro');
      }
    };

    // When the video finishes playing completely to its last frame
    const handleEnded = () => {
      triggerOutro();
    };

    video.addEventListener('ended', handleEnded);

    // Fallback: only if video is completely stalled / errored for over 25 seconds
    const safetyTimer = window.setTimeout(() => {
      if (!video || video.ended || video.paused) {
        triggerOutro();
      }
    }, 25_000);

    // Ensure playback starts immediately
    video.playbackRate = 1.0;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }

    return () => {
      video.removeEventListener('ended', handleEnded);
      window.clearTimeout(safetyTimer);
    };
  }, [phase === 'hidden']);

  // Outro fade → hidden unmount, revealing the main site smoothly
  useEffect(() => {
    if (phase !== 'outro') return;
    const timer = window.setTimeout(() => {
      setPhase('hidden');
    }, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // Lock scrolling strictly while splash is actively showing — unlock immediately on outro or hidden
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (phase === 'showing') {
      document.body.classList.add('is-splashing');
    } else {
      document.body.classList.remove('is-splashing');
    }
    return () => {
      document.body.classList.remove('is-splashing');
    };
  }, [phase]);

  return (
    <>
      {children}

      <AnimatePresence>
        {phase !== 'hidden' && (
          <motion.div
            className="splash"
            role="status"
            aria-label="Dr. Frances Gaik — Intro"
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === 'outro' ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_MS / 1000, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              width: '100vw',
              height: '100vh',
              maxWidth: '100vw',
              maxHeight: '100vh',
              zIndex: 999999,
              background: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Centered responsive video wrapper — no scrollbars, 100% viewport contained */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                maxWidth: '100vw',
                maxHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <video
                ref={videoRef}
                src="/brand/splash.mp4"
                autoPlay
                muted
                playsInline
                preload="auto"
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  display: 'block',
                  margin: 'auto',
                  transform: 'translateZ(0)',
                  WebkitTransform: 'translateZ(0)',
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}