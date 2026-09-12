import { contact, site } from '@/config/siteData';
import { Reveal } from '@/components/ui/Reveal';
import { Mail, MapPin, Phone } from '@/components/ui/icons';
import { pageMetadata } from '@/config/seo';

export const metadata = pageMetadata({
  title: 'Contact',
  description:
    'Contact Dr. Fran Gaik — author of Managing Depression with Qigong — for Qigong seminars, book questions, or professional inquiries.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Get in touch</p>
            <h1>{contact.heading}</h1>
            <p className="lead" style={{ maxWidth: 700 }}>{contact.lead}</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {contact.phones.map((c) => (
              <Reveal key={c.value} className="card">
                <div className="card__icon"><Phone size={20} /></div>
                <div className="contact-item">
                  <span className="contact-item__label">{c.label}</span>
                  <a href={c.href} className="contact-item__value">{c.value}</a>
                </div>
              </Reveal>
            ))}
            {contact.emails.map((c) => (
              <Reveal key={c.value} delay={80} className="card">
                <div className="card__icon"><Mail size={20} /></div>
                <div className="contact-item">
                  <span className="contact-item__label">{c.label}</span>
                  <a href={c.href} className="contact-item__value">{c.value}</a>
                </div>
              </Reveal>
            ))}
            <Reveal delay={140} className="card">
              <div className="card__icon"><MapPin size={20} /></div>
              <div className="contact-item">
                <span className="contact-item__label">Based in</span>
                <span className="contact-item__value">{site.location}</span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={160}>
            <div className="glass" style={{ marginTop: 40, padding: '38px 32px' }}>
              <h2>Writing, seminars &amp; speaking</h2>
              <p style={{ maxWidth: 700 }}>
                Dr. Gaik speaks on Qigong research and her clinical study, and welcomes reader
                questions about the book. {contact.note}
              </p>
              <div className="hero__ctas" style={{ marginTop: 10 }}>
                <a href={`mailto:${site.email}`} className="btn btn--primary">Email the author</a>
                <a href={site.phoneHref} className="btn btn--outline">Call {site.phone}</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
