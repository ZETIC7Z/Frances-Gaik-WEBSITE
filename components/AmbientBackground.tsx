'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

type Star = { x: number; y: number; size: number; delay: number; dur: number };
type Meteor = { x: number; y: number; delay: number; dur: number };
type LeafParticle = { x: number; size: number; delay: number; dur: number; drift: number; rotate: number; opacity: number };

/** Deterministic PRNG so server and client markup agree (no hydration mismatch). */
function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The nature scene is now a looping film: the supplied clip, re-encoded to a
 * silent, seamless, 1600×900 H.264 loop (640 KB, `faststart`, poster frame) by
 * `scripts/build-ambient-video.mjs`. It sits at the base of the stack, so every
 * theme glow — aurora, wash, orbs, mist, leaves — still paints above it, and it
 * drifts with the pointer exactly as the drawn scene did (same 3D parallax).
 */
/**
 * The film is asked for by a name that looks like nothing to download. A URL
 * ending in `.mp4` was being intercepted by download managers and by browsers
 * set to "always download video files", so the backdrop came up as a save
 * dialog instead of playing; `/media/ambient` is a rewrite onto the same static
 * asset, still served as `video/mp4` with `Content-Disposition: inline` (see
 * `next.config.mjs`).
 */
const FILM_SRC = '/media/ambient';
const FILM_POSTER = '/video/ambient-poster.jpg';

export default function AmbientBackground() {
  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const sceneRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const pointerFrame = useRef<number | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 768px)');
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setIsMobile(mqMobile.matches);
      setReduced(mqReduced.matches);
    };
    update();
    mqMobile.addEventListener('change', update);
    mqReduced.addEventListener('change', update);
    return () => {
      mqMobile.removeEventListener('change', update);
      mqReduced.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || reduced) {
      if (scene) {
        scene.style.setProperty('--parallax-x', '0px');
        scene.style.setProperty('--parallax-y', '0px');
      }
      return;
    }

    const paint = () => {
      pointerFrame.current = null;
      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      scene.style.setProperty('--parallax-x', `${current.current.x.toFixed(2)}px`);
      scene.style.setProperty('--parallax-y', `${current.current.y.toFixed(2)}px`);
      if (Math.abs(target.current.x - current.current.x) > 0.05 || Math.abs(target.current.y - current.current.y) > 0.05) {
        pointerFrame.current = window.requestAnimationFrame(paint);
      }
    };

    const queuePaint = () => {
      if (pointerFrame.current === null) pointerFrame.current = window.requestAnimationFrame(paint);
    };
    const onPointerMove = (event: PointerEvent) => {
      target.current.x = (event.clientX / window.innerWidth - 0.5) * 24;
      target.current.y = (event.clientY / window.innerHeight - 0.5) * 16;
      queuePaint();
    };
    const onPointerLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
      queuePaint();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      if (pointerFrame.current !== null) window.cancelAnimationFrame(pointerFrame.current);
      pointerFrame.current = null;
    };
  }, [reduced]);

  /* Keep the film cheap: it only plays when the document is visible and when
     motion is welcome. The poster remains visible while the tab is hidden.
     Do not call `load()` on every visibility update: reloading a looping video
     can reset it to the poster and makes a live preview look frozen. */
  useEffect(() => {
    const film = filmRef.current;
    if (!film) return;

    const play = () => {
      if (reduced || !pageVisible) {
        film.pause();
        return;
      }
      const started = film.play();
      if (started) started.catch(() => {});
    };

    /* React can run this effect before the browser has attached the source;
       retry once metadata is ready so autoplay is dependable on a cold load. */
    film.addEventListener('loadedmetadata', play, { once: true });
    play();
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      film.removeEventListener('loadedmetadata', play);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [pageVisible, reduced]);

  const stars = useMemo<Star[]>(() => {
    const rand = mulberry(20260912);
    const count = isMobile ? 16 : 38;
    return Array.from({ length: count }, (_, i) => ({
      x: rand() * 100,
      y: rand() * 100,
      size: 1 + rand() * 2.2,
      delay: rand() * 5,
      dur: 2.6 + rand() * 3.4 + (i % 7) * 0.3,
    }));
  }, [isMobile]);

  const meteors = useMemo<Meteor[]>(() => {
    const rand = mulberry(777001);
    const count = isMobile ? 1 : 2;
    return Array.from({ length: count }, () => ({
      x: 10 + rand() * 80,
      y: rand() * 30,
      delay: rand() * 14,
      dur: 4.5 + rand() * 3,
    }));
  }, [isMobile]);

  const leaves = useMemo<LeafParticle[]>(() => {
    const rand = mulberry(5012026);
    const count = isMobile ? 9 : 18;
    return Array.from({ length: count }, () => ({
      x: rand() * 100,
      size: 7 + rand() * 8,
      delay: -(rand() * 16),
      dur: 12 + rand() * 12,
      drift: -14 + rand() * 28,
      rotate: 260 + rand() * 360,
      opacity: 0.22 + rand() * 0.3,
    }));
  }, [isMobile]);

  return (
    <div className={`ambient${reduced ? ' ambient--reduced' : ''}`} aria-hidden="true">
      {/* The nature background: the looping film, parallaxed and theme-tinted. */}
      <div className="ambient__film" ref={sceneRef}>
        <video
          className="ambient__video"
          ref={filmRef}
          poster={FILM_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
        >
          <source src={FILM_SRC} type="video/mp4" />
        </video>
        <span className="ambient__film-tint" />
      </div>

      {/* Aurora glow: theme-tinted shadows orbiting the viewport (CodePen zwaZJv) */}
      <div className="ambient__aurora" />
      <div className="ambient__grid" />
      <div className="ambient__wash" />
      <div className="ambient__mist ambient__mist--a" />
      <div className="ambient__mist ambient__mist--b" />
      <div className="ambient__orb ambient__orb--a" style={reduced ? undefined : { animation: 'orb-a 26s ease-in-out infinite' }} />
      <div className="ambient__orb ambient__orb--b" style={reduced ? undefined : { animation: 'orb-b 32s ease-in-out infinite' }} />
      <div className="ambient__orb ambient__orb--c" style={reduced ? undefined : { animation: 'orb-c 38s ease-in-out infinite' }} />
      <div className="ambient__leaves">
        {leaves.map((leaf, i) => (
          <span
            key={i}
            className="ambient__leaf"
            style={{
              left: `${leaf.x}%`,
              width: `${leaf.size}px`,
              height: `${leaf.size * 0.62}px`,
              animationDelay: `${leaf.delay}s`,
              animationDuration: `${leaf.dur}s`,
              opacity: leaf.opacity,
              '--leaf-drift': `${leaf.drift}vw`,
              '--leaf-rotate': `${leaf.rotate}deg`,
            } as CSSProperties}
          />
        ))}
      </div>
      {stars.map((s, i) => (
        <span
          key={i}
          className="ambient__star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: 0.2 + (s.size / 3.2) * 0.5,
            animation: reduced ? undefined : `star-pulse ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      {meteors.map((m, i) => (
        <span
          key={i}
          className="ambient__meteor"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            animation: reduced ? undefined : `meteor-fly ${m.dur}s linear ${m.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
