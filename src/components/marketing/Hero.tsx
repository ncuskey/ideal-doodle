import Link from 'next/link';

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--brand-50)] via-white to-[var(--brand-100)] px-6 py-12 md:px-10"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold tracking-wider text-[var(--brand-700)]">
          Worldbuilder dashboard
        </p>
        <h2
          id="hero-title"
          className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)] md:text-5xl"
        >
          Build, explore, and run your campaign world
        </h2>
        <p className="mt-3 text-sm text-zinc-600 md:text-base">
          Browse states, provinces, and burgs; trigger hooks and events; and keep canonical lore
          consistent—all in one place.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/states"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-[var(--brand-600)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
            aria-label="Browse states"
          >
            Browse States
          </Link>
          <Link
            href="/hooks"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
            aria-label="View hooks"
          >
            View Hooks
          </Link>
        </div>
      </div>
    </section>
  );
}
