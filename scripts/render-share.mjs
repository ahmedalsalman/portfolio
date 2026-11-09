// Renders the share-preview images (Open Graph, 1200x630) with a local Chrome, so the heart
// ripple's WebGL and the Arabic shaping come out exactly as on the site.
//
//   node scripts/render-share.mjs          (after `npm run sync`; output is committed)
//
// - public/og/home.jpg         the name card on its code field, with three real phone screens
// - public/og/work/<slug>.jpg  one per project page: title, line and its opening screen
//
// Needs Playwright (from D:/Work/portfolio-shots/_tools, or set PLAYWRIGHT to its folder) and
// Chrome; fonts come from Google Fonts, so it needs a connection. Nothing here runs at build time.
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT ?? 'D:/Work/portfolio-shots/_tools/node_modules/playwright');

const json = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const curation = json('src/data/curation.json');
const voice = json('src/data/voice.json');
const works = json('src/data/works.generated.json')
  .filter((w) => !curation.hidden.includes(w.slug))
  .map((w) => ({ ...w, ...voice[w.slug] }));

// The name card's field (src/components/NameCard.tsx).
const RIPPLE = { bg: '#41093a', rest: '#ddd0d3', deep: '#a8782a', body: '#f4b63f', hi: '#fde7b8', glint: '#ffffff', restAlpha: 0.07, lightGain: 0.22, waterGlow: 0.04, haloMix: 0.5 };

const FONTS =
  '<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,600;1,6..96,400&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&family=Reem+Kufi:wght@600;700&display=block" rel="stylesheet">';

const BASE_CSS = `
  :root { --plum:#41093a; --gold:#f4b63f; --warm:#fbf6f0; --wall2:#f4ebe1; --night:#1a1119; --muted:#5e525c; --rule:#e5dbd2;
    --on-plum: color-mix(in srgb, #fbf6f0 84%, #41093a);
    --display:'Bodoni Moda',serif; --sans:'IBM Plex Sans',sans-serif; --mono:'IBM Plex Mono',monospace; --kufi:'Reem Kufi',sans-serif; }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  .plinth { background: #fff; padding: 9px; box-shadow: 0 2px 0 rgb(26 17 25 / .05), 0 26px 50px -20px rgb(26 17 25 / .45); }
  .plinth img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top; }
  .phone { border-radius: 30px; } .phone img { border-radius: 22px; }
`;

const esc = (s = '') => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const firstMobile = (slug) => works.find((w) => w.slug === slug)?.shots.find((s) => s.kind === 'mobile')?.src;

