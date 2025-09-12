import Link from 'next/link';

export default function Cta() {
  return (
    <section
      aria-labelledby="cta-title"
      className="rounded-2xl border border-[var(--border)] bg-white p-6 text-center shadow-sm"
    >
      <h2 id="cta-title" className="text-xl font-semibold tracking-tight text-[var(--ink)]">
        Ready to explore Southia?
      </h2>
      <p className="mx-auto mt-1 max-w-xl text-sm text-zinc-600">
        Jump into states and burgs, reveal hooks, and keep your world consistent at the table.
      </p>
      <div className="mt-5 flex items-center justify-center gap-3">
        <Link
          href="/states"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-[var(--brand-600)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
          aria-label="Explore states"
        >
          Explore the world
        </Link>
        <Link
          href="/burgs"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
          aria-label="Browse burgs"
        >
          Browse burgs
        </Link>
      </div>
    </section>
  );
}
