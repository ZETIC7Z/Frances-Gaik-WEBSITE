'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ReviewCard from '@/components/ReviewCard';
import ReviewModal from '@/components/ReviewModal';
import type { Review } from '@/config/siteData';

/**
 * Review wall — the "Infinite Scrolling Reviews Section" pattern (CodePen
 * pvjqbEP by Sajid Farid): side-by-side columns of review cards that drift
 * forever behind a soft top/bottom mask, alternating direction per column, and
 * pause while the pointer is over them. Cards open the full review on click.
 */
function useColumnCount(max: number) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const queries = [
      window.matchMedia('(min-width: 1024px)'),
      window.matchMedia('(min-width: 680px)'),
    ];
    const update = () => {
      const next = queries[0].matches ? 3 : queries[1].matches ? 2 : 1;
      setCount(Math.min(max, next));
    };
    update();
    for (const query of queries) query.addEventListener('change', update);
    return () => {
      for (const query of queries) query.removeEventListener('change', update);
    };
  }, [max]);

  return count;
}

/**
 * Deal reviews into columns, then top every column up from the next reviews in
 * the rotation (never the card that was just pushed) so each column is taller
 * than its window and the loop reads as continuous rather than repeating.
 */
function deal(reviews: Review[], columnCount: number, minPerColumn: number) {
  if (reviews.length === 0) return Array.from({ length: columnCount }, () => [] as Review[]);
  const columns: Review[][] = Array.from({ length: columnCount }, () => [] as Review[]);
  reviews.forEach((review, index) => columns[index % columnCount].push(review));
  columns.forEach((column, index) => {
    let cursor = (index + columnCount * column.length) % reviews.length;
    let guard = 0;
    while (column.length < minPerColumn && guard < reviews.length * 2) {
      column.push(reviews[cursor % reviews.length]);
      cursor += columnCount;
      guard += 1;
    }
  });
  return columns;
}

export default function ReviewWall({
  reviews,
  size = 'large',
  className = '',
}: {
  reviews: Review[];
  size?: 'large' | 'small';
  className?: string;
}) {
  const [open, setOpen] = useState<Review | null>(null);
  const maxColumns = size === 'small' ? 2 : 3;
  const columnCount = useColumnCount(maxColumns);
  const columns = useMemo(
    () => deal(reviews, columnCount, size === 'small' ? 3 : 4),
    [reviews, columnCount, size]
  );

  return (
    <>
      <div className={`rvwall rvwall--${size} ${className}`.trim()}>
        <div className="rvwall__grid">
          {columns.map((column, columnIndex) => (
            <div
              key={columnIndex}
              className={`rvwall__col rvwall__col--${columnIndex % 2 === 0 ? 'up' : 'down'}`}
            >
              <div className="rvwall__track">
                {[0, 1].map((copy) => (
                  <div className="rvwall__stack" key={copy} aria-hidden={copy === 1 || undefined}>
                    {column.map((review, index) => (
                      <ReviewCard
                        key={`${review.source}-${index}-${copy}`}
                        review={review}
                        onOpen={setOpen}
                        compact={size === 'small'}
                        decorative={copy === 1}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>{open && <ReviewModal review={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </>
  );
}
