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
            <div className="mono" style={{ color: 'var(--muted)' }}>Frontend developer · Amman, Jordan</div>
            <h1 id="hero-title" className="title" style={{ marginTop: 14 }}>
              Hi, I&rsquo;m Ahmed. I build web and mobile apps, mostly in Arabic.
            </h1>
            <p>
              For the past six years I&rsquo;ve worked with small teams on apps for mobile operators, sports clubs,
              labs and delivery companies. Below are the projects I&rsquo;ve been part of. Each one has a demo you
              can open and try.
            </p>
          </div>
        </div>

        <div className="now-showing">
          <span className="eyebrow">
            {hung} projects
            {storeroom.length ? ` · ${storeroom.length} smaller experiments at the end` : ''}
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
            <span className="eyebrow">Smaller projects</span>
            <h2 id="h-store">Experiments and early work</h2>
            <p className="lede">
              Starters, practice projects and things I haven&rsquo;t finished. They&rsquo;re rougher than the work
              above, but each one still runs.
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
            <span className="eyebrow">About</span>
            <h2 id="h-about">A little about me</h2>
            <div className="statement">
              <p>
                Most of the people who use what I work on read Arabic, are on a phone, and don&rsquo;t have time for
                a slow or confusing page. I try to keep things simple and quick for them.
              </p>
              <p>
                I studied civil engineering before moving into software, and I&rsquo;ve learned a lot from the
                teams I&rsquo;ve worked with along the way.
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
          <h2 id="h-contact">Say hello.</h2>
          <p className="contact-note">
            Whether it&rsquo;s a project, a question about something here, or just a chat about building in Arabic,
            I&rsquo;d be glad to hear from you.
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
          <span>© {new Date().getFullYear()} Ahmed Al-Salman · Amman</span>
          <span>Thanks for stopping by.</span>
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
        Back-end and infrastructure the apps above rely on, built mostly by my teammates at ShopRaha and BTR. I list
        them here to credit their work; where I contributed too, my commits are counted.
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
