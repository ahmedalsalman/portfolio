import generated from '@/data/works.generated.json';
import backendsGenerated from '@/data/backends.generated.json';
import curation from '@/data/curation.json';
import voice from '@/data/voice.json';

export type Shot = {
  src: string;
  label: string;
  kind: 'mobile' | 'desktop';
  width?: number;
  height?: number;
  /** Id of the ShotGroup this screen belongs to, when the work has groups. */
  group?: string;
};

/** A heading over a set of screens, e.g. one brand of a white-label product. */
export type ShotGroup = { id: string; title: string; note: string; accent?: string };

export type Work = {
  slug: string;
  title: string;
  titleNative: string | null;
  tagline: string;
  summary: string;
  role: string;
  org: string;
  years: string;
  category: string;
  platforms: string[];
  stack: string[];
  highlights: string[];
  locales: string[];
  rtl: boolean;
  accent: string;
  polished: boolean;
  polishScore: number;
  polishNote: string;
  demo: { port: number | null; path: string; run: string; dir: string | null } | null;
  repo: { remote: string | null; commits: number; authored: number } | null;
  confidential: boolean;
  shots: Shot[];
  groups?: ShotGroup[];
};

/** `feature`: how many of the room's works hang large; the rest show as compact cards. */
export type Room = { id: string; numeral: string; title: string; note: string; feature: number; works: Work[] };

export type Backend = {
  repo: string;
  what: string;
  stack: string[] | string;
  commits?: number;
  authoredByAhmed?: number;
  years?: string;
};

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const hidden = new Set(curation.hidden as string[]);
const forcedStore = new Set(curation.storeroom as string[]);
const promoted = new Set(curation.promote as string[]);
const demoUrls = curation.demoUrls as Record<string, string>;

type Voice = Partial<Pick<Work, 'role' | 'tagline' | 'summary' | 'highlights'>>;
const voiceBySlug = voice as unknown as Record<string, Voice>;

/** Synced facts, with the hand-written copy from voice.json laid over the top. */
export const allWorks: Work[] = (generated as Work[])
  .filter((w) => !hidden.has(w.slug))
  .map((w) => ({ ...w, ...voiceBySlug[w.slug] }));
const bySlug = new Map(allWorks.map((w) => [w.slug, w]));

const hangsInGallery = (w: Work) => !forcedStore.has(w.slug) && (w.polished || promoted.has(w.slug));

export const rooms: Room[] = curation.rooms
  .map((r) => ({
    id: r.id,
    title: r.title,
    note: r.note,
    feature: (r as { feature?: number }).feature ?? 1,
    works: r.works.map((s) => bySlug.get(s)).filter((w): w is Work => !!w && hangsInGallery(w)),
  }))
  .filter((r) => r.works.length > 0)
  .map((r, i) => ({ ...r, numeral: NUMERALS[i] }));

const placed = new Set(rooms.flatMap((r) => r.works.map((w) => w.slug)));

/** The screens in the hero strip: for each entry, that work's first shot of the given kind. */
export const heroStrip: { work: Work; shot: Shot }[] = (
  (curation as { heroStrip?: { slug: string; kind: Shot['kind'] }[] }).heroStrip ?? []
)
  .map(({ slug, kind }) => {
    const work = bySlug.get(slug);
    const shot = work?.shots.find((s) => s.kind === kind);
    return work && shot ? { work, shot } : null;
  })
  .filter((x): x is { work: Work; shot: Shot } => x !== null);

/** The reserve collection: unpolished, unplaced, or explicitly stored works. */
export const storeroom: Work[] = allWorks
  .filter((w) => !placed.has(w.slug))
  .sort((a, b) => b.polishScore - a.polishScore || a.title.localeCompare(b.title));

export const backends: Backend[] = Array.isArray(backendsGenerated)
  ? (backendsGenerated as Backend[])
  : ((backendsGenerated as { backends?: Backend[]; repos?: Backend[] }).backends ??
    (backendsGenerated as { repos?: Backend[] }).repos ??
    []);

export function getWork(slug: string) {
  return bySlug.get(slug);
}

/** Catalogue number, e.g. "II.3" — room numeral + position, or "R.4" in the storeroom. */
export function catalogueNumber(slug: string) {
  for (const r of rooms) {
    const i = r.works.findIndex((w) => w.slug === slug);
    if (i >= 0) return `${r.numeral}.${i + 1}`;
  }
  const j = storeroom.findIndex((w) => w.slug === slug);
  return j >= 0 ? `R.${j + 1}` : '';
}

/** A screen in a home-page layout: [x, y, width, height] crop as fractions of the screenshot. */
export type HangPiece = { shot: Shot; crop: [number, number, number, number]; narrow: boolean };
export type Hang = {
  layout: 'row' | 'lean' | 'bento' | 'polyptych';
  wide: boolean;
  side: 'start' | 'end';
  pieces: HangPiece[];
};
type HangConfig = {
  layout: Hang['layout'];
  wide?: boolean;
  side?: Hang['side'];
  pieces: { shot: string; crop?: number[]; narrow?: boolean }[];
};
const hangConfig = (curation as { hang?: Record<string, HangConfig> }).hang ?? {};
const MIN_PIECES: Record<Hang['layout'], number> = { row: 2, lean: 2, bento: 3, polyptych: 2 };

/** The hand-picked home-page layout for a work, or null to use the automatic one. */
export function hangFor(w: Work): Hang | null {
  const c = hangConfig[w.slug];
  if (!c) return null;
  const pieces = c.pieces.flatMap((p) => {
    const shot = w.shots.find((s) => s.src.split('/').pop()?.startsWith(p.shot));
    if (!shot) return [];
    const crop = (p.crop?.length === 4 ? p.crop : [0, 0, 1, 1]) as HangPiece['crop'];
    return [{ shot, crop, narrow: p.narrow !== false }];
  });
  if (pieces.length < MIN_PIECES[c.layout]) return null;
  return { layout: c.layout, wide: c.layout === 'bento' || !!c.wide, side: c.side ?? 'end', pieces };
}

export type LiveLink = { label: string; href: string };
const liveLinkMap = (curation as { liveLinks?: Record<string, LiveLink[]> }).liveLinks ?? {};

/** Links to the real, public product (client work), shown instead of a demo. */
export function liveLinks(w: Work): LiveLink[] {
  return liveLinkMap[w.slug] ?? [];
}

export function demoHref(w: Work): { href: string; local: boolean } | null {
  if (liveLinks(w).length) return null;
  if (demoUrls[w.slug]) return { href: demoUrls[w.slug], local: false };
  // A localhost link only works on this machine, so the public site never shows one.
  if (!w.demo?.port || process.env.NODE_ENV !== 'development') return null;
  return { href: `http://localhost:${w.demo.port}${w.demo.path ?? '/'}`, local: true };
}

/** Orders works the way they hang on the walls, storeroom last. */
export const hangingOrder: Work[] = [...rooms.flatMap((r) => r.works), ...storeroom];

export function neighbours(slug: string) {
  const i = hangingOrder.findIndex((w) => w.slug === slug);
  return {
    prev: i > 0 ? hangingOrder[i - 1] : null,
    next: i >= 0 && i < hangingOrder.length - 1 ? hangingOrder[i + 1] : null,
  };
}

export const totals = () => {
  const commits = allWorks.reduce((n, w) => n + (w.repo?.authored ?? 0), 0);
  const backendCommits = backends.reduce((n, b) => n + (b.authoredByAhmed ?? 0), 0);
  return { works: allWorks.length, authored: commits + backendCommits };
};
