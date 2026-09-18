import { contact, site } from '@/config/siteData';
import { Reveal } from '@/components/ui/Reveal';
import { Mail, MapPin, Phone } from '@/components/ui/icons';
import { pageMetadata } from '@/config/seo';
import ContactForm from '@/components/ContactForm';

export const metadata = pageMetadata({
  title: 'Contact',
  description:
    'Contact Dr. Frances Gaik — author of Managing Depression with Qigong — for Qigong seminars, book questions, or professional inquiries.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <section className="contact-hero">
        <div className="container" style={{ textAlign: 'center' }}>
          <Reveal>
            <div className="contact-pill-badge">Let&apos;s Connect</div>
            <h1 className="contact-page-title">Get In Touch</h1>
            <p className="contact-page-subtitle">
              Have a question about the book, Qigong research, or just want to say hi? My inbox is always open.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0, paddingBottom: 80 }}>
        <div className="container">
          <div className="contact-split-grid">
            {/* Left Card: Contact Details */}
            <Reveal>
              <div className="contact-card glass">
                <div className="contact-form-header">
                  <span className="contact-form-dot" aria-hidden="true" />
                  <h2 className="contact-form-title">Contact Details</h2>
                </div>

                <div className="contact-details-list">
                  <div className="contact-detail-item">
                    <div className="contact-detail-icon">
                      <Mail size={18} />
                    </div>
                    <div className="contact-detail-content">
                      <span className="contact-detail-label">Email</span>
                      <a href={`mailto:${site.email}`} className="contact-detail-value">
                        {site.email}
                      </a>
                    </div>
                  </div>

                  <div className="contact-detail-item">
                    <div className="contact-detail-icon">
                      <Phone size={18} />
                    </div>
                    <div className="contact-detail-content">
                      <span className="contact-detail-label">Phone</span>
                      <a href={site.phoneHref} className="contact-detail-value">
                        {site.phone}
                      </a>
                    </div>
                  </div>

                  <div className="contact-detail-item">
                    <div className="contact-detail-icon">
                      <MapPin size={18} />
                    </div>
                    <div className="contact-detail-content">
                      <span className="contact-detail-label">Location</span>
                      <span className="contact-detail-value">
                        {site.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="contact-find-me">
                  <span className="contact-find-me-label">Find me on</span>
                  <div className="contact-social-row">
                    <a
                      href={site.phoneHref}
                      className="contact-social-btn"
                      aria-label="Call Dr. Frances Gaik"
                      title="Phone"
                    >
                      <Phone size={16} />
                    </a>
                    <a
                      href={`mailto:${site.email}`}
                      className="contact-social-btn"
                      aria-label="Email Dr. Frances Gaik"
                      title="Email"
                    >
                      <Mail size={16} />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/fran-gaik-75700413"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-social-btn"
                      aria-label="LinkedIn profile"
                      title="LinkedIn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M6.94 8.5v11H3.6v-11h3.34ZM5.27 3a1.94 1.94 0 1 1 0 3.88 1.94 1.94 0 0 1 0-3.88ZM20.4 13.3v6.2h-3.34v-5.8c0-1.46-.52-2.45-1.83-2.45-1 0-1.6.67-1.86 1.32-.1.23-.12.56-.12.9v6.03H9.9s.05-9.78 0-10.8h3.34v1.53c.44-.68 1.23-1.66 3-1.66 2.2 0 4.15 1.43 4.15 4.73Z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right Card: Send Me a Message */}
            <Reveal delay={100}>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
