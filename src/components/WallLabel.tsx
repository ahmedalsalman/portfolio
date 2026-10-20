import Link from 'next/link';
import { catalogueNumber, demoHref, type Work } from '@/lib/works';

const LANG: Record<string, string> = {
  ar: 'Arabic', en: 'English', fr: 'French', ku: 'Kurdish', ckb: 'Kurdish', tr: 'Turkish',
};

export function languages(w: Work) {
  const names = [...new Set(w.locales.map((l) => LANG[l] ?? l))];
  if (!names.length) return '';
  return names.join(', ') + (w.rtl ? ' · right-to-left' : '');
}

export function madeFor(w: Work) {
  if (!w.org) return '';
  return /^(personal|own|self)/i.test(w.org) ? 'Personal project' : `For ${w.org}`;
}

/** The small label that sits beside every project, like a gallery card. */
export function WallLabel({ work, detailLink = true }: { work: Work; detailLink?: boolean }) {
  const demo = demoHref(work);
  const lang = languages(work);
  const forWhom = madeFor(work);
  return (
    <div className="label">
      <div className="catno">{catalogueNumber(work.slug)}</div>
      <h3 className="title">
        {work.title}
        {work.titleNative && (
          <span className="ar" lang="ar" dir="rtl">
            {work.titleNative}
          </span>
        )}
      </h3>
      <dl>
        <dt>Year</dt>
        <dd>{work.years}</dd>
        {forWhom && (
          <>
            <dt>Made for</dt>
            <dd>{forWhom}</dd>
          </>
        )}
        {work.role && (
          <>
            <dt>My part</dt>
            <dd>{work.role}</dd>
          </>
        )}
        <dt>Built with</dt>
        <dd className="medium">{work.stack.slice(0, 5).join(', ')}</dd>
        {lang && (
          <>
            <dt>Languages</dt>
            <dd>{lang}</dd>
          </>
        )}
      </dl>
      <p>{work.tagline}</p>
      {work.confidential && process.env.NODE_ENV === 'development' && (
        <p className="stamp" style={{ color: '#b4232c' }} title="Only visible in dev. Set curation.hidden or remove before publishing.">
          Confidential: confirm before publishing
        </p>
      )}
      <div className="actions">
        {demo && (
          <a className="btn" href={demo.href} target="_blank" rel="noreferrer">
            Open the demo <span aria-hidden="true">↗</span>
          </a>
        )}
        {detailLink && (
          <Link className="link" href={`/work/${work.slug}/`}>
            More about it
          </Link>
        )}
      </div>
      {demo?.local && <div className="tag-local" style={{ marginTop: 10 }}>Runs locally on port {work.demo?.port}</div>}
    </div>
  );
}
