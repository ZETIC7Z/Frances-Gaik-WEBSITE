import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p className="eyebrow" style={{ justifyContent: 'center' }}>404</p>
        <h1 className="section-title">This page has moved on</h1>
        <p className="lead" style={{ maxWidth: 480, margin: '0 auto 26px' }}>
          The page you’re looking for doesn’t exist — but every good chapter starts with
          turning the next page.
        </p>
        <Link href="/" className="btn btn--primary">Back to the homepage</Link>
      </div>
    </section>
  );
}
