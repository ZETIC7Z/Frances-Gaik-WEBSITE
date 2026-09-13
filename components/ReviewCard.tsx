'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { bookForReview } from '@/config/siteData';
import type { Review } from '@/config/siteData';
import { sourceLogoFor } from '@/config/reviewSources';

/** Reported rating only — never inferred from editorial language. */
export function Stars({ rating, stars, size = 'md' }: { rating?: string; stars?: number; size?: 'sm' | 'md' }) {
  if (typeof stars !== 'number') {
    return <span className="rvstars rvstars--none">Professional review</span>;
  }
  return (
    <span className={`rvstars rvstars--${size}`} aria-label={rating}>
      <i aria-hidden>
        {'★'.repeat(stars)}
        {'☆'.repeat(Math.max(0, 5 - stars))}
      </i>
      {rating && <small>{rating}</small>}
    </span>
  );
}

/**
 * The review's source site, shown with that site's OWN logo — the same white
 * plate, logo-only badge the store buttons use — so you can see at a glance
 * where a quote came from, on a compact card and in the full reading view
 * alike. An outlet we hold no artwork for names itself on the same plate.
 */
export function SourceMark({ platform, host, full = false }: { platform: string; host?: string; full?: boolean }) {
  const logo = sourceLogoFor(platform);

  if (!logo) {
    return (
      <span
        className={`rvmark${full ? ' rvmark--full' : ''}`}
        title={`Review source: ${host ? `${platform} (${host})` : platform}`}
      >
        <span className="rvmark__plate">
          <span className="rvmark__text" aria-hidden>
            {platform}
          </span>
        </span>
        {full && <span className="rvmark__name">{platform}</span>}
      </span>
    );
  }

  const site = logo.home.replace(/^https?:\/\//, '');

  return (
    <span className={`rvmark${full ? ' rvmark--full' : ''}`} title={`Review source: ${logo.name} — ${site}`}>
      <span className="rvmark__plate">
        {/* Already-small local PNGs: served as-is rather than re-encoded. */}
        <Image
          src={logo.src}
          alt={`${logo.name} logo`}
          width={logo.width}
          height={logo.height}
          unoptimized
          className="rvmark__logo"
        />
      </span>
      {full && <span className="rvmark__name">{logo.name}</span>}
    </span>
  );
}

/** Host of a source URL, e.g. "amazon.com" — proof of where the review lives. */
export function sourceHost(url?: string) {
  if (!url) return undefined;
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

export default function ReviewCard({
  review,
  onOpen,
  compact = false,
  decorative = false,
}: {
  review: Review;
  onOpen?: (review: Review) => void;
  compact?: boolean;
  decorative?: boolean;
}) {
  const book = bookForReview(review);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const [clamped, setClamped] = useState(false);
  const host = sourceHost(review.sourceUrl);

  // Only offer "read full review" when the quote really is cut off.
  useEffect(() => {
    const el = quoteRef.current;
    if (!el) return;
    const check = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    check();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [review.quote, compact]);

  // Cloned wall cards stay clickable (they are what you see scrolling past) but
  // stay out of the tab order — the original copy carries the accessible card.
  const canOpen = Boolean(onOpen);

  return (
    <article className={`rvcard${compact ? ' rvcard--compact' : ''}${canOpen ? ' rvcard--clickable' : ''}`}>
      <header className="rvcard__head">
        {book && (
          <span className="rvcard__cover">
            <Image
              src={book.cover}
              alt={`${book.title} cover`}
              width={64}
              height={96}
              unoptimized={book.cover.startsWith('http')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </span>
        )}
        <span className="rvcard__who">
          <span className="rvcard__name">{review.reviewer}</span>
          {review.reviewerRole && <span className="rvcard__role">{review.reviewerRole}</span>}
        </span>
        <SourceMark platform={review.platform} host={host} />
      </header>

      <Stars rating={review.rating} stars={review.ratingStars} />

      <p className={`rvcard__quote${compact ? ' rvcard__quote--compact' : ''}`} ref={quoteRef}>
        “{review.quote}”
      </p>

      <footer className="rvcard__foot">
        {book && <span className="rvcard__book">{book.title}</span>}
        <span className="rvcard__actions">
          {clamped && <span className="rvcard__more">Read full review</span>}
          {review.sourceUrl && (
            <a
              className="rvcard__verify"
              href={review.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={decorative ? -1 : undefined}
            >
              Verify source ↗
            </a>
          )}
        </span>
      </footer>

      {canOpen && (
        <button
          type="button"
          className="rvcard__hit"
          onClick={() => onOpen?.(review)}
          tabIndex={decorative ? -1 : undefined}
          aria-label={`Read the full review from ${review.reviewer}`}
        />
      )}
    </article>
  );
}
