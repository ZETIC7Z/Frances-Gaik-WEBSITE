import Link from 'next/link';
import { practice } from '@/config/siteData';
import { ArrowRight, Leaf } from '@/components/ui/icons';
import { Reveal } from '@/components/ui/Reveal';
import { pageMetadata } from '@/config/seo';

export const metadata = pageMetadata({
  title: 'Depression & Qigong Treatment',
  description:
    'Learn how Qigong is presented as a complementary movement and meditation practice alongside appropriate depression care.',
  path: '/depression-and-qigong-treatment',
});

export default function DepressionQigongPage() {
  const content = practice.qigong;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Mind • body • movement</p>
            <h1>{content.title}</h1>
            <p className="lead" style={{ maxWidth: 820 }}>{content.intro}</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split" style={{ alignItems: 'start' }}>
            <Reveal className="prose">
              {content.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div className="disclaimer">
                <strong>Important:</strong> Qigong is described as a complementary practice. It does not replace prescribed medication, psychotherapy, diagnosis, or urgent medical care.
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="glass practice-panel">
                <div className="card__icon"><Leaf size={20} /></div>
                <h2 style={{ fontSize: 26 }}>What the book explores</h2>
                <ul>
                  {content.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
                <Link href="/books" className="btn btn--outline">Read the book <ArrowRight size={16} /></Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
