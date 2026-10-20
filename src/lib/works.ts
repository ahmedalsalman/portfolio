import generated from '@/data/works.generated.json';
import backendsGenerated from '@/data/backends.generated.json';
import curation from '@/data/curation.json';
import voice from '@/data/voice.json';

export type Shot = { src: string; label: string; kind: 'mobile' | 'desktop'; width?: number; height?: number };

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
};

export type Room = { id: string; numeral: string; title: string; note: string; works: Work[] };

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
    works: r.works.map((s) => bySlug.get(s)).filter((w): w is Work => !!w && hangsInGallery(w)),
  }))
  .filter((r) => r.works.length > 0)
  .map((r, i) => ({ ...r, numeral: NUMERALS[i] }));

const placed = new Set(rooms.flatMap((r) => r.works.map((w) => w.slug)));

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

export function demoHref(w: Work): { href: string; local: boolean } | null {
  if (demoUrls[w.slug]) return { href: demoUrls[w.slug], local: false };
  if (!w.demo?.port) return null;
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
