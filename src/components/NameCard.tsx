import { HeartRipple } from '@/components/HeartRipple';
import type { HeartRippleOptions } from '@/lib/heart-ripple';

/** The heartfeltcode.com front door's field: plum, pale code at rest, a gold heart. */
const RIPPLE: HeartRippleOptions = {
  bg: '#41093a',
  rest: '#ddd0d3',
  deep: '#a8782a',
  body: '#f4b63f',
  hi: '#fde7b8',
  glint: '#ffffff',
  restAlpha: 0.07,
  lightGain: 0.22,
  waterGlow: 0.04,
  haloMix: 0.5,
};

/**
 * The bilingual name card that opens About: one name in two halves, English and Arabic,
 * over the Heartfelt Code heart ripple. A click anywhere on the card sends a heart.
 */
export function NameCard() {
  return (
    <div className="namecard" role="img" aria-label="Ahmed Al-Salman, written in English and Arabic">
      <HeartRipple className="namecard-ripple" options={RIPPLE} />
      <div className="namecard-halves" aria-hidden="true">
        <span className="namecard-en">
          Ahmed
          <em>Al-Salman</em>
        </span>
        <span className="namecard-ar" lang="ar" dir="rtl">
          أحمد السلمان
        </span>
      </div>
      <span className="namecard-hint" aria-hidden="true">
        <span lang="ar">مرحبا</span> · hello
      </span>
    </div>
  );
}
