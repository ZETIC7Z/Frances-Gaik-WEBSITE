import { privacy } from '@/config/siteData';
import { Reveal } from '@/components/ui/Reveal';
import { Shield } from '@/components/ui/icons';
import { pageMetadata } from '@/config/seo';

export const metadata = pageMetadata({
  title: 'Consent Form & Privacy',
  description:
    'Notice of privacy practices: how protected health information is used and your rights under HIPAA.',
  path: '/privacy',
});

export default function PrivacyPage() {
  const hc = privacy.hipaaContact;
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Consent form / notice of privacy practices</p>
            <h1>Consent Form / Privacy Policy</h1>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="prose">
            <p><strong>{privacy.intro}</strong></p>
            {privacy.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </Reveal>

          <Reveal delay={100}>
            <div className="glass" style={{ marginTop: 36, padding: 30, maxWidth: 640 }}>
              <div className="card__icon"><Shield size={20} /></div>
              <h3>HIPAA — for more information</h3>
              <p style={{ marginBottom: 6 }}>{hc.org}</p>
              <p className="muted" style={{ marginBottom: 6, fontSize: 14 }}>{hc.address}</p>
              <p className="muted" style={{ fontSize: 14 }}>
                {hc.phone} &nbsp;•&nbsp; Toll free {hc.tollFree}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
