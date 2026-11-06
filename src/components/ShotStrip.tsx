'use client';
import { useEffect, useRef, useState } from 'react';
import type { Shot } from '@/lib/works';

export type StripItem = { shot: Shot; caption: string; alt: string };

/**
 * Phone screens in a row that scrolls sideways and runs to the edge of the window, each with its
 * own caption. When the row is wider than the window, arrow buttons appear for mouse users;
 * touch screens just swipe.
 */
export function ShotStrip({ items, label, eager = false }: { items: StripItem[]; label: string; eager?: boolean }) {
  const row = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, []);

  const move = (dir: 1 | -1) => {
    const el = row.current;
    if (!el) return;
    const instant = matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: instant ? 'auto' : 'smooth' });
  };

  return (
    <div className="strip">
      {!(edge.start && edge.end) && (
        <div className="strip-nav">
          <button type="button" className="prev" onClick={() => move(-1)} disabled={edge.start} aria-label="Earlier screens">
            ←
          </button>
          <button type="button" className="next" onClick={() => move(1)} disabled={edge.end} aria-label="More screens">
            →
          </button>
        </div>
      )}
      {/* Focusable so keyboard users can scroll it with the arrow keys. */}
      <ul ref={row} className="strip-row" aria-label={label} tabIndex={0}>
        {items.map(({ shot, caption, alt }, i) => (
          <li key={shot.src} className="strip-item">
            <figure>
              <span className="strip-frame">
                <img
                  src={shot.src}
                  alt={alt}
                  width={shot.width}
                  height={shot.height}
                  loading={eager && i < 4 ? 'eager' : 'lazy'}
                />
              </span>
              {caption && <figcaption>{caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
