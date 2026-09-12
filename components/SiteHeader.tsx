'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { nav, practiceNav } from '@/config/siteData';
import { ModeToggle, ThemeDropdown } from './theme/ThemeControls';
import { Close, Menu } from './ui/icons';

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const clearMoreTimer = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleMoreClose = useCallback(() => {
    clearMoreTimer();
    closeTimer.current = window.setTimeout(() => {
      setMoreOpen(false);
      closeTimer.current = null;
    }, 5000);
  }, [clearMoreTimer]);

  const openMore = useCallback(() => {
    clearMoreTimer();
    setMoreOpen(true);
  }, [clearMoreTimer]);

  const closeMore = useCallback(() => {
    clearMoreTimer();
    setMoreOpen(false);
  }, [clearMoreTimer]);

  useEffect(() => {
    setOpen(false);
    closeMore();
  }, [pathname, closeMore]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) closeMore();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMore();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [moreOpen, closeMore]);

  useEffect(() => () => clearMoreTimer(), [clearMoreTimer]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const mainLinks = nav.filter((item) => item.href !== '/contact');
  const contactLink = nav.find((item) => item.href === '/contact');
  const moreIsActive = practiceNav.some((item) => isActive(item.href));

  return (
    <>
      <header className="header">
        <div className="container header__inner">
          <Link href="/" className="brand" aria-label="Dr. Fran Gaik — home">
            <Image
              src="/brand/logo-amber.png"
              alt="Dr. Fran Gaik — handwritten signature"
              width={230}
              height={55}
              priority
              className="brand__logo"
            />
          </Link>

          <nav className="nav nav--center" aria-label="Primary">
            {mainLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav__link nav__link--caps${isActive(item.href) ? ' nav__link--active' : ''}`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
            {contactLink && (
              <Link
                href={contactLink.href}
                className={`nav__link nav__link--caps${isActive(contactLink.href) ? ' nav__link--active' : ''}`}
                aria-current={isActive(contactLink.href) ? 'page' : undefined}
              >
                {contactLink.label}
              </Link>
            )}
            <div
              ref={moreRef}
              className={`nav__more${moreIsActive ? ' nav__more--active' : ''}${moreOpen ? ' nav__more--open' : ''}`}
              onMouseEnter={openMore}
              onMouseLeave={scheduleMoreClose}
            >
              <button
                type="button"
                className="nav__more-trigger"
                aria-haspopup="true"
                aria-expanded={moreOpen}
                aria-controls="more-menu"
                onClick={() => {
                  if (moreOpen) closeMore();
                  else {
                    openMore();
                    scheduleMoreClose();
                  }
                }}
                onFocus={openMore}
              >
                More <span className="nav__more-chevron" aria-hidden>⌄</span>
              </button>
              {moreOpen && (
                <div id="more-menu" className="nav__more-menu" role="menu" aria-label="More pages">
                  {practiceNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      className="nav__more-link"
                      onClick={closeMore}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="header__actions">
            <ThemeDropdown />
            <ModeToggle />
            <Link href="/books" className="btn btn--primary btn--sm header__cta">
              Get the Book
            </Link>
            <button
              type="button"
              className="icon-btn burger"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="mobile-nav" role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="mobile-nav__head">
            <div className="mobile-nav__brand">
              <Image src="/brand/logo-amber.png" alt="" width={180} height={43} className="brand__logo" />
            </div>
            <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setOpen(false)}>
              <Close />
            </button>
          </div>
          <nav className="mobile-nav__links" aria-label="Mobile">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
                {item.label}
              </Link>
            ))}
            <span className="mobile-nav__label">More</span>
            {practiceNav.map((item) => (
              <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mobile-nav__foot">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <ThemeDropdown />
              <ModeToggle />
              <span className="muted" style={{ fontSize: 13 }}>Themes &amp; light/dark</span>
            </div>
            <Link href="/books" className="btn btn--primary">Get the Book</Link>
          </div>
        </div>
      )}
    </>
  );
}
