import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { about, allReviews, hero, site, stats } from '@/config/siteData';
import { Reveal } from '@/components/ui/Reveal';
import { CountUp } from '@/components/ui/CountUp';
import { ArrowRight } from '@/components/ui/icons';
import { HeroScrollCue } from '@/components/HeroScrollCue';
import { pageMetadata, siteDescription, siteTitle } from '@/config/seo';

/* The two heaviest client subtrees sit well below the fold (a slider and an
   endlessly drifting review wall). They still render on the server for the
   first paint, but their JS arrives in its own chunk instead of blocking the
   hero, so the page becomes readable and clickable sooner. */
const BookShowcase = dynamic(() => import('@/components/BookShowcase'));
const ReviewWall = dynamic(() => import('@/components/ReviewWall'));

/* The home title is the site's own headline rather than a page name, so it is
   used as written instead of being suffixed with the site name. */
export const metadata = pageMetadata({
  title: siteTitle,
  description: siteDescription,
  path: '/',
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="hero">
        <div className="container">
          <div className="hero__grid hero__grid--single">
            <Reveal>
              <p className="eyebrow">{hero.eyebrow}</p>
              <h1 className="hero__title">
                <span className="line">{hero.titlePlainTop}</span>
                <span className="line gradient-text">{hero.titleGradient}</span>
                <span className="line">{hero.titlePlainBottom}</span>
              </h1>
              <p className="lead" style={{ maxWidth: 640 }}>{hero.intro}</p>

              <div className="hero__scroll-cue--mobile-only">
                <HeroScrollCue />
              </div>

              <div className="hero__ctas">
                <Link href={hero.primaryCta.href} className="btn btn--primary">
                  {hero.primaryCta.label}
                </Link>
                <Link href={hero.secondaryCta.href} className="btn btn--outline">
                  {hero.secondaryCta.label}
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="stats">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 90} className="stat">
                <CountUp value={s.value} suffix={s.suffix} />
                <div className="stat__label">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="hero__scroll-cue--desktop-only">
          <HeroScrollCue />
        </div>
      </section>

      {/* ---------------- Book slider ---------------- */}
      <section className="section" id="books">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <p className="eyebrow" style={{ justifyContent: 'center' }}>Published works</p>
            <h2 className="section-title">The Books</h2>              <p className="lead">
                Two published works — a Qigong guide and a spiritual memoir — presented with source-attributed editions and purchase links.
              </p>
          </Reveal>
          <Reveal>
            <BookShowcase />
          </Reveal>
        </div>
      </section>

      {/* ---------------- About the author ---------------- */}
      <section className="section" id="about">
        <div className="container">
          <div className="split">
            <Reveal>
              <p className="eyebrow">About the author</p>
              <h2 className="section-title">{site.fullName}</h2>
              <p>{about.intro}</p>
              <div className="hero__ctas" style={{ marginTop: 18 }}>
                <Link href="/about" className="btn btn--outline">
                  Read the full biography <ArrowRight size={16} />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="glass" style={{ padding: 28 }}>
                <h3 style={{ fontSize: 17 }}>From her research</h3>
                <blockquote className="prose" style={{ margin: '12px 0 0', fontStyle: 'italic', color: 'var(--fg-soft)' }}>
                  “The research project was most successful and the subjects showed significant
                  improvement after only a two-month period of daily qigong practice of 40
                  minutes. This study is now the subject of an exciting new book, ‘Managing
                  Depression with Qigong.’”
                </blockquote>
                <p className="muted" style={{ fontSize: 13, marginTop: 14 }}>
                  — {site.name}, from her doctoral dissertation
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Book reviews ---------------- */}
      <section className="section" id="reviews">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <p className="eyebrow" style={{ justifyContent: 'center' }}>Book reviews</p>
            <h2 className="section-title">What readers &amp; reviewers said</h2>
            <p className="lead">
              Reader and professional reviews of both published works — with the original source and
              reported rating shown clearly instead of a made-up universal score.
            </p>
          </Reveal>
          <Reveal>
            <ReviewWall reviews={allReviews} />
          </Reveal>
          <Reveal>
            <p className="muted" style={{ textAlign: 'center', fontSize: 13, marginTop: 18 }}>
              Click any card to read the review in full and to open the site it was published on.
              Every excerpt is quoted from the sources listed on the{' '}
              <Link href="/reviews" style={{ color: 'var(--primary)' }}>Book Reviews page</Link>.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
