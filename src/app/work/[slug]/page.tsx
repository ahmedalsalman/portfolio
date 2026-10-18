import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/Reveal';
import { languages } from '@/components/WallLabel';
import { allWorks, catalogueNumber, demoHref, getWork, neighbours } from '@/lib/works';

export const dynamicParams = false;

export function generateStaticParams() {
  // A static export needs at least one param; the placeholder renders a 404.
  return allWorks.length ? allWorks.map((w) => ({ slug: w.slug })) : [{ slug: '_' }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const w = getWork((await params).slug);
  return w ? { title: w.title, description: w.tagline } : {};
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const work = getWork((await params).slug);
  if (!work) notFound();

  const demo = demoHref(work);
  const { prev, next } = neighbours(work.slug);
  const mobile = work.shots.filter((s) => s.kind === 'mobile');
  const desktop = work.shots.filter((s) => s.kind === 'desktop');
  const lang = languages(work);
  const runCmd = work.demo?.dir ? `cd "${work.demo.dir}"\n${work.demo.run}` : null;

  return (
    <article>
      <header className="detail-head wrap">
        <div className="crumbs">
          <Link href="/#rooms" className="link">← Exhibition</Link>
          <span className="eyebrow">
            {catalogueNumber(work.slug)} · {work.years}
            {!work.polished && ' · from the storeroom'}
          </span>
        </div>
        <h1 className="detail-title">{work.title}</h1>
        {work.titleNative && (
          <span className="detail-native" lang="ar" dir="rtl">
            {work.titleNative}
          </span>
        )}
        <p className="detail-tagline">{work.tagline}</p>
        {demo && (
          <div style={{ marginTop: 28, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <a className="btn" href={demo.href} target="_blank" rel="noreferrer">
              Enter the work <span aria-hidden="true">↗</span>
            </a>
            {demo.local && <span className="tag-local">Runs locally on :{work.demo?.port} — start it first</span>}
          </div>
        )}
      </header>

      <div className="wrap">
        <div className="detail-body">
          <div>
            <p className="summary">{work.summary}</p>
            {work.highlights.length > 0 && (
              <>
                <span className="eyebrow">Notes on the work</span>
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
                <dt>Role</dt>
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
              <dt>Medium</dt>
              <dd className="chips">
                {work.stack.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </dd>
            </div>
            {(lang || work.platforms.length > 0) && (
              <div>
                <dt>Format</dt>
                <dd>
                  {work.platforms.join(', ')}
                  {lang && <><br />{lang}</>}
                </dd>
              </div>
            )}
            {work.repo && work.repo.commits > 0 && (
              <div>
                <dt>Dimensions</dt>
                <dd>
                  {work.repo.commits.toLocaleString('en')} commits
                  {work.repo.authored > 0 && `, ${work.repo.authored.toLocaleString('en')} by the artist`}
                </dd>
              </div>
            )}
            {runCmd && (
              <div>
                <dt>Run the demo</dt>
                <dd>
                  <div className="runbox">{runCmd}</div>
                </dd>
              </div>
            )}
            {!work.polished && work.polishNote && (
              <div>
                <dt>Condition report</dt>
                <dd>{work.polishNote}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <section className="plates wrap" aria-label="Screens">
        {mobile.length > 0 && (
          <Reveal as="figure" className="plate" style={{ margin: 0 }}>
            <div className="polyptych">
              {mobile.map((s) => (
                <div className="panel" key={s.src}>
                  <img src={s.src} alt={`${work.title} — ${s.label}`} loading="lazy" width={s.width} height={s.height} />
                </div>
              ))}
            </div>
            <figcaption>{mobile.map((s) => s.label).filter(Boolean).join(' · ')}</figcaption>
          </Reveal>
        )}
        {desktop.map((s) => (
          <Reveal as="figure" className="plate" key={s.src} style={{ margin: 0 }}>
            <div className="frame">
              <img src={s.src} alt={`${work.title} — ${s.label}`} loading="lazy" width={s.width} height={s.height} />
            </div>
            <figcaption>{s.label}</figcaption>
          </Reveal>
        ))}
      </section>

      <nav className="pager wrap" aria-label="More works">
        {prev ? (
          <Link href={`/work/${prev.slug}/`}>
            <span className="eyebrow">Previous work</span>
            <b>{prev.title}</b>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/work/${next.slug}/`}>
            <span className="eyebrow">Next work</span>
            <b>{next.title}</b>
          </Link>
        ) : (
          <span />
        )}
      </nav>
      <footer className="site-footer">
        <div className="wrap">
          <span>© {new Date().getFullYear()} Ahmed Al-Salman · Amman</span>
          <Link href="/#enquiries">Enquiries</Link>
        </div>
      </footer>
    </article>
  );
}
