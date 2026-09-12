import Link from 'next/link';
import { practice } from '@/config/siteData';
import { ArrowRight, Sparkle } from '@/components/ui/icons';
import { Reveal } from '@/components/ui/Reveal';
import { pageMetadata } from '@/config/seo';

export const metadata = pageMetadata({
  title: 'Hypnosis',
  description:
    'An accessible overview of therapeutic hypnosis, control, consent, and possible mind-body applications.',
  path: '/hypnosis',
});

export default function HypnosisPage() {
  const content = practice.hypnosis;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Focused attention • guided imagery</p>
            <h1>{content.title}</h1>
            <p className="lead" style={{ maxWidth: 800 }}>{content.intro}</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split" style={{ alignItems: 'start' }}>
            <Reveal className="prose">
              {content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <div className="disclaimer">
                <strong>Consent and control:</strong> therapeutic hypnosis is collaborative. You remain aware and may stop a session or decline any suggestion at any time.
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="glass practice-panel">
                <div className="card__icon"><Sparkle size={20} /></div>
                <h2 style={{ fontSize: 26 }}>Possible applications</h2>
                <ul>
                  {content.uses.map((use) => <li key={use}>{use}</li>)}
                </ul>
                <Link href="/contact" className="btn btn--primary">Ask a question <ArrowRight size={16} /></Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
