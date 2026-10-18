import type { Shot, Work } from '@/lib/works';

/**
 * How a work hangs: phone-first products as a polyptych of screens,
 * dashboards as a matted print, and mixed ones as a print with a phone leaning on it.
 */
export function WorkArt({ work }: { work: Work }) {
  const mobile = work.shots.filter((s) => s.kind === 'mobile');
  const desktop = work.shots.filter((s) => s.kind === 'desktop');
  const alt = (s: Shot) => `${work.title} — ${s.label || 'screen'}`;

  if (mobile.length >= 3 || (mobile.length >= 2 && desktop.length === 0)) {
    return (
      <div className="polyptych">
        {mobile.slice(0, 3).map((s) => (
          <div className="panel" key={s.src}>
            <img src={s.src} alt={alt(s)} loading="lazy" width={s.width} height={s.height} />
          </div>
        ))}
      </div>
    );
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
