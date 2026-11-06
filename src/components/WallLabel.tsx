import Link from 'next/link';
import { catalogueNumber, demoHref, liveLinks, type Work } from '@/lib/works';

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

/** Languages worth pointing out on a caption: anything beyond English, plus right-to-left. */
function captionLanguages(w: Work) {
  const names = [...new Set(w.locales.map((l) => LANG[l] ?? l))];
  if (!names.length || (names.length === 1 && names[0] === 'English')) return '';
  return names.join(', ') + (w.rtl ? ' · RTL' : '');
}

/**
 * The caption beside a featured project: the line that sells it comes straight after the title,
 * then one line for my part and the client. The stack lives on the project page.
 */
export function WallLabel({ work, detailLink = true }: { work: Work; detailLink?: boolean }) {
  const demo = demoHref(work);
  const live = liveLinks(work);
  const lang = captionLanguages(work);
  // Skip the client when the role already names it ("Frontend developer at Media World Software").
  const org = work.org?.split(/[,(]/)[0].trim().toLowerCase() ?? '';
  const forWhom = org && work.role?.toLowerCase().includes(org) ? '' : madeFor(work);
  const credit = [work.role, forWhom].filter(Boolean).join(' · ');
  return (
    <div className="label">
      {/* Two groups so a wide project can set them side by side under its screens. */}
      <div className="label-head">
        <div className="catno">
          {catalogueNumber(work.slug)} · {work.years}
          {lang && ` · ${lang}`}
        </div>
        <h3 className="title">
          {work.title}
          {work.titleNative && (
            <span className="ar" lang="ar" dir="rtl">
              {work.titleNative}
            </span>
          )}
        </h3>
      </div>
      <div className="label-body">
        <p className="pitch">{work.tagline}</p>
        {credit && <p className="credit">{credit}</p>}
        {work.confidential && process.env.NODE_ENV === 'development' && (
          <p className="stamp" style={{ color: '#b4232c' }} title="Only visible in dev. Set curation.hidden or remove before publishing.">
            Confidential: confirm before publishing
          </p>
        )}
        <div className="actions">
          {live.map((l, i) => (
            <a key={l.href} className={i === 0 ? 'btn' : 'link'} href={l.href} target="_blank" rel="noreferrer">
              {l.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
          {demo && (
            <a className="btn" href={demo.href} target="_blank" rel="noreferrer">
              Open the demo <span aria-hidden="true">↗</span>
            </a>
          )}
          {detailLink && (
            <Link className="link" href={`/work/${work.slug}/`}>
              Details
            </Link>
          )}
        </div>
        {demo?.local && <div className="tag-local" style={{ marginTop: 10 }}>Runs locally on port {work.demo?.port}</div>}
      </div>
    </div>
  );
}
