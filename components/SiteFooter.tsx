import Image from 'next/image';
import Link from 'next/link';
import { nav, practiceNav, site } from '@/config/siteData';
import { Mail, MapPin, Phone } from './ui/icons';

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Image
              src="/brand/dr-frances-gaik.svg"
              alt="Dr. Frances Gaik signature"
              width={220}
              height={57}
              className="footer__logo"
            />
            <p style={{ fontSize: 14, maxWidth: 300 }}>
              {site.fullName} — {site.role}. Author of <em>Managing Depression with Qigong</em>,
              living and writing in {site.location}.
            </p>
            <div className="footer__social">
              <a href={site.phoneHref} aria-label="Phone"><Phone size={16} /></a>
              <a href={`mailto:${site.email}`} aria-label="Email"><Mail size={16} /></a>
              <a
                href="https://www.linkedin.com/in/fran-gaik-75700413"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M6.94 8.5v11H3.6v-11h3.34ZM5.27 3a1.94 1.94 0 1 1 0 3.88 1.94 1.94 0 0 1 0-3.88ZM20.4 13.3v6.2h-3.34v-5.8c0-1.46-.52-2.45-1.83-2.45-1 0-1.6.67-1.86 1.32-.1.23-.12.56-.12.9v6.03H9.9s.05-9.78 0-10.8h3.34v1.53c.44-.68 1.23-1.66 3-1.66 2.2 0 4.15 1.43 4.15 4.73Z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4>Site Map</h4>
            <ul className="footer__links">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>The Books</h4>
            <ul className="footer__links">
              <li><Link href="/books">All titles</Link></li>
              <li><Link href="/reviews">Book reviews</Link></li>
              <li><Link href="/about">About the author</Link></li>
              <li><Link href="/privacy">Privacy &amp; HIPAA</Link></li>
            </ul>
          </div>

          <div>
            <h4>Practice</h4>
            <ul className="footer__links">
              {practiceNav.map((item) => (
                <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul className="footer__links">
              <li>
                <a href={site.phoneHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={14} /> {site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={14} /> {site.email}
                </a>
              </li>
              <li style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={14} /> {site.location}
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__base">
          <span>© {new Date().getFullYear()} Dr. Frances Gaik. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
