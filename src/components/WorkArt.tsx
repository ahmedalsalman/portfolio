import type { CSSProperties } from 'react';
import type { Hang, HangPiece, Shot, Work } from '@/lib/works';

/**
 * How a featured work hangs on the home page. Works with a hand-picked layout (curation.json "hang")
 * show screens cropped to the part that's different; the rest fall back to an automatic layout:
 * phone-first products as a polyptych, dashboards as a matted print, mixed ones as a print with a
 * phone leaning on it.
 */
export function WorkArt({ work, hang }: { work: Work; hang?: Hang | null }) {
  const alt = (s: Shot) => `${work.title}: ${s.label || 'screen'}`;

  if (hang) {
    if (hang.layout === 'polyptych') return <Polyptych shots={hang.pieces.map((p) => p.shot)} alt={alt} />;
    const cls =
      hang.layout === 'lean' ? `hang hang-lean lean-${hang.side}` : hang.layout === 'bento' ? 'hang hang-bento' : 'hang hang-row';
    return (
      <div className={cls}>
        {hang.pieces.map((p) => (
          <Piece key={p.shot.src} piece={p} alt={alt(p.shot)} />
        ))}
      </div>
    );
  }

  const mobile = work.shots.filter((s) => s.kind === 'mobile');
  const desktop = work.shots.filter((s) => s.kind === 'desktop');
  if (mobile.length >= 3 || (mobile.length >= 2 && desktop.length === 0)) {
    return <Polyptych shots={mobile.slice(0, 3)} alt={alt} />;
  }
  if (desktop.length && mobile.length) {
    return (
      <div className="combo">
        <div className="frame">
          <img src={desktop[0].src} alt={alt(desktop[0])} loading="lazy" width={desktop[0].width} height={desktop[0].height} />
        </div>
        <div className="panel">
          <img src={mobile[0].src} alt={alt(mobile[0])} loading="lazy" width={mobile[0].width} height={mobile[0].height} />
        </div>
      </div>
    );
  }
  const s = desktop[0] ?? mobile[0];
  if (!s) return <div className="frame" style={{ aspectRatio: '16/10', background: work.accent }} />;
  return (
    <div className="frame">
      <img src={s.src} alt={alt(s)} loading="lazy" width={s.width} height={s.height} />
    </div>
  );
}

function Polyptych({ shots, alt }: { shots: Shot[]; alt: (s: Shot) => string }) {
  return (
    <div className="polyptych">
      {shots.map((s) => (
        <div className="panel" key={s.src}>
          <img src={s.src} alt={alt(s)} loading="lazy" width={s.width} height={s.height} />
        </div>
      ))}
    </div>
  );
}

/**
 * One screen in its mat, showing only the cropped region. The window takes the crop's shape; the
 * image is scaled up and shifted so the region fills it. Stretched taller by its neighbours, the
 * window shows a little more of the screen below the crop.
 */
function Piece({ piece, alt }: { piece: HangPiece; alt: string }) {
  const { shot, crop, narrow } = piece;
  const [x, y, w, h] = crop;
  const phone = shot.kind === 'mobile';
  const W = shot.width ?? (phone ? 390 : 1600);
  const H = shot.height ?? (phone ? 844 : 1000);
  const cw = Math.round(w * W);
  const ch = Math.round(h * H);
  return (
    <div
      className={`piece ${phone ? 'is-phone' : 'is-screen'}${narrow ? '' : ' hide-narrow'}`}
      style={{ '--a': (cw / ch).toFixed(4) } as CSSProperties}
    >
      <span className="crop" style={{ aspectRatio: `${cw} / ${ch}` }}>
        <img
          src={shot.src}
          alt={alt}
          loading="lazy"
          width={W}
          height={H}
          style={{ width: `${(100 / w).toFixed(3)}%`, transform: `translate(${(-x * 100).toFixed(2)}%, ${(-y * 100).toFixed(2)}%)` }}
        />
      </span>
    </div>
  );
}
