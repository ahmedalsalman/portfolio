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

/** The museum card that hangs beside every work. */
export function WallLabel({ work, detailLink = true }: { work: Work; detailLink?: boolean }) {
  const demo = demoHref(work);
  const lang = languages(work);
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
        <dt>Medium</dt>
        <dd className="medium">{work.stack.slice(0, 5).join(', ')}</dd>
        {lang && (
          <>
            <dt>Languages</dt>
            <dd>{lang}</dd>
          </>
        )}
        {work.repo && work.repo.commits > 0 && (
          <>
            <dt>Dimensions</dt>
            <dd>
              {work.repo.commits.toLocaleString('en')} commits
              {work.repo.authored > 0 && work.repo.authored !== work.repo.commits
                ? `, ${work.repo.authored.toLocaleString('en')} by the artist`
                : ''}
            </dd>
          </>
        )}
        {work.org && (
          <>
            <dt>Collection</dt>
            <dd>{/^personal|own|self/i.test(work.org) ? 'Collection of the artist' : `Made for ${work.org}`}</dd>
          </>
        )}
      </dl>
      <p>{work.tagline}</p>
      <div className="actions">
        {demo && (
          <a className="btn" href={demo.href} target="_blank" rel="noreferrer">
            Enter the work <span aria-hidden="true">↗</span>
          </a>
        )}
        {detailLink && (
          <Link className="link" href={`/work/${work.slug}/`}>
            Read the notes
          </Link>
        )}
      </div>
      {demo?.local && <div className="tag-local" style={{ marginTop: 10 }}>Demo runs locally on :{work.demo?.port}</div>}
    </div>
  );
}
