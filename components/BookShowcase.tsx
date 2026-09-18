'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { books, reviewsForBook } from '@/config/siteData';
import type { Book } from '@/config/siteData';
import { storeLogoFor } from '@/config/storeLogos';
import { ArrowRight, Close } from './ui/icons';
import ReviewWall from './ReviewWall';

function RatingLabel({ rating, stars }: { rating?: string; stars?: number }) {
  if (!rating) return null;
  return (
    <span className="rating" aria-label={rating}>
      {typeof stars === 'number' && <i aria-hidden>{'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}</i>}
      <small>{rating}</small>
    </span>
  );
}

const ALL_PARTNER_LOGOS = [
  { name: 'Amazon', src: '/stores/amazon.png', width: 146, height: 44 },
  { name: 'Singing Dragon', src: '/stores/singing-dragon.png', width: 176, height: 44 },
  { name: 'Hachette UK', src: '/stores/hachette.png', width: 254, height: 44 },
  { name: 'Bookshop.org', src: '/stores/bookshop.png', width: 315, height: 44 },
  { name: 'Walmart', src: '/stores/walmart.png', width: 134, height: 44 },
  { name: 'AbeBooks', src: '/stores/abebooks.png', width: 157, height: 44 },
  { name: 'eBay', src: '/stores/ebay.png', width: 110, height: 44 },
  { name: 'Rakuten Kobo', src: '/stores/kobo.png', width: 236, height: 44 },
  { name: 'Goodreads', src: '/stores/goodreads.png', width: 204, height: 44 },
  { name: 'Dorrance Bookstore', src: '/stores/dorrance.png', width: 168, height: 44 },
  { name: 'Booktopia', src: '/stores/booktopia.png', width: 200, height: 44 },
];

/**
 * The shops a book can be bought from, as each shop's own logo and nothing
 * else — no written name, no edition note. Every button is a plain white plate
 * so the artwork (dark ink, drawn on light ground) is legible on the dark site.
 * A shop we hold no artwork for shows its name instead of an unrelated mark.
 */
function StoreButtons({ book, variant = 'grid' }: { book: Book; variant?: 'grid' | 'row' }) {
  return (
    <div className={variant === 'row' ? 'store-row' : 'store-grid'}>
      {book.stores.map((s) => {
        const logo = storeLogoFor(s.label, s.href);
        const label = `Buy ${book.title} from ${s.label}${s.note ? ` (${s.note})` : ''}`;
        return (
          <a
            key={`${s.href}-${s.label}`}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`store-btn${variant === 'row' ? ' store-btn--row' : ''}`}
            aria-label={label}
            title={label}
          >
            {logo ? (
              /* A fixed stage behind every logo. The artwork is already
                 trimmed and scaled to one content height by the build script,
                 so `height: 100%` here makes every shop's logo the same size,
                 and `object-fit: contain` lets a wide lockup use the plate's
                 full width without ever being squashed. */
              <span className="store-btn__stage">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  unoptimized
                  className="store-btn__logo"
                />
              </span>
            ) : (
              <span className="store-btn__stage">
                <span className="store-btn__name">{s.label}</span>
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}

/**
 * The long description. On a phone it is cut to a few lines — a screen of
 * unbroken paragraphs is the fastest way to lose a reader who is deciding
 * whether to buy — with the rest one tap away. The desktop dialog shows it
 * whole, where there is room for it.
 */
function Blurb({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const clamped = isPhone && !expanded;

  return (
    <div className="blurb">
      <p className={`blurb__text${clamped ? ' blurb__text--clamped' : ''}`}>{text}</p>
      {isPhone && (
        <button
          type="button"
          className="blurb__toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}
/* ------------------------------------------------------------------ */
/*  Big stage slider + thumbnail strip, per the reference template.    */
/*  Clicking the stage opens a modal: description, reader reviews and  */
/*  every store where the book is available.                           */
/* ------------------------------------------------------------------ */

function Dots({ count, active, onSelect }: { count: number; active: number; onSelect: (i: number) => void }) {
  return (
    <div className="bshow__dots" role="tablist" aria-label="Select book">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={`Book ${i + 1}`}
          className={`bshow__dot${i === active ? ' bshow__dot--active' : ''}`}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
}

function BookModal({ book, onClose }: { book: Book; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      // A review dialog opened on top handles its own Escape first.
      if (e.key === 'Escape' && !document.querySelector('.rvmodal')) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={book.title}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="glass modal-panel"
      >
        <div className="modal-panel__top">
          <div>
            <RatingLabel rating={book.rating} stars={book.ratingStars} />
            <h2 style={{ marginTop: 8, marginBottom: 4 }}>{book.title}</h2>
            {book.subtitle && <p className="muted" style={{ fontSize: 15 }}>{book.subtitle}</p>}
          </div>
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label="Close details">
            <Close />
          </button>
        </div>

        {/* 3D Book cover matching main page and CodePen VYwqwXN */}
        <div className="modal-grid">
          <div className="modal-grid__cover">
            <div className="books__cover books__cover--modal" tabIndex={0}>
              <div className="books__back-cover" />
              <div className="books__inside">
                <div className="books__page" />
                <div className="books__page" />
                <div className="books__page" />
              </div>
              <div className="books__image">
                <Image
                  src={book.cover}
                  alt={`${book.title} cover`}
                  width={400}
                  height={600}
                  loading="eager"
                  priority
                  unoptimized={book.cover.startsWith('http')}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <div className="books__effect" />
                <div className="books__light" />
              </div>
            </div>
          </div>
          <div className="modal-grid__copy">
            <div className="bshow__meta">
              <span className="badge">{book.publisher}</span>
              <span className="badge">{book.year}</span>
              <span className="badge">{book.pages}</span>
              {book.isbn && <span className="badge">ISBN {book.isbn}</span>}
              <span className="badge">{book.price}</span>
            </div>

            <Blurb text={book.blurb} />

            <h3 style={{ fontSize: 16, margin: '18px 0 8px' }}>Inside the book</h3>
            <ul className="modal-list">
              {book.sample.map((s) => (
                <li key={s.slice(0, 32)}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <h3 style={{ marginTop: 26, fontSize: 18 }}>Available from these stores</h3>
        <StoreButtons book={book} />

        <h3 style={{ marginTop: 26, fontSize: 18 }}>Reviews &amp; commentary</h3>
        <div style={{ marginTop: 14 }}>
          <ReviewWall reviews={reviewsForBook(book.id)} size="small" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function BookShowcase() {
  const [index, setIndex] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const book = books[index];
  const openBook = books.find((b) => b.id === openId) ?? null;

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + books.length) % books.length),
    []
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (openId) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, openId]);

  return (
    <>
      <div className="glass bshow">
        <div className="bshow__stage">
          <div className="bshow__cover">
            <div
              className="books__cover"
              onClick={() => setOpenId(book.id)}
              title="Click to look inside"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpenId(book.id);
                }
              }}
            >
              <div className="books__back-cover" />
              <div className="books__inside">
                <div className="books__page" />
                <div className="books__page" />
                <div className="books__page" />
              </div>
              <div className="books__image">
                <Image
                  src={book.cover}
                  alt={`${book.title} cover`}
                  width={400}
                  height={600}
                  priority
                  unoptimized={book.cover.startsWith('http')}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <div className="books__effect" />
                <div className="books__light" />
              </div>
            </div>
          </div>

          <div className="bshow__info">
            <RatingLabel rating={book.rating} stars={book.ratingStars} />
            <h3>{book.title}</h3>
            {book.subtitle && <p className="lead" style={{ fontSize: 16 }}>{book.subtitle}</p>}

            <div className="bshow__meta">
              <span className="badge">{book.publisher}</span>
              <span className="badge">{book.year}</span>
              <span className="badge">{book.pages}</span>
              {book.isbn && <span className="badge">ISBN {book.isbn}</span>}
              <span className="badge">{book.price}</span>
            </div>

            {/* On a phone the blurb is cut to three lines here; the full text
                lives one tap away in the dialog. */}
            <p className="bshow__blurb">{book.blurb}</p>

            <div className="bshow__controls">
              <button type="button" className="btn btn--primary" onClick={() => setOpenId(book.id)}>
                Buy Now <ArrowRight size={16} />
              </button>
              <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label="Previous book">←</button>
              <button type="button" className="icon-btn" onClick={() => go(1)} aria-label="Next book">→</button>
              <Dots count={books.length} active={index} onSelect={setIndex} />
            </div>

            {/* Partner Stores Infinite Loop Marquee - Display only, non-clickable, identical across all books */}
            <div className="partner-stores-wrap">
              <span className="partner-stores-label">Partner Stores:</span>
              <div className="partner-marquee">
                <div className="partner-marquee__track" aria-hidden="true">
                  {ALL_PARTNER_LOGOS.concat(ALL_PARTNER_LOGOS).map((s, idx) => (
                    <div
                      key={`${s.name}-${idx}`}
                      className="partner-store-badge"
                      title={s.name}
                    >
                      <Image
                        src={s.src}
                        alt={s.name}
                        width={s.width}
                        height={s.height}
                        unoptimized
                        className="partner-store-logo"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Animated Book Shelf Collection (from CodePen filipz/pen/PwwbrYo) */}
      <div className="shelf-container" aria-label="Book Collection Shelf">
        <div className="shelf-books">
          {books.map((b, i) => {
            const isActive = i === index;
            return (
              <div
                key={b.id}
                className={`shelf-book ${isActive ? 'shelf-book--active' : ''}`}
                onMouseEnter={() => setIndex(i)}
                onClick={() => {
                  setIndex(i);
                  setOpenId(b.id);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Select ${b.title}`}
                title={`Click to view ${b.title} in full screen`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIndex(i);
                    setOpenId(b.id);
                  }
                }}
              >
                <div className="shelf-book__wrapper">
                  <div className="books__cover shelf-book__cover">
                    <div className="books__back-cover" />
                    <div className="books__inside">
                      <div className="books__page" />
                      <div className="books__page" />
                      <div className="books__page" />
                    </div>
                    <div className="books__image">
                      <Image
                        src={b.cover}
                        alt={b.title}
                        width={120}
                        height={180}
                        loading="lazy"
                        unoptimized={b.cover.startsWith('http')}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                      <div className="books__effect" />
                      <div className="books__light" />
                    </div>
                  </div>
                  {/* Contact shadow where book meets shelf */}
                  <div className="book-shadow__item" />
                </div>
              </div>
            );
          })}
        </div>
        <div className="shelf" />
      </div>

      <AnimatePresence>
        {openBook && <BookModal book={openBook} onClose={() => setOpenId(null)} />}
      </AnimatePresence>
    </>
  );
}
