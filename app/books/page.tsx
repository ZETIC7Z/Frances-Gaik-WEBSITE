import { books } from '@/config/siteData';
import { Reveal } from '@/components/ui/Reveal';
import BookShowcase from '@/components/BookShowcase';
import { pageMetadata } from '@/config/seo';

export const metadata = pageMetadata({
  title: 'Books',
  description:
    'Managing Depression with Qigong (Singing Dragon) and Dialogues from Beyond (Dorrance Publishing) — the author’s two published works with verified reading and purchase links.',
  path: '/books',
});

export default function BooksPage() {
  const storeCount = new Set(books.flatMap((b) => b.stores.map((s) => s.label))).size;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Published works • {storeCount}+ stores</p>
            <h1>Books</h1>
            <p className="lead" style={{ maxWidth: 720 }}>
              Click any book to look inside — description, source-attributed reviews, and purchase
              links for each edition.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <BookShowcase />
          </Reveal>
        </div>
      </section>
    </>
  );
}
