'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ReviewCard from '@/components/ReviewCard';
import ReviewModal from '@/components/ReviewModal';
import type { Review } from '@/config/siteData';

/** Static, fully readable review grid (used on the Book Reviews page). */
export default function ReviewGrid({ reviews }: { reviews: Review[] }) {
  const [open, setOpen] = useState<Review | null>(null);

  return (
    <>
      <div className="rvgrid">
        {reviews.map((review) => (
          <ReviewCard key={`${review.source}-${review.quote.slice(0, 24)}`} review={review} onOpen={setOpen} />
        ))}
      </div>
      <AnimatePresence>{open && <ReviewModal review={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </>
  );
}
