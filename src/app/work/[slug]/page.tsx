import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/Reveal';
import { ShotStrip, type StripItem } from '@/components/ShotStrip';
import { languages } from '@/components/WallLabel';
import { allWorks, catalogueNumber, demoHref, getWork, leadShot, liveLinks, neighbours, type Shot } from '@/lib/works';

export const dynamicParams = false;

export function generateStaticParams() {
  // A static export needs at least one param; the placeholder renders a 404.
  return allWorks.length ? allWorks.map((w) => ({ slug: w.slug })) : [{ slug: '_' }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const w = getWork((await params).slug);
  if (!w) return {};
  const url = `/work/${w.slug}/`;
  // Each project shares with its own card; one added since the last render falls back to the home card.
  const card = existsSync(join(process.cwd(), 'public/og/work', `${w.slug}.jpg`)) ? `/og/work/${w.slug}.jpg` : '/og/home.jpg';
  return {
    title: w.title,
    description: w.tagline,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: 'Ahmed Al-Salman',
      locale: 'en',
      url,
      title: `${w.title} — Ahmed Al-Salman`,
      description: w.tagline,
      images: [{ url: card, width: 1200, height: 630, alt: `${w.title}: ${w.tagline}` }],
    },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const work = getWork((await params).slug);
  if (!work) notFound();

  const demo = demoHref(work);
  const { prev, next } = neighbours(work.slug);
  const mobile = work.shots.filter((s) => s.kind === 'mobile');
  const desktop = work.shots.filter((s) => s.kind === 'desktop');
  const lang = languages(work);
  const live = liveLinks(work);

  // The lead: real screens straight under the title. Phone-first products lead with their phone
  // screens in a strip (one per group when grouped, e.g. per brand or language); the rest lead
  // with one large desktop screen, preferring one that isn't a full-page capture.
  const phoneLed = mobile.length >= 2 && mobile.length >= desktop.length;
  const leadStrip: StripItem[] = !phoneLed
    ? []
    : work.groups?.length
      ? work.groups.flatMap((g) => {
          const s = mobile.find((m) => m.group === g.id);
          return s ? [{ shot: s, caption: g.title, alt: `${work.title}, ${g.title}: ${s.label || 'screen'}` }] : [];
        })
      : stripItems(work.title, mobile);
  const isFullPage = (s: Shot) => !!s.width && !!s.height && s.height / s.width > 0.8;
  const leadDesk = phoneLed
    ? undefined
    : (leadShot(work) ?? desktop.find((s) => !isFullPage(s)) ?? desktop[0]);
  // A full-page capture is cropped in the lead, so it still appears whole further down.
  const galleryDesktop = desktop.filter((s) => s !== leadDesk || isFullPage(s));
  const galleryShots = phoneLed ? galleryDesktop : [...mobile, ...galleryDesktop];

  return (
    <article>
      <header className="detail-head wrap">
        <div className="crumbs">
          <Link href="/#rooms" className="link">← All projects</Link>
          <span className="eyebrow">
            {catalogueNumber(work.slug)} · {work.years}
            {!work.polished && ' · experiment'}
          </span>
        </div>
        <h1 className="detail-title">{work.title}</h1>
        {work.titleNative && (
          <span className="detail-native" lang="ar" dir="rtl">
            {work.titleNative}
          </span>
        )}
        <p className="detail-tagline">{work.tagline}</p>
        {live.length > 0 && (
          <div style={{ marginTop: 28, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            {live.map((l, i) => (
              <a key={l.href} className={i === 0 ? 'btn' : 'link'} href={l.href} target="_blank" rel="noreferrer">
                {l.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}
        {demo && (
          <div style={{ marginTop: 28, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <a className="btn" href={demo.href} target="_blank" rel="noreferrer">
              Open the demo <span aria-hidden="true">↗</span>
            </a>
            {demo.local && <span className="tag-local">Runs locally on port {work.demo?.port}</span>}
          </div>
        )}
      </header>

      {leadStrip.length > 0 && (
        <div className="detail-lead">
          <ShotStrip items={leadStrip} label={`${work.title}: screens`} eager />
        </div>
      )}
      {leadDesk && (
        <figure className="detail-lead detail-lead-desk wrap">
          <div className="frame">
            <img
              src={leadDesk.src}
              alt={`${work.title}: ${leadDesk.label || 'screen'}`}
              width={leadDesk.width}
              height={leadDesk.height}
              fetchPriority="high"
            />
          </div>
          {leadDesk.label && <figcaption>{leadDesk.label}</figcaption>}
        </figure>
      )}

      <div className="wrap">
        <div className="detail-body">
          <div>
            <p className="summary">{work.summary}</p>
            {work.highlights.length > 0 && (
              <>
                <span className="eyebrow">What it does</span>
                <ol className="notes" style={{ marginTop: 10 }}>
                  {work.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ol>
              </>
            )}
          </div>
          <dl className="factsheet">
            {work.role && (
              <div>
                <dt>My part</dt>
                <dd>{work.role}</dd>
              </div>
            )}
            {work.org && (
              <div>
                <dt>Made for</dt>
                <dd>{work.org}</dd>
              </div>
            )}
            <div>
              <dt>Built with</dt>
              <dd className="chips">
                {work.stack.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </dd>
            </div>
            {(lang || work.platforms.length > 0) && (
              <div>
                <dt>Platforms</dt>
                <dd>
                  {work.platforms.join(', ')}
                  {lang && <><br />{lang}</>}
                </dd>
              </div>
            )}
            {work.repo && work.repo.commits > 0 && work.repo.authored < work.repo.commits && (
              <div>
                <dt>Team project</dt>
                <dd>
                  {work.repo.authored > 0
                    ? `I wrote ${work.repo.authored.toLocaleString('en')} of its ${work.repo.commits.toLocaleString('en')} commits.`
                    : 'Built by my teammates, on the backend and dashboards I worked on.'}
                </dd>
              </div>
            )}
            {process.env.NODE_ENV === 'development' && work.polishNote && (
              <div>
                <dt>Condition report (dev only) · {work.polishScore}/5</dt>
                <dd>{work.polishNote}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {work.groups?.length ? (
        <section className="plates" aria-label="Screens">
          {work.groups.map((g) => {
            const shots = work.shots.filter((s) => s.group === g.id);
            if (!shots.length) return null;
            return (
              <section key={g.id} className="shot-group" aria-labelledby={`g-${g.id}`}>
                <div className="wrap">
                  <Reveal className="shot-group-head">
                    <span className="shot-group-swatch" style={{ background: g.accent ?? work.accent }} aria-hidden="true" />
                    <h2 id={`g-${g.id}`}>{g.title}</h2>
                    <p>{g.note}</p>
                  </Reveal>
                </div>
                <Plates title={`${work.title}, ${g.title}`} shots={shots} />
              </section>
            );
          })}
        </section>
      ) : (
        galleryShots.length > 0 && (
          <section className="plates" aria-label="More screens">
            <Plates title={work.title} shots={galleryShots} />
          </section>
        )
      )}

      <nav className="pager wrap" aria-label="More projects">
        {prev ? (
          <Link href={`/work/${prev.slug}/`}>
            <span className="eyebrow">Previous project</span>
            <b>{prev.title}</b>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/work/${next.slug}/`}>
            <span className="eyebrow">Next project</span>
            <b>{next.title}</b>
          </Link>
        ) : (
          <span />
        )}
      </nav>
      <footer className="site-footer">
        <div className="wrap">
          <span>© {new Date().getFullYear()} Ahmed Al-Salman</span>
          <Link href="/#contact">Contact</Link>
        </div>
      </footer>
    </article>
  );
}

function stripItems(title: string, shots: Shot[]): StripItem[] {
  return shots.map((s) => ({ shot: s, caption: s.label, alt: `${title}: ${s.label || 'screen'}` }));
}

/** Phone screens as a sideways strip, each captioned, then each desktop screen in its own frame. */
function Plates({ title, shots }: { title: string; shots: Shot[] }) {
  const mobile = shots.filter((s) => s.kind === 'mobile');
  const desktop = shots.filter((s) => s.kind === 'desktop');
  return (
    <>
      {mobile.length > 0 && (
        <Reveal>
          <ShotStrip items={stripItems(title, mobile)} label={`${title}: phone screens`} />
        </Reveal>
      )}
      {desktop.map((s) => (
        <Reveal as="figure" className="plate wrap" key={s.src}>
          <div className="frame">
            <img src={s.src} alt={`${title}: ${s.label || 'screen'}`} loading="lazy" width={s.width} height={s.height} />
          </div>
          {s.label && <figcaption>{s.label}</figcaption>}
        </Reveal>
      ))}
    </>
  );
}
