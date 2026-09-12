'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { bookForReview } from '@/config/siteData';
import type { Review } from '@/config/siteData';
import { Close, Shield } from '@/components/ui/icons';
import { SourceMark, Stars, sourceHost } from '@/components/ReviewCard';

/**
 * Reading view for one review: the untouched, untruncated text in a plain card,
 * with the book it belongs to and a link back to the site that published it.
 */
export default function ReviewModal({ review, onClose }: { review: Review; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const book = bookForReview(review);
  const host = sourceHost(review.sourceUrl);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // This dialog can open on top of the book dialog, so restore whatever lock
    // was already in place instead of clearing it outright.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <motion.div
      className="rvmodal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Full review from ${review.reviewer}`}
    >
      <motion.div
        className="glass rvmodal__panel"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 26, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <div className="rvmodal__top">
          <span className="rvmodal__kind">Full review</span>
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label="Close review">
            <Close />
          </button>
        </div>

        <div className="rvmodal__body">
          {book && (
            <div className="rvmodal__cover">
              <Image
                src={book.cover}
                alt={`${book.title} cover`}
                width={320}
                height={480}
                unoptimized={book.cover.startsWith('http')}
                style={{ width: '100%', height: 'auto', borderRadius: 10 }}
              />
            </div>
          )}

          <div className="rvmodal__main">
            <header className="rvcard__head rvcard__head--lg">
              <span className="rvcard__who">
                <span className="rvcard__name">{review.reviewer}</span>
                {review.reviewerRole && <span className="rvcard__role">{review.reviewerRole}</span>}
              </span>
              <SourceMark platform={review.platform} host={host} full />
            </header>

            <Stars rating={review.rating} stars={review.ratingStars} />

            <blockquote className="rvmodal__quote">“{review.quote}”</blockquote>

            {book && (
              <p className="rvmodal__book">
                Reviewing <strong>{book.title}</strong>
                {book.publisher ? ` · ${book.publisher}` : ''}
                {book.year ? ` · ${book.year}` : ''}
              </p>
            )}

            <footer className="rvmodal__foot">
              <span className="rvmodal__source">
                {review.source}
                {host && <span className="rvmodal__host"> · {host}</span>}
              </span>
              {review.sourceUrl && (
                <a
                  href={review.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--outline btn--sm"
                >
                  <Shield size={15} /> Verify source
                </a>
              )}
            </footer>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
