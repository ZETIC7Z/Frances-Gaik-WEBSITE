'use client';

import { useEffect, useRef } from 'react';

/**
 * Cursor leaf trail — while the pointer moves across the page, small leaves
 * (the same shape/color as the falling leaves in the ambient background) peel
 * off the cursor, drift sideways and fade out.
 *
 * Everything is done imperatively over a fixed pool of nodes so pointer moves
 * never trigger React renders, and the pool is reused instead of creating and
 * destroying DOM. Skipped for touch-only devices and prefers-reduced-motion.
 */
const POOL_DESKTOP = 26;
const POOL_TOUCH_CAPABLE = 16;
const MIN_MOVE_PX = 10;
const MIN_GAP_MS = 50;
const FAST_MOVE_PX = 46;

export default function CursorLeaves() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // No cursor on touch-only devices — the trail would never make sense there.
    if (window.matchMedia('(hover: none)').matches) return;

    const poolSize = window.innerWidth <= 768 ? POOL_TOUCH_CAPABLE : POOL_DESKTOP;
    const pool: HTMLSpanElement[] = [];
    for (let i = 0; i < poolSize; i += 1) {
      const leaf = document.createElement('span');
      leaf.className = 'cursor-leaf';
      host.appendChild(leaf);
      pool.push(leaf);
    }

    let nextIndex = 0;
    let lastX = 0;
    let lastY = 0;
    let lastAt = 0;
    let seenPointer = false;
    let frame: number | null = null;
    let pending: { x: number; y: number } | null = null;

    const spawnLeaf = (x: number, y: number, speed: number) => {
      const leaf = pool[nextIndex];
      nextIndex = (nextIndex + 1) % pool.length;

      const size = 7 + Math.random() * 8;
      const drift = (Math.random() - 0.34) * (70 + speed * 1.4);
      const fall = 62 + Math.random() * 78;
      const spin = 200 + Math.random() * 320;
      const duration = 1 + Math.random() * 0.75;
      const opacity = 0.4 + Math.random() * 0.5;

      leaf.style.left = `${x.toFixed(1)}px`;
      leaf.style.top = `${y.toFixed(1)}px`;
      leaf.style.setProperty('--leaf-size', `${size.toFixed(1)}px`);
      leaf.style.setProperty('--leaf-drift', `${drift.toFixed(1)}px`);
      leaf.style.setProperty('--leaf-fall', `${fall.toFixed(1)}px`);
      leaf.style.setProperty('--leaf-spin', `${spin.toFixed(0)}deg`);
      leaf.style.setProperty('--leaf-dur', `${duration.toFixed(2)}s`);
      leaf.style.setProperty('--leaf-opacity', opacity.toFixed(2));

      // Restart the fall animation for this pool node.
      leaf.classList.remove('cursor-leaf--live');
      void leaf.offsetWidth;
      leaf.classList.add('cursor-leaf--live');
    };

    const paint = () => {
      frame = null;
      const point = pending;
      pending = null;
      if (!point) return;

      const at = performance.now();
      if (seenPointer) {
        const dx = point.x - lastX;
        const dy = point.y - lastY;
        const distance = Math.hypot(dx, dy);
        if (distance < MIN_MOVE_PX || at - lastAt < MIN_GAP_MS) return;
        // Fast cursor: still only one leaf per frame, but let it fling further.
        lastX = point.x;
        lastY = point.y;
        lastAt = at;
        spawnLeaf(point.x, point.y, Math.min(distance, FAST_MOVE_PX * 3));
        return;
      }

      seenPointer = true;
      lastX = point.x;
      lastY = point.y;
      lastAt = at;
      spawnLeaf(point.x, point.y, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      pending = { x: event.clientX, y: event.clientY };
      if (frame === null) frame = window.requestAnimationFrame(paint);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (frame !== null) window.cancelAnimationFrame(frame);
      for (const leaf of pool) leaf.remove();
    };
  }, []);

  return <div className="cursor-leaves" ref={hostRef} aria-hidden="true" />;
}
