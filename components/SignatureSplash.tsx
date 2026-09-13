'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkle } from './ui/icons';

/** How long the signature writes and holds before outro starts */
const HOLD_MS = 3500;
/** How long the outro transition takes */
const FADE_MS = 1100;

type Phase = 'showing' | 'outro' | 'hidden';

export function SplashGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('showing');

  // Multi-segment waypoints matching the handwriting of "Dr. Fran Gaik"
  const penKeyframes = useMemo(
    () => ({
      x: ['2%', '14%', '22%', '28%', '42%', '56%', '68%', '82%', '95%', '99%'],
      y: ['40%', '20%', '55%', '35%', '48%', '32%', '50%', '38%', '65%', '58%'],
    }),
    []
  );

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('hidden');
      return;
    }

    setPhase('showing');
    const timer = window.setTimeout(() => {
      setPhase((current) => (current === 'showing' ? 'outro' : current));
    }, HOLD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== 'outro') return;
    const timer = window.setTimeout(() => setPhase('hidden'), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // Any user interaction (click, key, touch, scroll) dismisses the splash
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

  // Lock scrolling while splash is visible
  useEffect(() => {
    document.body.classList.toggle('is-splashing', phase !== 'hidden');
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
            className={`splash ${phase === 'outro' ? 'splash--outro' : ''}`}
            role="status"
            aria-label="Dr. Fran Gaik — Author Intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Dark veil layer over the ambient video background */}
            <div className="splash__dark-veil" />

            {/* Ambient zen energy bloom */}
            <div className="splash__glow splash__glow--large" />

            {/* Floating Particles */}
            <div className="splash__particles">
              <div className="splash__particle" style={{ left: '10%', top: '20%', animationDelay: '0s' }} />
              <div className="splash__particle" style={{ left: '80%', top: '15%', animationDelay: '1s' }} />
              <div className="splash__particle" style={{ left: '25%', top: '75%', animationDelay: '0.5s' }} />
              <div className="splash__particle" style={{ left: '70%', top: '80%', animationDelay: '1.5s' }} />
              <div className="splash__particle" style={{ left: '50%', top: '10%', animationDelay: '2s' }} />
              <div className="splash__particle" style={{ left: '90%', top: '50%', animationDelay: '0.8s' }} />
            </div>

            {/* Radiant pulse rings */}
            <div className="splash__pulse-ring splash__pulse-ring--1" />
            <div className="splash__pulse-ring splash__pulse-ring--2" />

            {/* Cinematic Big Signature Writing Container */}
            <div className="splash__mark splash__mark--big">
              {/* Golden Ink Masked Artwork */}
              <div className="splash__ink">
                <Image
                  src="/brand/logo-amber.png"
                  alt="Dr. Fran Gaik — handwritten signature"
                  width={640}
                  height={153}
                  priority
                  sizes="(max-width: 640px) 92vw, 720px"
                  className="splash__logo-img"
                />
              </div>

              {/* Dynamic Traveling Pen Nib with Golden Spark Glow */}
              <motion.div
                className="splash__pen splash__pen--vivid"
                animate={{
                  left: penKeyframes.x,
                  top: penKeyframes.y,
                  opacity: [0, 1, 1, 1, 1, 1, 1, 1, 0.8, 0],
                  scale: [0.8, 1.25, 1, 1.3, 1, 1.25, 1, 1.15, 1.4, 0],
                }}
                transition={{
                  duration: 3.3,
                  ease: 'easeInOut',
                  times: [0, 0.12, 0.24, 0.38, 0.5, 0.64, 0.76, 0.88, 0.96, 1],
                  delay: 0.35,
                }}
              >
                <span className="splash__pen-core" />
                <span className="splash__pen-halo" />
                <Sparkle size={14} className="splash__pen-sparkle" />
              </motion.div>

              {/* Ink completion shimmer sweep */}
              <div className="splash__shimmer-sweep" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
