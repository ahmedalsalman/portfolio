import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { WallLabel } from '@/components/WallLabel';
import { WorkArt } from '@/components/WorkArt';
import { IndexCard } from '@/components/IndexCard';
import { NameCard } from '@/components/NameCard';
import { backends, catalogueNumber, hangFor, rooms, storeroom, type Hang } from '@/lib/works';
import { chronology, contact, skills } from '@/data/artist';

/**
 * Where each featured work hangs. Wide ones span the page with the caption underneath; the others
 * alternate sides down the whole page, not just within a room, so no two in a row line up the same.
 */
function placeFeatured() {
  const placement = new Map<string, { hang: Hang | null; wide: boolean; flip: boolean }>();
  let side = 0;
  for (const w of rooms.flatMap((r) => r.works.slice(0, r.feature))) {
    const hang = hangFor(w);
    const wide = !!hang?.wide;
    placement.set(w.slug, { hang, wide, flip: !wide && side++ % 2 === 1 });
  }
  return placement;
}

/** Everything below the hero: the rooms, the storeroom, about, contact and the footer. */
export function HomeSections() {
  const placement = placeFeatured();
  return (
    <>
      <div id="rooms">
        {rooms.map((room) => (
          <section key={room.id} id={`room-${room.id}`} className="room" aria-labelledby={`h-${room.id}`}>
            <div className="wrap">
              <Reveal className="room-head">
                <span className="room-no" aria-hidden="true">{room.numeral}</span>
                <h2 id={`h-${room.id}`}>{room.title}</h2>
                <p>{room.note}</p>
              </Reveal>

              {room.works.slice(0, room.feature).map((w) => {
                const { hang, wide, flip } = placement.get(w.slug)!;
                return (
                  <Reveal
                    as="article"
                    key={w.slug}
                    className={`work${wide ? ' wide' : ''}${flip ? ' flip' : ''}`}
                    aria-label={w.title}
                  >
                    <Link href={`/work/${w.slug}/`} className="work-art" aria-label={`More about ${w.title}`}>
                      <WorkArt work={w} hang={hang} />
                    </Link>
                    <WallLabel work={w} />
                  </Reveal>
                );
              })}

              {room.works.length > room.feature && (
                <Reveal as="section" className="also" aria-labelledby={`also-${room.id}`}>
                  <h3 id={`also-${room.id}`} className="also-head">
                    Also in this room
                  </h3>
                  <div className="also-grid">
                    {room.works.slice(room.feature).map((w) => (
                      <IndexCard key={w.slug} work={w} />
                    ))}
                  </div>
                </Reveal>
              )}

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
        <div className="wrap">
          <Reveal>
            <NameCard />
          </Reveal>
        </div>
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
            production? Get in touch. I&rsquo;m based in Amman and open to remote roles: I spent four years working
            remotely with teams in Kuwait.
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
        The back-end and infrastructure behind these apps, built with my teammates at ShopRaha and BTR.
      </p>
      <table>
        <thead>
          <tr>
            <th>Repository</th>
            <th>What it does</th>
            <th className="hide-sm">Stack</th>
          </tr>
        </thead>
        <tbody>
          {backends.map((b) => (
            <tr key={b.repo}>
              <td className="repo">{b.repo}</td>
              <td>{b.what}</td>
              <td className="hide-sm">{Array.isArray(b.stack) ? b.stack.join(', ') : b.stack}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Reveal>
  );
}
