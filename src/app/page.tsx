import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { WallLabel } from '@/components/WallLabel';
import { WorkArt } from '@/components/WorkArt';
import { backends, catalogueNumber, rooms, storeroom, totals } from '@/lib/works';
import { chronology, contact, skills } from '@/data/artist';

export default function Exhibition() {
  const t = totals();
  const hung = rooms.reduce((n, r) => n + r.works.length, 0);

  return (
    <>
      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-grid">
          <div className="canvas" role="img" aria-label="A blue monochrome canvas with the name Ahmed Al-Salman in Arabic and English">
            <div className="name" aria-hidden="true">
              <span className="name-ar" lang="ar">أحمد السلمان</span>
              <span className="name-en">
                Ahmed
                <em>Al-Salman</em>
              </span>
            </div>
            <span className="seam" aria-hidden="true" />
            <span className="canvas-caption" aria-hidden="true">reads both ways</span>
          </div>

          <div className="label hero-label">
            <div className="artist">Ahmed Al-Salman</div>
            <div className="mono" style={{ color: 'var(--muted)' }}>Jordanian, works in Amman</div>
            <h1 id="hero-title" className="title" style={{ marginTop: 14 }}>
              Interfaces that read both ways
            </h1>
            <dl>
              <dt>Year</dt>
              <dd>2020–2026</dd>
              <dt>Medium</dt>
              <dd className="medium">TypeScript, React and Next.js, mostly on phones, mostly right-to-left</dd>
              <dt>Collection</dt>
              <dd>Collection of the artist</dd>
            </dl>
            <p>
              Frontend engineer. Six years of Arabic-first products for mobile operators, sports academies, labs and
              logistics companies. Every work here opens as a running demo.
            </p>
          </div>
        </div>

        <div className="now-showing">
          <span className="eyebrow">
            Now showing · {hung} works in {rooms.length} rooms
            {storeroom.length ? ` · ${storeroom.length} in storage` : ''}
          </span>
          {rooms.map((r) => (
            <a key={r.id} href={`#room-${r.id}`}>
              {r.numeral}. {r.title}
            </a>
          ))}
        </div>
      </section>

      <div id="rooms">
        {rooms.map((room) => (
          <section key={room.id} id={`room-${room.id}`} className="room" aria-labelledby={`h-${room.id}`}>
            <div className="wrap">
              <Reveal className="room-head">
                <span className="room-no" aria-hidden="true">{room.numeral}</span>
                <h2 id={`h-${room.id}`}>
                  <span className="sr-only">Room {room.numeral}: </span>
                  {room.title}
                </h2>
                <p>{room.note}</p>
              </Reveal>

              {room.works.map((w, i) => (
                <Reveal as="article" key={w.slug} className={`work${i % 2 ? ' flip' : ''}`} aria-label={w.title}>
                  <Link href={`/work/${w.slug}/`} className="work-art" aria-label={`${w.title}: read the notes`}>
                    <WorkArt work={w} />
                  </Link>
                  <WallLabel work={w} />
                </Reveal>
              ))}

              {room.id === 'shopraha' && backends.length > 0 && <BehindTheWalls />}
            </div>
          </section>
        ))}
      </div>

      {storeroom.length > 0 && (
        <section id="storeroom" className="storeroom" aria-labelledby="h-store">
          <div className="wrap">
            <span className="eyebrow">Reserve collection · not on display</span>
            <h2 id="h-store">The Storeroom</h2>
            <p className="lede">
              Sketches, studies and starters: real code that runs, kept off the main walls because it isn&rsquo;t
              finished to the same standard. Each one still opens as a demo.
            </p>
            <div className="crates">
              {storeroom.map((w) => {
                const thumb = w.shots.find((s) => s.kind === 'desktop') ?? w.shots[0];
                return (
                  <Link key={w.slug} href={`/work/${w.slug}/`} className="crate">
                    <div className="thumb">{thumb && <img src={thumb.src} alt="" loading="lazy" />}</div>
                    <div className="body">
                      <span className="stamp">
                        {catalogueNumber(w.slug)} · {w.years}
                      </span>
                      <h3>{w.title}</h3>
                      <p>{w.polishNote || w.tagline}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section id="chronology" className="chron" aria-labelledby="h-chron">
        <div className="wrap chron-grid">
          <Reveal>
            <span className="eyebrow">Artist&rsquo;s statement</span>
            <h2 id="h-chron">Chronology</h2>
            <div className="statement">
              <p>
                Most of what I build is read from right to left, on a phone, by someone who arrived from an SMS link
                and will leave if the page takes four seconds. That constraint shaped everything here.
              </p>
              <p>
                I trained as a civil engineer, so I still think in loads and tolerances: what the interface has to
                carry, and how far it can bend before it breaks.
              </p>
            </div>
            <div className="skills">
              {skills.map((s) => (
                <div key={s.group}>
                  <b>{s.group}</b>
                  <span>{s.items}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <ol>
              {chronology.map((c) => (
                <li key={c.when + c.what}>
                  <span className="when">{c.when}</span>
                  <div>
                    <div className="what">{c.what}</div>
                    <div className="where">{c.where}</div>
                    {c.detail && <p className="detail">{c.detail}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section id="enquiries" className="enquiries" aria-labelledby="h-enq">
        <div className="wrap">
          <span className="eyebrow">Enquiries</span>
          <h2 id="h-enq">Commissions are open.</h2>
          <div className="contact">
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <a href={contact.github} target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
        </div>
      </section>
      <footer className="site-footer">
        <div className="wrap">
          <span>© {new Date().getFullYear()} Ahmed Al-Salman · Amman</span>
          <span>{t.authored.toLocaleString('en')} commits by the artist across {t.works} works</span>
        </div>
      </footer>
    </>
  );
}

function BehindTheWalls() {
  return (
    <Reveal className="plaque">
      <h3>Behind the walls</h3>
      <p>
        The services these screens talked to. No demos: this is back-end and infrastructure, most of it built by
        teammates. Where the artist&rsquo;s own commits are in there, they&rsquo;re counted.
      </p>
      <table>
        <thead>
          <tr>
            <th>Repository</th>
            <th>What it does</th>
            <th className="hide-sm">Stack</th>
            <th>Commits by the artist</th>
          </tr>
        </thead>
        <tbody>
          {backends.map((b) => (
            <tr key={b.repo}>
              <td className="repo">{b.repo}</td>
              <td>{b.what}</td>
              <td className="hide-sm">{Array.isArray(b.stack) ? b.stack.join(', ') : b.stack}</td>
              <td className="num">
                {b.authoredByAhmed ? b.authoredByAhmed.toLocaleString('en') : '—'}
                {b.commits ? ` / ${b.commits.toLocaleString('en')}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Reveal>
  );
}
