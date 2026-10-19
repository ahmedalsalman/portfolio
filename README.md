# Ahmed Al-Salman — the exhibition

Portfolio hung as a gallery show. Each project is a *work* with a museum wall label
(Medium = stack, Dimensions = commits, Collection = who it was made for), grouped into
curated *rooms*. Less-polished work goes to **the Storeroom** at the bottom of the page.

Next.js 16, static export, no client framework beyond React. Fonts: Bodoni Moda, Reem Kufi,
IBM Plex Sans / Sans Arabic / Mono. One accent: International Klein Blue.

```bash
npm install
npm run sync    # pull project.json + screenshots from D:/Work/portfolio-shots
npm run dev     # http://localhost:4000
npm run build   # static site in out/
```

## Where things live

| What | File |
|---|---|
| Rooms, order, what's hidden or stored, live demo URLs | `src/data/curation.json` |
| Bio, chronology, skills, contact | `src/data/artist.ts` |
| Per-project copy, stack, highlights, polish score | `D:/Work/portfolio-shots/<slug>/project.json` (then `npm run sync`) |
| Synced data (don't edit by hand) | `src/data/*.generated.json`, `public/works/` |

## Curating

- **Remove a work from the site:** add its slug to `hidden`.
- **Move a work off the main walls:** add it to `storeroom`. Works marked
  `"polished": false` go there automatically; add the slug to `promote` to hang one anyway.
- **Reorder:** edit a room's `works` array.
- **Confidential works** (`"confidential": true` in project.json) show a red
  "confirm before publishing" stamp in `npm run dev` only. Decide before deploying:
  currently `hax-oi` and `lumio`, plus any ShopRaha/BTR work flagged by its builder.

## Demos

Every work has a runnable demo in a sibling `D:/Work/<repo>-demo` folder on its own
port (`:4100`–`:4289`). Until they're deployed, "Enter the work" links point at
`http://localhost:<port>`, so start the demo first. After deploying one, put its
URL in `curation.json → demoUrls` and rebuild.

## Deploy

`wrangler.jsonc` serves `out/` as static assets: `npm run build && npx wrangler deploy`.
Not deployed yet.
