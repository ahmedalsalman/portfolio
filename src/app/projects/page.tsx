export default function ProjectsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-2 text-foreground/70">Flagship builds and micro‑demos.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <a href="/projects/saas-starter" className="rounded-lg border border-foreground/10 p-5 hover:bg-foreground/5">
          <h2 className="font-medium">SaaS Starter</h2>
          <p className="text-sm text-foreground/70">Multi‑tenant foundation with auth, GraphQL, and billing.</p>
        </a>
        <a href="/projects/ecommerce-starter" className="rounded-lg border border-foreground/10 p-5 hover:bg-foreground/5">
          <h2 className="font-medium">E‑commerce Starter</h2>
          <p className="text-sm text-foreground/70">Catalog, cart, checkout flow, GraphQL API integration.</p>
        </a>
      </div>
    </main>
  );
}

