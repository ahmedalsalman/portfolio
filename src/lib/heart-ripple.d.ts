export interface HeartRippleOptions {
  /** Field colour behind the code. */
  bg?: string;
  /** Colour of the resting code. */
  rest?: string;
  /** Heart colour ramp, light to dark on light fields (dim to bright on dark ones). */
  deep?: string;
  body?: string;
  hi?: string;
  glint?: string;
  restAlpha?: number;
  lightGain?: number;
  waterGlow?: number;
  haloMix?: number;
  /** px/s the heart grows; sets its final size. */
  speed?: number;
  /** ms after mount for the first heart (0 = none). */
  autoFirst?: number;
  /** ms without a click before another heart (0 = never). */
  idleEvery?: number;
  /** Draw on a transparent canvas, so leave() can clear the field. */
  clearable?: boolean;
  /** Element whose clicks send hearts. Defaults to the canvas's parent. */
  target?: HTMLElement | null;
}

export interface HeartRippleHandle {
  set(next: HeartRippleOptions): void;
  /** Send a heart from canvas px (x, y), `age` seconds into its life. Same spot, same heart. */
  heart(x: number, y: number, age?: number): void;
  /**
   * In `delay` ms, stop the code coming in and clear the field from right to left over `ms`,
   * the remaining code draining off to the left ahead of the edge. Needs `clearable`.
   */
  leave(delay: number, ms: number): void;
  destroy(): void;
}

export function mount(canvas: HTMLCanvasElement, options?: HeartRippleOptions): HeartRippleHandle;
