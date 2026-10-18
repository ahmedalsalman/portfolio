export default function Home() {
  return (
    <div className="min-h-screen font-sans">
      <main className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
        <section className="space-y-6">
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">
            Full‑stack engineer shipping SaaS and e‑commerce with
            <span className="block"> TypeScript + Python</span>
          </h1>
          <p className="text-base sm:text-lg text-foreground/80 max-w-2xl">
            I build production‑grade apps with React/Next.js, Django, and GraphQL —
            using Material UI and Ant Design to deliver polished, performant UX.
            I care about DX, reliability, and business impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/projects"
              className="inline-flex items-center justify-center h-11 rounded-md px-5 bg-foreground text-background hover:opacity-90 transition"
            >
              View projects
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center h-11 rounded-md px-5 border border-foreground/15 hover:bg-foreground/5 transition"
            >
              Contact me
            </a>
          </div>
          <ul className="flex flex-wrap gap-2 pt-4 text-xs">
            {[
              "TypeScript",
              "React",
              "Next.js",
              "Python",
              "Django",
              "GraphQL",
              "Material UI",
              "Ant Design",
            ].map((t) => (
              <li
                key={t}
                className="rounded-full border border-foreground/15 px-3 py-1 text-foreground/80"
              >
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 grid gap-8 sm:grid-cols-2">
          <div className="rounded-lg border border-foreground/10 p-6">
            <h2 className="font-medium text-lg">Flagship projects</h2>
            <p className="text-sm text-foreground/70 mt-2">
              Real‑world SaaS and e‑commerce builds with live demos, repos, and short case studies.
            </p>
            <a href="/projects" className="text-sm mt-3 inline-block underline underline-offset-4">
              Explore projects →
            </a>
          </div>
          <div className="rounded-lg border border-foreground/10 p-6">
            <h2 className="font-medium text-lg">Writing</h2>
            <p className="text-sm text-foreground/70 mt-2">
              Engineering notes on architecture, GraphQL patterns, and UI performance.
            </p>
            <a href="/blog" className="text-sm mt-3 inline-block underline underline-offset-4">
              Read posts →
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
