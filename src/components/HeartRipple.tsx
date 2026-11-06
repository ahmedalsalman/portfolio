'use client';

import { useEffect, useRef } from 'react';
import type { HeartRippleOptions } from '@/lib/heart-ripple';

/**
 * The brand's heart ripple: drifting code behind a hero; a click anywhere in the
 * canvas's parent sends a heart through it. Loaded lazily, and a plain coloured
 * box where WebGL2 isn't available.
 */
export function HeartRipple({ options, className }: { options: HeartRippleOptions; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const key = JSON.stringify(options);

  useEffect(() => {
    let handle: { destroy(): void } | undefined;
    let cancelled = false;
    import('@/lib/heart-ripple').then(({ mount }) => {
      if (!cancelled && canvas.current) handle = mount(canvas.current, JSON.parse(key));
    });
    return () => {
      cancelled = true;
      handle?.destroy();
    };
  }, [key]);

  return <canvas ref={canvas} aria-hidden="true" className={className} />;
}
