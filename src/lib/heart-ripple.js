// Heart ripple: a field of drifting code; a click sends a heart-shaped wave through it.
// Port of ripple-gl-combo(.html / -light.html) as a mountable component:
//   mount(canvas, opts) → { set(opts), heart(x, y, age), leave(delay, ms), destroy() }
// The canvas fills its CSS box; clicks are taken from opts.target (default: the
// canvas's parent), so text laid over the canvas still sends hearts.
// Colours are options, so one shader serves light pages (ramp pale → dark) and
// dark ones (ramp dim → bright). Needs WebGL2; without it the canvas keeps its
// CSS background and nothing else happens.
// (ES module: the original IIFE wrapper is gone; mount is exported at the end.)
  const CHARS = Array.from({ length: 94 }, (_, i) => String.fromCharCode(33 + i)).join('');
  const FONT = 12, CW = 7.2, CH = 15;
  const MAX_RIPPLES = 16;
  const PARAMS_W = 24;      // texels (×4 floats) of settings per ripple
  const LIFE = 2.4;         // s, must match the shader
  const VARIABILITY = 1.7;  // must match the shader
  const CLEAR_SOFT = 0.35;  // leave(): width of the soft clearing edge, as a share of the width

  const DEFAULTS = {
    bg: '#FFFFFF', rest: '#3A3834',
    deep: '#8C5A8E', body: '#6E3070', hi: '#4A154B', glint: '#1C1814',
    restAlpha: 0.09, lightGain: 0.24, waterGlow: 0.05, haloMix: 0.22,
    speed: 250,             // px/s the heart grows; sets its final size
    autoFirst: 700,         // ms after mount for the first heart (0 = none)
    idleEvery: 7000,        // ms without a click before another heart (0 = never)
    clearable: false,       // draw on a transparent canvas, so leave() can clear the field
    target: null,
  };

  const hex = h => {
    const n = parseInt(String(h).replace('#', '').slice(0, 6), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  };

  // ─── shaders ───────────────────────────────────────────────
  const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

  const COMMON = `#version 300 es
precision highp float;
precision highp int;
const float CW = 7.2, CH = 15.0;
const float PI = 3.14159265359, TAU = 6.28318530718;
const float LIGHT_SCALE = 170.0, LIGHT_STRETCH = 1.5, LIGHT_MORPH = 0.14;
const vec2 LIGHT_FLOW = vec2(-72.0, 6.0);   // px/s: current flowing left
const float LIGHT_FLOOR = 0.2, LIGHT_FULL = 0.8;
float riverLight(vec2 q, float t) {
  float px = (q.x - LIGHT_FLOW.x * t) / (LIGHT_SCALE * LIGHT_STRETCH);
  float py = (q.y - LIGHT_FLOW.y * t) / LIGHT_SCALE;
  float tm = t * LIGHT_MORPH, ix = px, iy = py, c = 1.0;
  for (int n = 0; n < 5; n++) {
    float tt = tm * (1.0 - 3.5 / float(n + 1));
    float nx = px + cos(tt - ix) + sin(tt + iy);
    iy = py + sin(tt - iy) + cos(tt + ix);
    ix = nx;
    float s = max(abs(sin(ix + tt)), 1e-4), k = max(abs(cos(iy + tt)), 1e-4);
    c += 1.0 / length(vec2(1.25 / s, 1.25 / k));
  }
  c = 1.17 - pow(c / 5.0, 1.4);
  float v = min(1.0, pow(abs(c), 6.0) / 0.9);
  return pow(clamp((v - LIGHT_FLOOR) / (LIGHT_FULL - LIGHT_FLOOR), 0.0, 1.0), 1.4);
}
`;

  // Pass 1: one fragment per character cell → (wave brightness, glow, background opacity, glyph swap).
  const CELL_FRAG = COMMON + `
uniform sampler2D uData;    // per cell: glyph index/255 (1 = blank), random 0–1, row offset/CW
uniform sampler2D uParams;  // per ripple settings, one row each
uniform sampler2D uHeart;   // heart outline radius per angle (720 bins)
uniform int uCount;
uniform float uTime;        // ambient clock (frozen under reduced motion)
uniform float uSpeed;
uniform vec2 uView;         // CSS px
out vec4 outCell;

const float EDGE = 9.0, GAP = 0.1, THICK = 0.12, THICK_MIN = 14.0;
const float TROUGH = 0.85, INNER_SCALE = 0.62, INNER_ROUND = 0.4, INNER_GAIN = 0.6;
const float GLOW_REACH = 260.0, LIFE = ${LIFE.toFixed(3)}, WOBBLE = 0.035, VARIABILITY = ${VARIABILITY.toFixed(3)};

float P(int r, int i) {
  vec4 v = texelFetch(uParams, ivec2(i >> 2, r), 0);
  int k = i & 3;
  return k == 0 ? v.x : k == 1 ? v.y : k == 2 ? v.z : v.w;
}
float loopNoise(int r, int off, int n, float u) {
  float fn = float(n);
  u = mod(u, fn);
  int i = int(floor(u));
  float f = u - floor(u), s = f * f * (3.0 - 2.0 * f);
  int j = i + 1 >= n ? 0 : i + 1;
  float a = P(r, off + i);
  return a + (P(r, off + j) - a) * s;
}
float angDiff(float a, float b) { return atan(sin(a - b), cos(a - b)); }
float heartDist(vec2 d) {
  float a = atan(-d.y, d.x);
  int bin = int(floor((a + PI) / TAU * 720.0));
  bin = clamp(bin, 0, 719);
  return length(d) / texelFetch(uHeart, ivec2(bin, 0), 0).r;
}
vec2 warp(vec2 p, float t) {
  return vec2(
    14.0 * sin(p.y * 0.011 + t * 0.9) + 9.0 * sin((p.x + p.y) * 0.007 - t * 0.7) + 5.0 * sin(p.x * 0.021 - p.y * 0.013 + t * 1.4),
    14.0 * sin(p.x * 0.010 - t * 0.8) + 9.0 * sin((p.x - p.y) * 0.008 + t * 0.6) + 5.0 * sin(p.y * 0.019 + p.x * 0.012 - t * 1.2));
}
float thicknessAt(int r, float th, float age) {
  float u = (th + PI) / TAU;
  float n = 0.55 * loopNoise(r, 33, 6, u * 6.0 + P(r, 20) * age)
          + 0.4 * loopNoise(r, 39, 13, u * 13.0 + P(r, 21) * age)
          + 0.22 * loopNoise(r, 52, 29, u * 29.0 - P(r, 21) * age);
  int lumps = int(P(r, 22));
  for (int j = 0; j < 3; j++) {
    if (j >= lumps) break;
    float q = angDiff(th, P(r, 24 + j * 3)) / P(r, 25 + j * 3);
    n += P(r, 26 + j * 3) * exp(-q * q);
  }
  float a = angDiff(th, -PI * 0.5) / 0.4, b = angDiff(th, PI * 0.5) / 0.5;
  float raw = exp(VARIABILITY * n) * (1.0 - 0.35 * exp(-a * a) - 0.3 * exp(-b * b));
  return clamp(raw / P(r, 3), 0.12, 3.0);
}

void main() {
  ivec2 cell = ivec2(gl_FragCoord.xy);
  vec4 dat = texelFetch(uData, cell, 0);
  if (dat.r > 0.5) { outCell = vec4(0.0); return; }        // blank cell
  float ph = dat.g;
  float x = float(cell.x - 1) * CW + dat.b * CW, y = float(cell.y) * CH;
  vec2 p = vec2(x + CW * 0.5, y + CH * 0.5);

  float e = 0.0, dark = 0.0, glow = 0.0;
  float tw = max(0.0, sin(uTime * (1.2 + ph * 2.3) + ph * 40.0));
  float twinkle = tw * tw * tw; twinkle *= twinkle;          // ^6
  vec2 wv = warp(p, uTime);
  for (int r = 0; r < ${MAX_RIPPLES}; r++) {
    if (r >= uCount) break;
    vec2 c0 = vec2(P(r, 0), P(r, 1));
    float age = P(r, 2);
    float rr = uSpeed * age;
    if (length(p - c0) > rr * 1.45 + 80.0) continue;
    vec2 d = p + wv * min(1.0, age / 0.4) - c0;
    float th = atan(d.y, d.x);
    float rad = uSpeed * age * (1.0 - 0.12 * age / LIFE);
    float lobe = 0.0;
    lobe += P(r, 8) * sin(2.0 * th + P(r, 9) + P(r, 10) * age);
    lobe += P(r, 11) * sin(3.0 * th + P(r, 12) + P(r, 13) * age);
    lobe += P(r, 14) * sin(5.0 * th + P(r, 15) + P(r, 16) * age);
    lobe += P(r, 17) * sin(7.0 * th + P(r, 18) + P(r, 19) * age);
    float dh = heartDist(d) - lobe * rad * WOBBLE;

    float base = THICK * rad + THICK_MIN, tk = thicknessAt(r, th, age);
    float w = min(base * tk, rad * 0.4 + 10.0);
    float s = rad + (min(tk, 2.0) - 1.0) * base * 0.25 - dh;
    float life = age / LIFE, fade = 1.0 - life * life;
    float outer = s < 0.0 ? exp(s / EDGE) : 1.0;
    float inner = s > w ? exp(-(s - w) / (w * 0.15)) : 1.0;
    float across = 1.0 - 0.25 * min(1.0, max(0.0, s) / w);
    e += outer * inner * across * fade * 1.1;
    if (s > w) dark = max(dark, TROUGH * min(1.0, (s - w) / (w * 0.6)) * (1.0 - life));

    float gapPx = GAP * rad + 12.0, g0 = w + gapPx;
    if (s > g0 && s < g0 + GLOW_REACH) {
      float k = (s - g0) / GLOW_REACH;
      glow += min(1.0, k * 6.0) * (1.0 - k) * fade * twinkle;
    }
    float di = dh * (1.0 - INNER_ROUND) + length(d) * INNER_ROUND;
    float si = min(rad * INNER_SCALE, rad - w - gapPx) - di, wi = base * 0.9;
    if (si > -EDGE * 4.0 && si < wi * 2.0) {
      float n = 0.5 + 0.3 * sin(2.0 * th + P(r, 4) + P(r, 6) * age) + 0.2 * sin(5.0 * th + P(r, 5) - age * 0.8);
      float solid = clamp((n - 0.35) / 0.3, 0.0, 1.0);
      float oI = si < 0.0 ? exp(si / EDGE) : 1.0;
      float iI = si > wi ? exp(-(si - wi) / (wi * 0.15)) : 1.0;
      e += oI * iI * solid * solid * (3.0 - 2.0 * solid) * fade * INNER_GAIN;
    }
  }
  e = min(1.0, e) * (0.55 + 0.45 * ph);                       // per-glyph brightness variation
  vec2 cv = vec2(uView.x * 0.5, uView.y * 0.45);
  float vig = 1.0 - min(1.0, length(vec2(x, y) - cv) / length(cv));
  float shade = vig * (1.0 - min(1.0, dark));
  // Shimmer: in the light, a character swaps to another one now and then.
  float light = riverLight(p, uTime), swap = 0.0;
  if (light > 0.3) {
    float tick = floor(uTime * (0.6 + 2.5 * light) + ph * 17.0);
    swap = floor(fract(sin(tick * 12.9898 + ph * 4375.85) * 43758.5453) * ${CHARS.length - 1}.0) + 1.0;
  }
  outCell = vec4(e, min(1.0, glow), shade, swap / 255.0);
}`;

  // Pass 2: one fragment per screen pixel: glyph shape from the atlas, colours from pass 1.
  const DRAW_FRAG = COMMON + `
uniform sampler2D uData, uCell, uAtlas;
uniform ivec2 uGrid;        // cols, rows
uniform vec2 uView;         // CSS px
uniform float uDpr;
uniform vec2 uAtlasCell;    // device px per glyph slot
uniform float uAtlasW;
uniform float uTime;
uniform vec3 uBg, uRest, uDeep, uBody, uHi, uGlint;
uniform float uRestAlpha, uLightGain, uWaterGlow, uHaloMix;
uniform float uClearX, uClearSoft;  // leave(): CSS px
out vec4 outColor;
const float HALO_SIGMA = 4.5;
float glintAt(float l, float ph, float t) {
  float gs = max(0.0, sin(t * (2.5 + ph * 4.0) + ph * 63.0));
  return smoothstep(0.55, 0.95, l) * pow(gs, 24.0);
}
float rowOffset(int r) { return texelFetch(uData, ivec2(0, r), 0).b * CW; }
// leave(): transparent right of uClearX, back to full over uClearSoft px (premultiplied).
vec4 cleared(vec3 c, float x) {
  float cover = smoothstep(0.0, 1.0, (uClearX - x) / uClearSoft);
  return vec4(c * cover, cover);
}

void main() {
  vec2 dev = vec2(gl_FragCoord.x, uView.y * uDpr - gl_FragCoord.y);
  vec2 css = dev / uDpr;
  int r = int(floor(css.y / CH));
  vec3 col = uBg;
  float light = riverLight(css, uTime);
  vec2 vc = vec2(uView.x * 0.5, uView.y * 0.45);
  float vigP = 1.0 - min(1.0, length(css - vc) / length(vc));
  col = mix(col, uRest, light * uWaterGlow * vigP);
  if (r < 0 || r >= uGrid.y) { outColor = cleared(col, css.x); return; }

  float halo = 0.0, glintHalo = 0.0;
  for (int dr = -1; dr <= 1; dr++) {
    int rn = r + dr;
    if (rn < 0 || rn >= uGrid.y) continue;
    float off = rowOffset(rn);
    int c0 = int(floor((css.x - off) / CW)) + 1;
    for (int dc = -1; dc <= 1; dc++) {
      int cn = c0 + dc;
      if (cn < 0 || cn >= uGrid.x) continue;
      vec4 nb = texelFetch(uCell, ivec2(cn, rn), 0);
      vec4 nd = texelFetch(uData, ivec2(cn, rn), 0);
      float gn = nd.r < 0.5 ? glintAt(light, nd.g, uTime) * nb.b : 0.0;
      if (nb.g < 0.03 && gn < 0.01) continue;
      vec2 ctr = vec2(float(cn - 1) * CW + off + CW * 0.5, float(rn) * CH + CH * 0.5);
      vec2 q = css - ctr;
      float fall = exp(-dot(q, q) / (2.0 * HALO_SIGMA * HALO_SIGMA));
      halo += nb.g * 0.8 * fall;
      glintHalo += gn * fall;
    }
  }
  col = mix(col, mix(uBody, uHi, 0.5), min(1.0, halo * uHaloMix));
  col = mix(col, uGlint, min(1.0, glintHalo * 0.35));

  float off = rowOffset(r);
  int c = int(floor((css.x - off) / CW)) + 1;
  if (c >= 0 && c < uGrid.x) {
    vec4 dat = texelFetch(uData, ivec2(c, r), 0);
    if (dat.r < 0.5) {
      vec2 local = vec2(dev.x - ((float(c - 1) * CW + off) * uDpr - 1.0), dev.y - (float(r) * CH * uDpr - 1.0));
      float mask = 0.0;
      if (local.x >= 0.0 && local.x < uAtlasCell.x && local.y >= 0.0 && local.y < uAtlasCell.y) {
        float swap = floor(texelFetch(uCell, ivec2(c, r), 0).a * 255.0 + 0.5);
        float gi = mod(floor(dat.r * 255.0 + 0.5) + swap, ${CHARS.length}.0);
        mask = texture(uAtlas, vec2((gi * uAtlasCell.x + local.x) / uAtlasW, local.y / uAtlasCell.y)).a;
      }
      vec4 cv = texelFetch(uCell, ivec2(c, r), 0);
      float e = cv.r, glow = cv.g, rest = (uRestAlpha + uLightGain * light) * cv.b;
      float lit = max(e, glow);
      col = mix(col, uRest, rest * (1.0 - lit) * mask);
      if (e > 0.02) {
        float a = min(1.0, e);
        col = mix(col, uDeep, a * mask);
        float m = clamp((e - 0.25) / 0.55, 0.0, 1.0);
        col = mix(col, uBody, a * m * mask);
        if (e > 0.85) col = mix(col, uHi, min(1.0, (e - 0.85) / 0.25) * 0.7 * mask);
      }
      if (glow > 0.03) col = mix(col, uHi, min(1.0, glow * 0.8) * mask);
      float glint = glintAt(light, dat.g, uTime) * cv.b;
      if (glint > 0.01) col = mix(col, uGlint, min(1.0, glint) * mask);
    }
  }
  outColor = cleared(col, css.x);
}`;

  // Classic ♥ (x² + y² − 1)³ = x²y³, as a polar lookup (radius per angle). Shared by every mount.
  const BINS = 720, heartR = new Float32Array(BINS);
  for (let i = 0; i < BINS; i++) {
    const a = (i / BINS) * Math.PI * 2 - Math.PI;
    let lo = 0, hi = 2;
    for (let k = 0; k < 30; k++) {
      const m = (lo + hi) / 2, x = m * Math.cos(a), y = m * Math.sin(a) + 0.12;
      const q = x * x + y * y - 1;
      (q * q * q - x * x * y * y * y > 0) ? hi = m : lo = m;
    }
    heartR[i] = lo;
  }

  // Each row is a stream of real source lines, read left to right; spaces become blank cells (-1).
  const CODE = `
export async function fetchUser(id, { signal } = {}) {
  const res = await fetch(\`/api/users/\${id}\`, { signal });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}
const debounce = (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
for (let i = 0; i < nodes.length; i++) { if (nodes[i].dirty) queue.push(nodes[i]); }
const total = items.reduce((sum, { price, qty }) => sum + price * qty, 0);
export default function App() { const [count, setCount] = useState(0); return <Counter value={count} />; }
def fibonacci(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
with open("data.csv", newline="") as f: rows = [r for r in csv.reader(f) if r]
class Cache(dict):
    def __missing__(self, key): return self.setdefault(key, compute(key))
fn main() -> Result<(), Box<dyn Error>> {
    let input = std::fs::read_to_string("input.txt")?;
    let sum: u64 = input.lines().filter_map(|l| l.parse().ok()).sum();
    println!("{sum}");
    Ok(())
}
func handler(w http.ResponseWriter, r *http.Request) {
    if err := json.NewEncoder(w).Encode(resp); err != nil { http.Error(w, err.Error(), 500) }
}
SELECT u.id, u.name, COUNT(o.id) AS orders FROM users u LEFT JOIN orders o ON o.user_id = u.id GROUP BY u.id;
git commit -m "feat: checkout in test mode" && git push origin main
interface State { status: "idle" | "loading" | "error"; data?: Record<string, number>; }
type Handler<T> = (event: T, ctx: Context) => Promise<void>;
const dir = locale.startsWith("ar") ? "rtl" : "ltr"; document.documentElement.dir = dir;
const price = new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
`.trim().split('\n');

  function codeStream() {
    let line = (Math.random() * CODE.length) | 0;
    let pos = (Math.random() * CODE[line].length) | 0;
    return () => {
      const text = CODE[line];
      if (pos < text.length) return CHARS.indexOf(text[pos++]);
      if (pos < text.length + 4) { pos++; return -1; }
      line = (line + 1) % CODE.length; pos = 0;
      return -1;
    };
  }

  const loop = (n, rand) => Array.from({ length: n }, () => rand() * 2 - 1);
  // mulberry32: a heart's shape comes from where it starts, so a page that carries on another
  // page's heart (the front door's, on arrival) draws the very same one.
  function seeded(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function loopNoiseCPU(vals, u) {
    const n = vals.length;
    u = ((u % n) + n) % n;
    const i = Math.floor(u), f = u - i, s = f * f * (3 - 2 * f);
    return vals[i] + (vals[(i + 1) % n] - vals[i]) * s;
  }
  const angDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  // CPU copy of the raw thickness profile, only to keep each heart's average at 1.
  function thicknessRaw(rp, th) {
    const u = (th + Math.PI) / (2 * Math.PI);
    let n = 0.55 * loopNoiseCPU(rp.coarse, u * 6 + rp.drift[0] * rp.t)
          + 0.4 * loopNoiseCPU(rp.mid, u * 13 + rp.drift[1] * rp.t)
          + 0.22 * loopNoiseCPU(rp.fine, u * 29 - rp.drift[1] * rp.t);
    for (const l of rp.lumps) n += l.height * Math.exp(-((angDiff(th, l.at) / l.span) ** 2));
    const notch = Math.exp(-((angDiff(th, -Math.PI / 2) / 0.4) ** 2));
    const point = Math.exp(-((angDiff(th, Math.PI / 2) / 0.5) ** 2));
    return Math.exp(VARIABILITY * n) * (1 - 0.35 * notch - 0.3 * point);
  }
  function thicknessNorm(rp) {
    let sum = 0;
    for (let i = 0; i < 48; i++) sum += thicknessRaw(rp, -Math.PI + (i + 0.5) * Math.PI / 24);
    return sum / 48;
  }
  function makeRipple(x, y) {
    const R = seeded(Math.imul(Math.round(x), 73856093) ^ Math.imul(Math.round(y), 19349663));
    return {
      x, y, t: 0,
      lobes: [2, 3, 5, 7].map(k => [(0.4 + R() * 0.6) / Math.sqrt(k), R() * Math.PI * 2, (R() - 0.5) * 1.6]),
      patches: [R() * 6.3, R() * 6.3, (R() - 0.5) * 1.4],
      coarse: loop(6, R), mid: loop(13, R), fine: loop(29, R),
      drift: [(R() - 0.5) * 1.0, (R() - 0.5) * 1.8],
      // The first lump pinches the band almost to nothing; the rest swell it.
      lumps: Array.from({ length: 2 + ((R() * 2) | 0) }, (_, i) => ({
        at: R() * Math.PI * 2 - Math.PI,
        span: 0.12 + R() * 0.3,
        height: i === 0 ? -(0.5 + R() * 0.6) : 0.5 + R() * 0.7,
      })),
    };
  }

  function mount(canvas, options) {
    let o = Object.assign({}, DEFAULTS, options);
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: !!o.clearable, premultipliedAlpha: !!o.clearable });
    if (!gl) return { set() {}, heart() {}, leave() {}, destroy() {} };
    const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    function program(frag) {
      const p = gl.createProgram();
      gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, frag));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name; u[name] = gl.getUniformLocation(p, name); }
      return { p, u };
    }
    function texture(w, h, internal, format, type, filter, data = null) {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }

    const cellProg = program(CELL_FRAG);
    const drawProg = program(DRAW_FRAG);
    gl.bindVertexArray(gl.createVertexArray());
    const heartTex = texture(BINS, 1, gl.R32F, gl.RED, gl.FLOAT, gl.NEAREST, heartR);
    const params = new Float32Array(PARAMS_W * 4 * MAX_RIPPLES);
    const paramTex = texture(PARAMS_W, MAX_RIPPLES, gl.RGBA32F, gl.RGBA, gl.FLOAT, gl.NEAREST, params);
    const ripples = [];
    let colors;
    const setColors = () => { colors = ['bg', 'rest', 'deep', 'body', 'hi', 'glint'].map(k => hex(o[k])); };
    setColors();

    function packRipples() {
      ripples.forEach((rp, i) => {
        const b = i * PARAMS_W * 4, P = params;
        P[b] = rp.x; P[b + 1] = rp.y; P[b + 2] = rp.t; P[b + 3] = rp.norm;
        P[b + 4] = rp.patches[0]; P[b + 5] = rp.patches[1]; P[b + 6] = rp.patches[2];
        rp.lobes.forEach((l, j) => { P[b + 8 + j * 3] = l[0]; P[b + 9 + j * 3] = l[1]; P[b + 10 + j * 3] = l[2]; });
        P[b + 20] = rp.drift[0]; P[b + 21] = rp.drift[1]; P[b + 22] = rp.lumps.length;
        rp.lumps.forEach((l, j) => { P[b + 24 + j * 3] = l.at; P[b + 25 + j * 3] = l.span; P[b + 26 + j * 3] = l.height; });
        P.set(rp.coarse, b + 33); P.set(rp.mid, b + 39); P.set(rp.fine, b + 52);
      });
      gl.bindTexture(gl.TEXTURE_2D, paramTex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, PARAMS_W, MAX_RIPPLES, gl.RGBA, gl.FLOAT, params);
    }

    let lastHeart = performance.now();
    // `age` (s) starts the heart partway through its life.
    function heart(x, y, age = 0) {
      const rp = makeRipple(x, y);
      rp.norm = thicknessNorm(rp);
      rp.t = age;
      ripples.push(rp);
      if (ripples.length > MAX_RIPPLES) ripples.shift();
      lastHeart = performance.now();
    }

    // Canvas may be scaled by a parent transform (zoomed design canvas), so map
    // client px back to the canvas's own layout px.
    const target = o.target || canvas.parentElement;
    function onDown(e) {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      const k = canvas.clientWidth / rect.width;
      heart((e.clientX - rect.left) * k, (e.clientY - rect.top) * k);
    }
    target.addEventListener('pointerdown', onDown);

    let W = 0, H = 0, dpr, cols, rows, lines, cellData, dataTex, cellTex, cellFbo, atlasTex, AW, AH;
    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h || (w === W && h === H)) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = w; H = h;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      cols = Math.ceil(W / CW) + 2; rows = Math.ceil(H / CH);
      lines = Array.from({ length: rows }, () => {
        const next = codeStream(), cells = [];
        for (let i = 0; i < cols; i++) cells.push(next());
        return { cells, phase: Array.from({ length: cols }, Math.random), next, px: 0, speed: 6 + Math.random() * 10 };
      });
      // Glyph atlas: white glyphs, one slot each; the shader tints them.
      AW = Math.ceil(CW * dpr) + 2; AH = Math.ceil(CH * dpr);
      const ac = document.createElement('canvas');
      ac.width = AW * CHARS.length; ac.height = AH;
      const a = ac.getContext('2d');
      a.font = `${FONT * dpr}px ui-monospace, "Cascadia Mono", Consolas, monospace`;
      a.textBaseline = 'top';
      a.fillStyle = '#fff';
      for (let i = 0; i < CHARS.length; i++) a.fillText(CHARS[i], i * AW + 1, 1.5 * dpr);
      for (const t of [dataTex, cellTex, atlasTex]) if (t) gl.deleteTexture(t);
      if (cellFbo) gl.deleteFramebuffer(cellFbo);
      atlasTex = texture(ac.width, ac.height, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, ac);
      cellData = new Uint8Array(cols * rows * 4);
      dataTex = texture(cols, rows, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, gl.NEAREST);
      cellTex = texture(cols, rows, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, gl.NEAREST);
      cellFbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, cellFbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, cellTex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // Only animate while the canvas is on screen.
    let visible = true;
    const io = new IntersectionObserver(es => { visible = es[es.length - 1].isIntersecting; });
    io.observe(canvas);

    function bindTex(unit, tex, loc) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(loc, unit); }

    // leave(): from `at`, the field turns transparent from right to left over `ms`.
    let leaving = null;
    function leave(delay, ms) {
      leaving = { at: performance.now() + delay, ms, x: null };
      // Each line drains a little faster than the edge, some more than others, so the code
      // streams off rather than sliding away as one block.
      if (lines) for (const L of lines) L.drain = 1 + Math.random() * 0.6;
    }

    const t0 = performance.now();
    let last = t0, raf = 0, firstTimer = 0, drewOnce = false;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!W || !visible) return;
      // Under reduced motion the field stands still; clicked hearts still play.
      if (reduced && drewOnce && !ripples.length) return;
      const t = reduced ? 0 : (now - t0) / 1000;
      for (const rp of ripples) rp.t += dt;
      while (ripples.length && ripples[0].t > LIFE) ripples.shift();
      if (!reduced && o.idleEvery && now - lastHeart > o.idleEvery) heart(W * (0.2 + Math.random() * 0.6), H * (0.25 + Math.random() * 0.5));

      // Leaving: no new code comes in from the right, the clearing edge sweeps right to left,
      // and every line is pushed left at least as far as the edge moved, so what code remains
      // drains off ahead of it.
      let clearX = 1e6, push = 0;
      const draining = leaving !== null && now >= leaving.at;
      if (draining) {
        const p = Math.min(1, (now - leaving.at) / leaving.ms);
        const e = p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
        clearX = W * (1 + CLEAR_SOFT) * (1 - e);
        push = leaving.x === null ? 0 : leaving.x - clearX;
        leaving.x = clearX;
      }

      for (let r = 0; r < rows; r++) {
        const L = lines[r];
        if (!reduced) L.px -= L.speed * dt;
        if (push) L.px -= push * (L.drain || 1.3);
        while (L.px < 0) {
          L.px += CW;
          L.cells.shift(); L.cells.push(draining ? -1 : L.next());
          L.phase.shift(); L.phase.push(Math.random());
        }
        const off = Math.round(L.px / CW * 255);
        for (let c = 0, b = r * cols * 4; c < cols; c++, b += 4) {
          const g = L.cells[c];
          cellData[b] = g < 0 ? 255 : g;
          cellData[b + 1] = L.phase[c] * 255;
          cellData[b + 2] = off;
        }
      }
      gl.bindTexture(gl.TEXTURE_2D, dataTex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, cols, rows, gl.RGBA, gl.UNSIGNED_BYTE, cellData);
      packRipples();

      gl.bindFramebuffer(gl.FRAMEBUFFER, cellFbo);
      gl.viewport(0, 0, cols, rows);
      gl.useProgram(cellProg.p);
      bindTex(0, dataTex, cellProg.u.uData);
      bindTex(1, paramTex, cellProg.u.uParams);
      bindTex(2, heartTex, cellProg.u.uHeart);
      gl.uniform1i(cellProg.u.uCount, ripples.length);
      gl.uniform1f(cellProg.u.uTime, t);
      gl.uniform1f(cellProg.u.uSpeed, o.speed);
      gl.uniform2f(cellProg.u.uView, W, H);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(drawProg.p);
      const u = drawProg.u;
      bindTex(0, dataTex, u.uData);
      bindTex(1, cellTex, u.uCell);
      bindTex(2, atlasTex, u.uAtlas);
      gl.uniform2i(u.uGrid, cols, rows);
      gl.uniform2f(u.uView, W, H);
      gl.uniform1f(u.uDpr, dpr);
      gl.uniform1f(u.uTime, t);
      gl.uniform2f(u.uAtlasCell, AW, AH);
      gl.uniform1f(u.uAtlasW, AW * CHARS.length);
      ['uBg', 'uRest', 'uDeep', 'uBody', 'uHi', 'uGlint'].forEach((k, i) => gl.uniform3fv(u[k], colors[i]));
      gl.uniform1f(u.uRestAlpha, o.restAlpha);
      gl.uniform1f(u.uLightGain, o.lightGain);
      gl.uniform1f(u.uWaterGlow, o.waterGlow);
      gl.uniform1f(u.uHaloMix, o.haloMix);
      gl.uniform1f(u.uClearX, clearX);
      gl.uniform1f(u.uClearSoft, W * CLEAR_SOFT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      drewOnce = true;
    }
    raf = requestAnimationFrame(frame);
    if (o.autoFirst && !reduced) firstTimer = setTimeout(() => W && heart(W * 0.5, H * 0.45), o.autoFirst);

    return {
      set(next) { o = Object.assign(o, next); setColors(); drewOnce = false; },
      heart,
      leave,
      destroy() {
        cancelAnimationFrame(raf); clearTimeout(firstTimer);
        target.removeEventListener('pointerdown', onDown);
        ro.disconnect(); io.disconnect();
        const lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
      },
    };
  }

export { mount };

