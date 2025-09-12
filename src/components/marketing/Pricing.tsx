import Link from 'next/link';

type Tier = {
  name: string;
  price: string;
  blurb: string;
  ctaHref: string;
  ctaLabel: string;
  features: string[];
  popular?: boolean;
};

const tiers: Tier[] = [
  {
    name: 'Community',
    price: '$0',
    blurb: 'Explore the world, browse lore, and simulate events locally.',
    ctaHref: '/states',
    ctaLabel: 'Get started',
    features: [
      'Browse states, provinces, and burgs',
      'Markers and overlays',
      'Hooks and events simulator',
    ],
  },
  {
    name: 'GM Pro',
    price: '$9/mo',
    blurb: 'Run full sessions with chains, canonical facts, and exports.',
    ctaHref: '/events',
    ctaLabel: 'Upgrade',
    features: [
      'Quest chains with auto-withdraw',
      'Derived pillars and canonical facts',
      'Export curated lore packs',
    ],
    popular: true,
  },
];

export default function Pricing() {
  return (
    <section
      aria-labelledby="pricing-title"
      className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 id="pricing-title" className="text-xl font-semibold tracking-tight text-[var(--ink)]">
          Simple pricing
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Get started for free. Upgrade when you need GM tools for the table.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative rounded-xl border p-5 ${
              t.popular
                ? 'border-[var(--brand-300)] bg-[var(--brand-50)]'
                : 'border-[var(--border)] bg-white'
            }`}
          >
            {t.popular ? (
              <span
                className="absolute -top-2 right-3 rounded-full bg-[var(--brand-600)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                aria-label="Most popular"
              >
                Popular
              </span>
            ) : null}
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-sm font-semibold text-[var(--ink)]">{t.name}</h3>
              <div className="text-lg font-bold text-[var(--ink)]">{t.price}</div>
            </div>
            <p className="mt-1 text-xs text-zinc-600">{t.blurb}</p>
            <ul className="mt-3 space-y-1.5 text-xs text-zinc-700">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--brand-600)]" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Link
                href={t.ctaHref}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ${
                  t.popular
                    ? 'bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)]'
                    : 'border border-[var(--border)] bg-white text-zinc-800 hover:bg-zinc-50'
                }`}
                aria-label={t.ctaLabel}
              >
                {t.ctaLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
