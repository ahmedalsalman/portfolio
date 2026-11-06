import Link from 'next/link';
import { RoomIndex } from '@/components/RoomIndex';
import { catalogueNumber, heroStrip as items } from '@/lib/works';

// The strip's screens are chosen in curation.json ('heroStrip'): phones and dashboards
// alternate so it shows the range of the work.

/**
 * The home page hero: the statement leads in large type, the name is a signature above it, and the
 * work runs underneath as a strip of real screens on a band of the accent colour.
 */
export function HeroStrip() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap">
        <p className="hb-eyebrow">
          <span className="hb-sig">
            Ahmed Al-Salman <span lang="ar">أحمد السلمان</span>
          </span>
          <span className="hb-role">Frontend developer · based in Amman, working remotely</span>
        </p>
        <h1 id="hero-title" className="hb-title">
          I build <em>fast</em> web and mobile apps, from consumer products to the tools that run a business.
        </h1>
        <div className="hb-foot">
          <p>
            Six years shipping products for mobile operators, sports clubs, labs and logistics companies, from the
            first sketch to production, most of it remotely with teams in other countries. Client work links to the
            live product; the rest runs as a demo, so you can try it yourself.
          </p>
          <div className="hb-cta">
            <a className="btn" href="#rooms">
              See the work <span aria-hidden="true">↓</span>
            </a>
            <a className="link" href="#contact">
              Get in touch
            </a>
          </div>
        </div>
      </div>

      <div className="hb-band">
        <ul className="hb-strip" aria-label="Screens from the work below">
          {items.map(({ work, shot }) => (
            <li key={work.slug} className={`hb-item hb-${shot.kind}`}>
              <Link href={`/work/${work.slug}/`}>
                <span className="hb-frame">
                  <img src={shot.src} alt={`${work.title}: ${shot.label || 'screen'}`} width={shot.width} height={shot.height} />
                </span>
                <span className="hb-cap">
                  <span className="hb-no">{catalogueNumber(work.slug)}</span> {work.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="wrap">
        <RoomIndex />
      </div>
    </section>
  );
}
