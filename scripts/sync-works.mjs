// Pulls every project.json + screenshot out of D:/Work/portfolio-shots into the site.
//
//   npm run sync
//
// - screenshots → public/works/<slug>/<name>.webp (resized, so the repo stays light)
// - metadata    → src/data/works.generated.json
// - company backends credit list → src/data/backends.generated.json
//
// Curation (rooms, order, hiding, live demo URLs) lives in src/data/curation.json and is
// applied at render time, so re-running this script never clobbers editorial choices.
import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const SHOTS = process.env.SHOTS_DIR ?? 'D:/Work/portfolio-shots';
const OUT_IMG = 'public/works';
const OUT_DATA = 'src/data';

const works = [];
for (const dir of readdirSync(SHOTS)) {
  if (dir.startsWith('_')) continue;
  const metaPath = join(SHOTS, dir, 'project.json');
  if (!existsSync(metaPath)) continue;
  let meta;
  try {
    meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  } catch (e) {
    console.warn(`! ${dir}: bad project.json (${e.message})`);
    continue;
  }
  const slug = meta.slug ?? dir;
  const imgDir = join(OUT_IMG, slug);
  mkdirSync(imgDir, { recursive: true });

  const shots = [];
  for (const s of meta.screenshots ?? []) {
    const src = join(SHOTS, dir, s.file);
    if (!existsSync(src)) {
      console.warn(`! ${slug}: missing ${s.file}`);
      continue;
    }
    const name = `${parse(s.file).name}.webp`;
    const dest = join(imgDir, name);
    const kind = s.kind === 'mobile' ? 'mobile' : 'desktop';
    if (!existsSync(dest) || statSync(dest).mtimeMs < statSync(src).mtimeMs) {
      await sharp(src)
        .resize({ width: kind === 'mobile' ? 780 : 1800, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(dest);
    }
    const { width, height } = await sharp(dest).metadata();
    shots.push({ src: `/works/${slug}/${name}`, label: s.label ?? '', kind, width, height });
  }

  works.push({
    slug,
    title: meta.title ?? slug,
    titleNative: meta.titleNative ?? null,
    tagline: meta.tagline ?? '',
    summary: meta.summary ?? '',
    role: meta.role ?? '',
    org: meta.org ?? '',
    years: String(meta.years ?? ''),
    category: meta.category ?? 'product',
    platforms: meta.platforms ?? [],
    stack: meta.stack ?? [],
    highlights: meta.highlights ?? [],
    locales: meta.locales ?? [],
    rtl: Boolean(meta.rtl),
    accent: meta.accent ?? '#002FA7',
    polished: meta.polished !== false,
    polishScore: meta.polishScore ?? 3,
    polishNote: meta.polishNote ?? '',
    demo: meta.demo
      ? { port: meta.demo.port ?? null, path: meta.demo.path ?? '/', run: meta.demo.run ?? 'npm run dev', dir: meta.demo.dir ?? null }
      : null,
    repo: meta.repo
      ? { remote: meta.repo.remote ?? null, commits: meta.repo.commits ?? 0, authored: meta.repo.authoredByAhmed ?? 0 }
      : null,
    confidential: Boolean(meta.confidential),
    shots,
  });
  console.log(`✓ ${slug} (${shots.length} shots)`);
}

mkdirSync(OUT_DATA, { recursive: true });
writeFileSync(join(OUT_DATA, 'works.generated.json'), JSON.stringify(works, null, 2));

const backendsPath = join(SHOTS, '_backends.json');
const backends = existsSync(backendsPath) ? JSON.parse(readFileSync(backendsPath, 'utf8')) : [];
writeFileSync(join(OUT_DATA, 'backends.generated.json'), JSON.stringify(backends, null, 2));

const nb = Array.isArray(backends) ? backends.length : (backends.backends ?? backends.repos ?? []).length;
console.log(`\n${works.length} works, ${nb} backend credits`);
