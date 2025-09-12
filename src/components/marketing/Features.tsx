import { Shield, Map, Workflow, ScrollText, Sparkles } from 'lucide-react';

type Feature = {
  title: string;
  desc: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const features: Feature[] = [
  {
    title: 'Heraldry & Maps',
    desc: 'Browse coats of arms, geography, and overlays to anchor your world visually.',
    icon: Shield,
  },
  {
    title: 'Hooks & Events',
    desc: 'Trigger events and branch hooks into chains while avoiding duplicates.',
    icon: Workflow,
  },
  {
    title: 'Canonical Lore',
    desc: 'Keep facts consistent as your world grows, with derived pillars and summaries.',
    icon: ScrollText,
  },
  {
    title: 'Procedural World',
    desc: 'Generate structured content and interlink burgs, provinces, and states.',
    icon: Sparkles,
  },
  {
    title: 'Markers & Obelisks',
    desc: 'Track landmarks, runes, and relations across nearby settlements.',
    icon: Map,
  },
];

export default function Features() {
  return (
    <section aria-labelledby="features-title" className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <div className="mx-auto max-w-3xl text-center">
        <h2 id="features-title" className="text-xl font-semibold tracking-tight text-[var(--ink)]">
          Build with powerful primitives
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Everything you need to explore, author, and run your world—grounded in consistent data.
        </p>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ title, desc, icon: Icon }) => (
          <li key={title} className="group rounded-xl border border-[var(--border)] bg-white p-4 transition hover:bg-zinc-50">
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[var(--brand-100)] text-[var(--brand-700)]"
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[var(--ink)]">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-zinc-600">{desc}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
