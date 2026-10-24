import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { WallLabel } from '@/components/WallLabel';
import { WorkArt } from '@/components/WorkArt';
import { backends, catalogueNumber, rooms, storeroom } from '@/lib/works';
import { chronology, contact, skills } from '@/data/artist';

export default function Home() {
  const hung = rooms.reduce((n, r) => n + r.works.length, 0);

  return (
    <>
      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-grid">
          <div className="canvas" role="img" aria-label="Ahmed Al-Salman, written in Arabic and English">
            <div className="name" aria-hidden="true">
              <span className="name-ar" lang="ar">أحمد السلمان</span>
              <span className="name-en">
                Ahmed
                <em>Al-Salman</em>
              </span>
            </div>
            <span className="seam" aria-hidden="true" />
            <span className="canvas-caption" aria-hidden="true">
              <span lang="ar">مرحبا</span> · hello
            </span>
          </div>

          <div className="label hero-label">
            <div className="artist">Ahmed Al-Salman</div>
            <div className="mono" style={{ color: 'var(--muted)' }}>Frontend developer · based in Amman, working remotely</div>
            <h1 id="hero-title" className="title" style={{ marginTop: 14 }}>
              I build fast web and mobile apps, from consumer products to the tools that run a business.
            </h1>
            <p>
              Six years shipping products for mobile operators, sports clubs, labs and logistics companies, from the
              first sketch to production, most of it remotely with teams in other countries. Every project below runs
              as a live demo, so you can try it yourself.
            </p>
          </div>
        </div>

        <div className="now-showing">
          <span className="eyebrow">
            {hung} projects
            {storeroom.length ? ` · ${storeroom.length} experiments` : ''}
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
                <h2 id={`h-${room.id}`}>{room.title}</h2>
                <p>{room.note}</p>
              </Reveal>

              {room.works.map((w, i) => (
                <Reveal as="article" key={w.slug} className={`work${i % 2 ? ' flip' : ''}`} aria-label={w.title}>
                  <Link href={`/work/${w.slug}/`} className="work-art" aria-label={`More about ${w.title}`}>
                    <WorkArt work={w} />
                  </Link>
                  <WallLabel work={w} />
                </Reveal>
              ))}

              {room.id === 'shopraha' && backends.length > 0 && <TheServicesBehind />}
            </div>
          </section>
        ))}
      </div>

      {storeroom.length > 0 && (
        <section id="storeroom" className="storeroom" aria-labelledby="h-store">
          <div className="wrap">
            <span className="eyebrow">Experiments</span>
            <h2 id="h-store">Experiments and early work</h2>
            <p className="lede">
              Prototypes and starters where I tried out new tools and ideas before using them on client work. Each
              one runs as a demo.
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
                      <p>{w.tagline}</p>
                      {process.env.NODE_ENV === 'development' && w.polishNote && (
                        <p style={{ marginTop: 8, fontStyle: 'italic' }} title="Dev only: builder's condition note">
                          {w.polishScore}/5 · {w.polishNote}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section id="about" className="chron" aria-labelledby="h-about">
        <div className="wrap chron-grid">
          <Reveal>
            <figure className="portrait">
              <div className="frame">
                <img src="/about/ahmed.webp" alt="Ahmed Al-Salman, smiling, standing by a bicycle on a tree-lined path in evening sunlight" width={520} height={650} loading="lazy" />
              </div>
            </figure>
            <span className="eyebrow">About</span>
            <h2 id="h-about">How I work</h2>
            <div className="statement">
              <p>
                I build for real conditions: a phone on a weak connection, a user in a hurry, an interface that has
                to work in more than one language. That shapes every decision: lean pages, clear flows, and
                internationalisation designed in from the start. I&rsquo;ve shipped products in English, Arabic,
                French and Kurdish, in both reading directions.
              </p>
              <p>
                I came to software from civil engineering, and I still work like an engineer: understand the
                constraints, then build something that holds up. I do my best work in small teams, owning a product
                end to end.
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

      <section id="contact" className="enquiries" aria-labelledby="h-contact">
        <div className="wrap">
          <span className="eyebrow">Contact</span>
          <h2 id="h-contact">Let&rsquo;s build something.</h2>
          <p className="contact-note">
            Have a product in mind, or a team that needs a frontend developer who can own a feature from design to
            production? Get in touch. I work remotely with teams anywhere.
          </p>
          <div className="contact">
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <a href={contact.github} target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
        </div>
      </section>
      <footer className="site-footer">
        <div className="wrap">
          <span>© {new Date().getFullYear()} Ahmed Al-Salman</span>
          <span>Based in Amman · open to remote work worldwide</span>
        </div>
      </footer>
    </>
  );
}

function TheServicesBehind() {
  return (
    <Reveal className="plaque">
      <h3>The services behind these apps</h3>
      <p>
        The back-end and infrastructure behind these apps, built with my teammates at ShopRaha and BTR. Where I
        contributed, my commits are counted.
      </p>
      <table>
        <thead>
          <tr>
            <th>Repository</th>
            <th>What it does</th>
            <th className="hide-sm">Stack</th>
            <th>My commits</th>
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
