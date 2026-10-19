// Next 16's static export writes segment prefetch payloads as nested folders
// (out/work/x/__next.work/$d$slug.txt) but the client router requests them by a
// flat, dotted name (out/work/x/__next.work.$d$slug.txt). Static hosts can't
// rewrite between the two, so every client navigation 404s and falls back to a
// full page load. This copies each nested payload to its flat name.
import { cpSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const OUT = 'out';
let copied = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (name.startsWith('__next.')) flatten(dir, p);
    else walk(p);
  }
}

function flatten(parent, segDir) {
  const prefix = segDir.slice(parent.length + 1); // e.g. "__next.work"
  const files = (d) =>
    readdirSync(d).flatMap((n) => {
      const p = join(d, n);
      return statSync(p).isDirectory() ? files(p) : [p];
    });
  for (const f of files(segDir)) {
    const flat = `${prefix}.${relative(segDir, f).split(sep).join('.')}`;
    cpSync(f, join(parent, flat));
    copied++;
  }
}

walk(OUT);
console.log(`flatten-rsc: ${copied} prefetch payloads given flat names`);
