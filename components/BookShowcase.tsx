'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { books, reviewsForBook } from '@/config/siteData';
import type { Book } from '@/config/siteData';
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
      style={{
        position: 'fixed', inset: 0, zIndex: 90,
        background: 'rgba(4,10,10,0.74)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
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
        className="glass"
        style={{
          width: 'min(960px, 100%)',
          maxHeight: 'min(88vh, 820px)',
          overflow: 'auto',
          padding: 'clamp(22px, 3vw, 36px)',
          borderColor: 'var(--border-strong)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <RatingLabel rating={book.rating} stars={book.ratingStars} />
            <h2 style={{ marginTop: 8, marginBottom: 4 }}>{book.title}</h2>
            {book.subtitle && <p className="muted" style={{ fontSize: 15 }}>{book.subtitle}</p>}
          </div>
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label="Close details">
            <Close />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 220px) 1fr', gap: 26, marginTop: 22 }} className="modal-grid">
          <Image
            src={book.cover}
            alt={`${book.title} cover`}
            width={400}
            height={600}
            unoptimized={book.cover.startsWith('http')}
            style={{ width: '100%', height: 'auto', borderRadius: 10, border: '1px solid var(--border-strong)' }}
          />
          <div>
            <div className="bshow__meta">
              <span className="badge">{book.publisher}</span>
              <span className="badge">{book.year}</span>
              <span className="badge">{book.pages}</span>
              {book.isbn && <span className="badge">ISBN {book.isbn}</span>}
              <span className="badge">{book.price}</span>
            </div>
            <p style={{ fontSize: 14.5 }}>{book.blurb}</p>

            <h3 style={{ fontSize: 16, margin: '18px 0 8px' }}>Inside the book</h3>
            <ul style={{ paddingLeft: 18, color: 'var(--fg-soft)', fontSize: 14 }}>
              {book.sample.map((s) => (
                <li key={s.slice(0, 32)} style={{ marginBottom: 6 }}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <h3 style={{ marginTop: 28, fontSize: 18 }}>Reviews &amp; commentary</h3>
        <div style={{ marginTop: 14 }}>
          <ReviewWall reviews={reviewsForBook(book.id)} size="small" />
        </div>

        <h3 style={{ marginTop: 28, fontSize: 18 }}>Available from these stores</h3>
        <div className="store-grid">
          {book.stores.map((s) => (
            <a
              key={`${s.href}-${s.label}`}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="store-chip"
            >
              <span>{s.label}</span>
              {s.note && <small>{s.note}</small>}
            </a>
          ))}
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
            <Image
              src={book.cover}
              alt={`${book.title} cover`}
              width={400}
              height={600}
              priority
              unoptimized={book.cover.startsWith('http')}
              style={{ width: '100%', height: 'auto' }}
            />
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

            <p style={{ fontSize: 14.5, maxWidth: 640 }}>{book.blurb.slice(0, 260)}…</p>

            <div className="bshow__controls">
              <button type="button" className="btn btn--primary" onClick={() => setOpenId(book.id)}>
                Look inside <ArrowRight size={16} />
              </button>
              <a href={book.stores[0].href} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
                Buy from {book.stores[0].label}
              </a>
              <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label="Previous book">←</button>
              <button type="button" className="icon-btn" onClick={() => go(1)} aria-label="Next book">→</button>
              <Dots count={books.length} active={index} onSelect={setIndex} />
            </div>
          </div>
        </div>
      </div>

      {/* All books below the big preview */}
      <div className="bshow__thumbs">
        {books.map((b, i) => (
          <button
            key={b.id}
            type="button"
            className={`bshow__thumb${i === index ? ' bshow__thumb--active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Show ${b.title}`}
            aria-pressed={i === index}
          >
            <Image src={b.cover} alt="" width={96} height={144} unoptimized={b.cover.startsWith('http')} style={{ width: '100%', height: 'auto' }} />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {openBook && <BookModal book={openBook} onClose={() => setOpenId(null)} />}
      </AnimatePresence>
    </>
  );
}
