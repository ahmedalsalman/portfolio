import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="wrap detail-head">
      <span className="eyebrow">404</span>
      <h1 className="detail-title">Page not found.</h1>
      <p className="detail-tagline">Sorry, this page doesn&rsquo;t exist. It may have moved.</p>
      <p style={{ marginTop: 28 }}>
        <Link className="btn" href="/">Back to all projects</Link>
      </p>
    </section>
  );
}
