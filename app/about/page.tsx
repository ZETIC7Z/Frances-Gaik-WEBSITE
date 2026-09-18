import Image from 'next/image';
import { about, site } from '@/config/siteData';
import { Reveal } from '@/components/ui/Reveal';
import { pageMetadata } from '@/config/seo';

export const dynamic = 'force-static';

export const metadata = pageMetadata({
  title: 'About the Author',
  description:
    'Full biography of Dr. Frances Gaik, PsyD, LCPC — credentials, experience, and philosophy, from her own writing.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Biography</p>
            <h1>About the Author</h1>
            <p className="lead" style={{ maxWidth: 720 }}>{site.role} — in her own words.</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split" style={{ alignItems: 'start' }}>
            <Reveal>
              <div
                className="about-photo-wrap"
                style={{
                  width: 'fit-content',
                  maxWidth: 'min(320px, 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div className="author-photo-card" tabIndex={0}>
                  <div className="author-photo-card__inner">
                    <Image
                      src="/images/author-enhanced.jpg"
                      alt="Dr. Frances Gaik"
                      width={320}
                      height={422}
                      className="author-photo"
                      priority
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                    <div className="author-photo-card__sheen" />
                    <div className="author-photo-card__border" />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    letterSpacing: '.12em',
                    color: 'var(--fg-muted)',
                    textAlign: 'center',
                    marginTop: 14,
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    lineHeight: 1.6,
                    width: '100%',
                  }}
                >
                  Dr. Frances Gaik<br />
                  <span style={{ fontSize: 11, letterSpacing: '.15em', opacity: 0.75 }}>PsyD, LCPC</span>
                </p>
              </div>
            </Reveal>

            <Reveal delay={120} className="prose" >
              <h2 style={{ marginTop: 0 }}>Credentials</h2>
              <p>{about.intro}</p>
              <ul>
                {about.credentials.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>

              <h2>Experience</h2>
              {about.experience.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}

              <h2>Philosophy</h2>
              <p>{about.philosophy}</p>

              <h2>The research behind the book</h2>
              <p>{about.qigong}</p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
