import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="wrap detail-head">
      <span className="eyebrow">404 · Gallery closed</span>
      <h1 className="detail-title">This wall is empty.</h1>
      <p className="detail-tagline">The work you were looking for isn&rsquo;t hanging here. It may have moved rooms.</p>
      <p style={{ marginTop: 28 }}>
        <Link className="btn" href="/">Back to the exhibition</Link>
      </p>
    </section>
  );
}
