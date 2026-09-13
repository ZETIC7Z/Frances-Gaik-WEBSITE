'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { practiceNav } from '@/config/siteData';
import { PaletteSwatches } from './theme/PaletteMenu';
import { Book, Close, Dots, Home, Mail, Palette, Star, User } from './ui/icons';

type Sheet = 'more' | 'theme' | null;

/**
 * The phone navigation: a floating pill that hovers over the page instead of a
 * bar welded to the bottom edge. It carries the same shape as the rest of the
 * site's chrome (rounded, blurred, theme-lit), and — the part that makes it
 * worth having — it gets out of the way: reading down the page slides it off
 * the bottom of the screen, and any scroll back up brings it straight back. So
 * the pill is there when a visitor reaches for it and never covers the text
 * they are reading.
 *
 * "Theme" and "More" both raise their sheet out of the pill, so a menu opens
 * where the thumb already is. The theme sheet is the palette row the desktop
 * header shows; the More sheet lists the practice pages only — "Get the Book"
 * already lives in the header, one tap away at every width, and repeating it
 * here only made the sheet longer than the list it was meant to hold.
 */
export default function MobileNav() {
  const pathname = usePathname();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [hidden, setHidden] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const themeRef = useRef<HTMLButtonElement>(null);
  const lastY = useRef(0);
  const frame = useRef<number | null>(null);
  const openRef = useRef<Sheet>(null);

  openRef.current = sheet;

  const close = useCallback(() => setSheet(null), []);

  /* Slide away on the way down, come back on the way up. The sheet owns the
     pill's visibility while it is open — a menu must never detach from the
     control that opened it. */
  useEffect(() => {
    lastY.current = window.scrollY;

    const apply = () => {
      frame.current = null;
      const y = window.scrollY;
      const previous = lastY.current;
      lastY.current = y;
      if (openRef.current) {
        setHidden(false);
        return;
      }
      if (y < 80) setHidden(false);
      else if (y > previous + 4) setHidden(true);
      else if (y < previous - 4) setHidden(false);
    };

    const onScroll = () => {
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const onPointerDown = (event: PointerEvent) => {
      const node = event.target as Node;
      if (
        panelRef.current?.contains(node) ||
        moreRef.current?.contains(node) ||
        themeRef.current?.contains(node)
      ) {
        return;
      }
      close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const trigger = sheet === 'theme' ? themeRef : moreRef;
      close();
      trigger.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [sheet, close]);

  // Never leave a sheet hanging open across a navigation.
  useEffect(() => {
    close();
  }, [pathname, close]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const tabs = [
    { href: '/', label: 'Home', Icon: Home },
    { href: '/books', label: 'Books', Icon: Book },
    { href: '/reviews', label: 'Reviews', Icon: Star },
    { href: '/about', label: 'About', Icon: User },
    { href: '/contact', label: 'Contact', Icon: Mail },
  ];

  const moreActive = practiceNav.some((item) => isActive(item.href));

  return (
    <>
      {sheet && (
        <>
          <div className="fnav-scrim" onClick={close} aria-hidden />
          {sheet === 'more' ? (
            <div className="fnav-sheet" id="fnav-more" ref={panelRef} role="dialog" aria-label="More pages">
              <div className="fnav-sheet__head">
                <span className="fnav-sheet__title">Practice</span>
                <button type="button" className="icon-btn icon-btn--sm" onClick={close} aria-label="Close menu">
                  <Close size={16} />
                </button>
              </div>
              <nav className="fnav-sheet__links" aria-label="Practice pages">
                {practiceNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          ) : (
            <div className="fnav-sheet fnav-sheet--theme" id="fnav-theme" ref={panelRef} role="dialog" aria-label="Colour theme">
              <div className="fnav-sheet__head">
                <span className="fnav-sheet__title">Theme</span>
                <button type="button" className="icon-btn icon-btn--sm" onClick={close} aria-label="Close menu">
                  <Close size={16} />
                </button>
              </div>
              <PaletteSwatches />
            </div>
          )}
        </>
      )}

      <nav className={`fnav${hidden ? ' fnav--away' : ''}`} aria-label="Sections">
        <div className="fnav__pill">
          {tabs.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`fnav__tab${isActive(href) ? ' fnav__tab--active' : ''}`}
              aria-current={isActive(href) ? 'page' : undefined}
              aria-label={label}
            >
              <Icon size={21} />
              <span>{label}</span>
            </Link>
          ))}
          <button
            ref={themeRef}
            type="button"
            className={`fnav__tab${sheet === 'theme' ? ' fnav__tab--active' : ''}`}
            aria-expanded={sheet === 'theme'}
            aria-haspopup="dialog"
            aria-controls="fnav-theme"
            aria-label="Colour theme"
            onClick={() => setSheet((s) => (s === 'theme' ? null : 'theme'))}
          >
            {sheet === 'theme' ? <Close size={21} /> : <Palette size={21} />}
            <span>Theme</span>
          </button>
          <button
            ref={moreRef}
            type="button"
            className={`fnav__tab${moreActive || sheet === 'more' ? ' fnav__tab--active' : ''}`}
            aria-expanded={sheet === 'more'}
            aria-haspopup="dialog"
            aria-controls="fnav-more"
            aria-label="More pages"
            onClick={() => setSheet((s) => (s === 'more' ? null : 'more'))}
          >
            {sheet === 'more' ? <Close size={21} /> : <Dots size={21} />}
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