function homeHtml() {
  const phones = ['yalla-kora', 'kickoff-booking', 'snap-games'].map(firstMobile);
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}
    .card { position: relative; width: 1200px; height: 630px; background: var(--plum); color: #fff; overflow: hidden; }
    canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
    .text { position: absolute; left: 72px; top: 0; bottom: 0; width: 600px; display: flex; flex-direction: column; justify-content: center;
      text-shadow: 0 0 22px var(--plum), 0 0 8px var(--plum), 0 0 2px var(--plum); }
    .eyebrow { margin: 0 0 22px; font: 500 17px/1 var(--mono); letter-spacing: .22em; text-transform: uppercase; color: var(--gold); }
    .en { margin: 0; font: italic 400 100px/.92 var(--display); letter-spacing: -.02em; }
    .en em { display: block; font-style: normal; font-weight: 600; }
    .ar { margin: 26px 0 0; font: 700 50px/1.1 var(--kufi); color: var(--gold); }
    .url { position: absolute; left: 72px; bottom: 44px; margin: 0; font: 500 20px/1 var(--mono); letter-spacing: .06em; color: var(--on-plum);
      background: var(--plum); padding: 6px 0; }
    .phones { position: absolute; right: 64px; top: 0; bottom: 0; width: 470px; }
    .phones .plinth { position: absolute; width: 206px; height: 446px; padding: 8px; }
    .p0 { left: 0; top: 112px; transform: rotate(-6deg); }
    .p2 { right: 0; top: 112px; transform: rotate(6deg); }
    .p1 { left: 132px; top: 70px; width: 216px !important; height: 468px !important; z-index: 2; }
  </style></head><body>
    <div class="card">
      <canvas id="field"></canvas>
      <div class="text">
        <p class="eyebrow">Frontend developer · Amman</p>
        <h1 class="en">Ahmed<em>Al-Salman</em></h1>
        <p class="ar" lang="ar" dir="rtl">أحمد السلمان</p>
      </div>
      <p class="url">ahmedalsalman.dev</p>
      <div class="phones">
        ${phones.map((src, i) => `<div class="plinth phone p${i}"><img src="${src}" alt=""></div>`).join('')}
      </div>
    </div>
    <script type="module">
      import { mount } from '/__share/heart-ripple.js';
      const c = document.getElementById('field');
      // The calm field only: a heart lights the code behind the name and costs legibility at thumbnail size.
      mount(c, ${JSON.stringify(RIPPLE)});
    </script>
  </body></html>`;
}

const LANG = { ar: 'Arabic', en: 'English', fr: 'French', ku: 'Kurdish', ckb: 'Kurdish', tr: 'Turkish' };
function languages(w) {
  const names = [...new Set((w.locales ?? []).map((l) => LANG[l] ?? l))];
  if (!names.length || (names.length === 1 && names[0] === 'English')) return '';
  return names.join(', ') + (w.rtl ? ' · RTL' : '');
}

/** The screen a project page opens with (same rule as src/app/work/[slug]/page.tsx). */
function lead(w) {
  const mobile = w.shots.filter((s) => s.kind === 'mobile');
  const desktop = w.shots.filter((s) => s.kind === 'desktop');
  const phoneLed = mobile.length >= 2 && mobile.length >= desktop.length;
  if (phoneLed) return { phones: mobile.slice(0, 2).map((s) => s.src) };
  const pinned = curation.lead?.[w.slug];
  const isFull = (s) => s.width && s.height && s.height / s.width > 0.8;
  const d = (pinned && desktop.find((s) => s.src.split('/').pop().startsWith(pinned))) ?? desktop.find((s) => !isFull(s)) ?? desktop[0];
  return d ? { desktop: d.src } : { phones: mobile.slice(0, 2).map((s) => s.src) };
}

function workHtml(w) {
  const l = lead(w);
  const art = l.desktop
    ? `<div class="plinth desk"><img src="${l.desktop}" alt=""></div>`
    : `<div class="pair">${l.phones.map((src, i) => `<div class="plinth phone q${i}"><img src="${src}" alt=""></div>`).join('')}</div>`;
  const meta = [w.years, languages(w)].filter(Boolean).join(' · ');
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}
    .card { position: relative; width: 1200px; height: 630px; background: var(--warm); color: var(--night); overflow: hidden; }
    .text { position: absolute; left: 64px; top: 0; bottom: 92px; width: 480px; display: flex; flex-direction: column; justify-content: center; }
    .meta { margin: 0 0 18px; font: 500 15px/1.3 var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
    h1 { margin: 0; font: italic 400 62px/1 var(--display); letter-spacing: -.015em; text-wrap: balance;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .native { margin: 12px 0 0; font: 700 34px/1.2 var(--kufi); color: var(--plum); text-align: left; } /* under the title, not at the column's far edge */
    .line { margin: 20px 0 0; font: 400 23px/1.45 var(--sans); color: var(--muted);
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .art { position: absolute; left: 590px; right: 52px; top: 44px; bottom: 136px; display: flex; align-items: center; justify-content: center; }
    .desk { width: 100%; aspect-ratio: 16 / 10; } /* the desktop captures are 1800x1125; taller ones show their top */
    .pair { position: relative; width: 420px; height: 100%; }
    .pair .plinth { position: absolute; width: 190px; height: 411px; padding: 7px; top: 0; }
    .q0 { left: 18px; transform: rotate(-4deg); } .q1 { right: 18px; top: 16px !important; transform: rotate(4deg); }
    .band { position: absolute; left: 0; right: 0; bottom: 0; height: 92px; background: var(--plum); color: #fff;
      display: flex; align-items: center; justify-content: space-between; padding: 0 64px; }
    .band b { font: italic 400 30px/1 var(--display); }
    .band b em { font-style: normal; font-weight: 600; }
    .band span { font: 500 19px/1 var(--mono); letter-spacing: .06em; color: var(--gold); }
  </style></head><body>
    <div class="card">
      <div class="text">
        <p class="meta">${esc(meta)}</p>
        <h1>${esc(w.title)}</h1>
        ${w.titleNative ? `<p class="native" lang="ar" dir="rtl">${esc(w.titleNative)}</p>` : ''}
        <p class="line">${esc(w.tagline)}</p>
      </div>
      <div class="art">${art}</div>
      <div class="band"><b>Ahmed <em>Al-Salman</em></b><span>ahmedalsalman.dev</span></div>
    </div>
  </body></html>`;
}

const TYPES = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.js': 'text/javascript' };
const ORIGIN = 'http://share.local';
const pages = new Map();

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await ctx.route(`${ORIGIN}/**`, (route) => {
  const path = decodeURIComponent(new URL(route.request().url()).pathname);
  if (pages.has(path)) return route.fulfill({ contentType: 'text/html; charset=utf-8', body: pages.get(path) });
  const file = path === '/__share/heart-ripple.js' ? join(root, 'src/lib/heart-ripple.js') : join(root, 'public', path);
  if (!existsSync(file)) return route.fulfill({ status: 404, body: 'not found' });
  return route.fulfill({ contentType: TYPES[extname(file)] ?? 'application/octet-stream', body: readFileSync(file) });
});

async function render(path, html, out, settleMs) {
  pages.set(path, html);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(ORIGIN + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(settleMs);
  mkdirSync(dirname(out), { recursive: true });
  await page.screenshot({ path: out, type: 'jpeg', quality: 86 });
  await page.close();
  if (errors.length) throw new Error(`${out}: ${errors.join('; ')}`);
}

const only = process.argv[2]; // optional: render just "home" or one slug
if (!only || only === 'home') {
  await render('/__share/home', homeHtml(), join(root, 'public/og/home.jpg'), 3200);
  console.log('og/home.jpg');
}
for (const w of works) {
  if (only && only !== 'work' && only !== w.slug) continue;
  await render(`/__share/work/${w.slug}`, workHtml(w), join(root, `public/og/work/${w.slug}.jpg`), 300);
  console.log(`og/work/${w.slug}.jpg`);
}
await browser.close();
