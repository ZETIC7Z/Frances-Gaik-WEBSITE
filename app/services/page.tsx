import Link from 'next/link';
import { practice, site } from '@/config/siteData';
import { ArrowRight, Leaf } from '@/components/ui/icons';
import { Reveal } from '@/components/ui/Reveal';
import { pageMetadata } from '@/config/seo';

export const metadata = pageMetadata({
  title: 'Services',
  description:
    'Life coaching, counseling, assessment, collaborative divorce coaching, and group programs with Dr. Fran Gaik.',
  path: '/services',
});

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Practice</p>
            <h1>Services</h1>
            <p className="lead" style={{ maxWidth: 760 }}>
              Practical, collaborative support for personal, professional, relationship, and life transitions.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid-3">
            {practice.services.map((service, index) => (
              <Reveal key={service.title} delay={index * 70} className="card">
                <div className="card__icon"><Leaf size={20} /></div>
                <h2 style={{ fontSize: 22 }}>{service.title}</h2>
                <p>{service.body}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="glass practice-callout">
              <div>
                <p className="eyebrow">A private, comfortable setting</p>
                <h2>Start with a conversation</h2>
                <p style={{ maxWidth: 680, marginBottom: 0 }}>
                  Sessions take place in {site.location}. Contact Dr. Gaik to discuss your goals and find an appropriate next step.
                </p>
              </div>
              <Link href="/contact" className="btn btn--primary">Contact Dr. Gaik <ArrowRight size={16} /></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
