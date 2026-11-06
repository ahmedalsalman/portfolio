import Link from 'next/link';
import { madeFor } from '@/components/WallLabel';
import { catalogueNumber, demoHref, liveLinks, type Work } from '@/lib/works';

/**
 * A work that isn't featured in its room: a small thumbnail, the title, the line that
 * sells it, and the same links as the full wall label. Desktop-first works show their
 * dashboard; phone-only works show two screens side by side.
 */
export function IndexCard({ work }: { work: Work }) {
  const mobile = work.shots.filter((s) => s.kind === 'mobile');
  const desktops = work.shots.filter((s) => s.kind === 'desktop');
  // Phone-first products (far more phone shots than desktop ones) show phones, even if a desktop view exists.
  const desktop = mobile.length > 2 * desktops.length ? undefined : desktops[0];
  const phones = mobile.slice(0, 2);
  const live = liveLinks(work)[0];
  const demo = demoHref(work);
  const forWhom = madeFor(work);
  const href = `/work/${work.slug}/`;

  return (
    <article className="index-card">
      {/* The title link carries the name for screen readers; the thumbnail is a second, mouse-only target. */}
      <Link href={href} className="index-thumb" tabIndex={-1} aria-hidden="true">
        {desktop ? (
          <img src={desktop.src} alt="" loading="lazy" width={desktop.width} height={desktop.height} />
        ) : (
          <span className="index-phones">
            {phones.map((s) => (
              <img key={s.src} src={s.src} alt="" loading="lazy" width={s.width} height={s.height} />
            ))}
          </span>
        )}
      </Link>
      <div className="index-body">
        <span className="catno">
          {catalogueNumber(work.slug)} · {work.years}
          {forWhom && ` · ${forWhom}`}
        </span>
        <h3>
          <Link href={href}>{work.title}</Link>
          {work.titleNative && (
            <span className="ar" lang="ar" dir="rtl">
              {work.titleNative}
            </span>
          )}
        </h3>
        <p>{work.tagline}</p>
        <div className="actions">
          {live ? (
            <a className="link" href={live.href} target="_blank" rel="noreferrer">
              {live.label} <span aria-hidden="true">↗</span>
            </a>
          ) : (
            demo && (
              <a className="link" href={demo.href} target="_blank" rel="noreferrer">
                Open the demo <span aria-hidden="true">↗</span>
              </a>
            )
          )}
          <Link className="link" href={href}>
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
