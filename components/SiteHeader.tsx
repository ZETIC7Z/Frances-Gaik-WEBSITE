'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { nav, practiceNav } from '@/config/siteData';
import PaletteMenu, { PaletteSwatches } from './theme/PaletteMenu';
import { Menu, Close, ArrowRight, Sparkle, Book } from './ui/icons';

export default function SiteHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    }, 4000);
  }, [clearMoreTimer]);

  const openMore = useCallback(() => {
    clearMoreTimer();
    setMoreOpen(true);
  }, [clearMoreTimer]);

  const closeMore = useCallback(() => {
    clearMoreTimer();
    setMoreOpen(false);
  }, [clearMoreTimer]);

  // Close menus on route change
  useEffect(() => {
    closeMore();
    setIsMobileMenuOpen(false);
  }, [pathname, closeMore]);

  // Click outside to close desktop More dropdown
  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        closeMore();
      }
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

  const allLinks = nav as readonly { label: string; href: string }[];
  const mainLinks = allLinks.filter((item) => item.href !== '/contact');
  const contactLink = allLinks.find((item) => item.href === '/contact');
  const moreIsActive = practiceNav.some((item) => isActive(item.href));

  return (
    <header className={`fnav-header ${isScrolled ? 'fnav-header--scrolled' : ''}`}>
      {/* Floating pill navigation */}
      <nav
        className={`fnav-pill ${isScrolled ? 'fnav-pill--scrolled' : ''}`}
        aria-label="Primary"
      >
        <div className="fnav-pill__inner">
          {/* Brand */}
          <Link href="/" className="fnav-brand" aria-label="Dr. Fran Gaik — home">
            <div className="fnav-brand__avatar">
              <Image
                src="/brand/buddha-mark.png"
                alt="Dr. Fran Gaik avatar"
                width={40}
                height={40}
                className="fnav-brand__avatar-img"
              />
            </div>
            <Image
              src="/brand/logo-amber.png"
              alt="Dr. Fran Gaik — signature"
              width={200}
              height={48}
              priority
              className="fnav-brand__logo"
            />
          </Link>

          {/* Desktop Capsule Nav */}
          <div
            className="fnav-capsule"
            onMouseLeave={() => setHoveredLink(null)}
          >
            {mainLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`fnav-link ${active ? 'fnav-link--active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onMouseEnter={() => setHoveredLink(item.href)}
                >
                  {hoveredLink === item.href && (
                    <motion.div
                      layoutId="nav-hover-pill"
                      className="fnav-link__hover-pill"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="fnav-link__text">{item.label}</span>
                  {active && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="fnav-link__active-dot"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}

            {contactLink && (
              <Link
                href={contactLink.href}
                className={`fnav-link ${isActive(contactLink.href) ? 'fnav-link--active' : ''}`}
                aria-current={isActive(contactLink.href) ? 'page' : undefined}
                onMouseEnter={() => setHoveredLink(contactLink.href)}
              >
                {hoveredLink === contactLink.href && (
                  <motion.div
                    layoutId="nav-hover-pill"
                    className="fnav-link__hover-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="fnav-link__text">{contactLink.label}</span>
                {isActive(contactLink.href) && (
                  <motion.span
                    layoutId="nav-active-dot"
                    className="fnav-link__active-dot"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </Link>
            )}

            {/* Desktop More dropdown */}
            <div
              ref={moreRef}
              className={`fnav-more ${moreIsActive ? 'fnav-more--active' : ''}`}
              onMouseEnter={openMore}
              onMouseLeave={scheduleMoreClose}
            >
              <button
                type="button"
                className={`fnav-link fnav-more__trigger ${moreOpen || moreIsActive ? 'fnav-link--active' : ''}`}
                aria-haspopup="true"
                aria-expanded={moreOpen}
                aria-controls="fnav-more-menu"
                onMouseEnter={() => setHoveredLink('more')}
                onClick={() => (moreOpen ? closeMore() : (openMore(), scheduleMoreClose()))}
                onFocus={openMore}
              >
                {hoveredLink === 'more' && (
                  <motion.div
                    layoutId="nav-hover-pill"
                    className="fnav-link__hover-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="fnav-link__text">
                  More
                  <motion.span
                    className="fnav-more__chevron"
                    animate={{ rotate: moreOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    aria-hidden
                  >
                    ⌄
                  </motion.span>
                </span>
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    id="fnav-more-menu"
                    className="fnav-more__menu"
                    role="menu"
                    aria-label="Practice pages"
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="fnav-more__header">PRACTICE & CLINICAL</div>
                    {practiceNav.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        className={`fnav-more__item ${isActive(item.href) ? 'fnav-more__item--active' : ''}`}
                        onClick={closeMore}
                      >
                        <span>{item.label}</span>
                        <ArrowRight size={13} className="fnav-more__item-arrow" />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="fnav-actions">
            <PaletteMenu />
            <Link
              href="/books"
              className="btn btn--primary btn--sm fnav-cta"
            >
              <Book size={14} className="fnav-cta__icon" />
              <span>Get the Book</span>
              <ArrowRight size={13} className="fnav-cta__arrow" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="fnav-mobile-toggle"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <Close size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fnav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="fnav-drawer"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="fnav-drawer__head">
                <span className="fnav-drawer__brand">Dr. Fran Gaik</span>
                <button
                  type="button"
                  className="icon-btn icon-btn--sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <Close size={16} />
                </button>
              </div>

              {/* Primary Links */}
              <div className="fnav-drawer__section">
                <span className="fnav-drawer__section-title">Navigation</span>
                <div className="fnav-drawer__links">
                  {allLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`fnav-drawer__link ${isActive(item.href) ? 'fnav-drawer__link--active' : ''}`}
                    >
                      <span>{item.label}</span>
                      <ArrowRight size={16} className="fnav-drawer__arrow" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Practice Submenu */}
              <div className="fnav-drawer__section">
                <span className="fnav-drawer__section-title">Practice & Resources</span>
                <div className="fnav-drawer__links">
                  {practiceNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`fnav-drawer__link fnav-drawer__link--sub ${isActive(item.href) ? 'fnav-drawer__link--active' : ''}`}
                    >
                      <span>{item.label}</span>
                      <ArrowRight size={14} className="fnav-drawer__arrow" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Color Theme Selector in Drawer */}
              <div className="fnav-drawer__section">
                <PaletteSwatches />
              </div>

              {/* Mobile CTA */}
              <div className="fnav-drawer__footer">
                <Link
                  href="/books"
                  className="btn btn--primary fnav-drawer__cta"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Book size={16} />
                  <span>Get the Book</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
