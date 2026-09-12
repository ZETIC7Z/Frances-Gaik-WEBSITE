import Link from 'next/link';
import { books, reviewsForBook } from '@/config/siteData';
import { Reveal } from '@/components/ui/Reveal';
import ReviewGrid from '@/components/ReviewGrid';
import { pageMetadata } from '@/config/seo';

export const metadata = pageMetadata({
  title: 'Book Reviews',
  description:
    'Source-attributed reader and professional reviews of Managing Depression with Qigong and Dialogues from Beyond by Dr. Frances Gaik — with reported ratings separated from editorial commentary.',
  path: '/reviews',
});

export default function ReviewsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Book reviews</p>
            <h1>What readers said</h1>
            <p className="lead" style={{ maxWidth: 720 }}>
              Collected source-attributed reader and professional reviews of Dr. Gaik’s two
              published works. Ratings are shown only when the source reports one.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {books.map((b) => (
            <div key={b.id} style={{ marginBottom: 56 }}>
              <Reveal className="section-head">
                <p className="eyebrow">{b.publisher} • {b.year}</p>
                <h2 style={{ fontSize: 'clamp(22px, 2.6vw, 32px)' }}>{b.title}</h2>
              </Reveal>
              <Reveal>
                <ReviewGrid reviews={reviewsForBook(b.id)} />
              </Reveal>
            </div>
          ))}

          <Reveal>
            <div className="disclaimer">
              <strong>Source attribution.</strong> Review excerpts are reproduced from the
              author’s original books page, publisher listings, Dorrance customer reviews,
              Foreword Reviews, and Kirkus Reviews. Ratings are not inferred from editorial
              language. Read the books and find every purchase link on the{' '}
              <Link href="/books" style={{ color: 'var(--secondary)' }}>Books page</Link>.
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
