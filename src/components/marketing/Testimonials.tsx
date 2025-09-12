type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

const items: Testimonial[] = [
  {
    quote:
      'The heraldry and overlays make each state feel alive. It’s become our GM table’s single source of truth.',
    author: 'Aurelia',
    role: 'GM, Borderlands Campaign',
  },
  {
    quote:
      'Hooks chaining with auto-withdraw avoids duplicates mid-session. It keeps our sessions flowing.',
    author: 'Dalen',
    role: 'Player, Trade Winds',
  },
  {
    quote:
      'Canonical facts and derived pillars helped us refactor a messy world into something coherent.',
    author: 'Mira',
    role: 'World Author',
  },
];

export default function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-title"
      className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="testimonials-title"
          className="text-xl font-semibold tracking-tight text-[var(--ink)]"
        >
          What GMs are saying
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Built with table-tested workflows for running rich worlds.
        </p>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((t) => (
          <li
            key={t.author}
            className="rounded-xl border border-[var(--border)] bg-white p-4"
          >
            <blockquote className="text-sm text-zinc-700">&ldquo;{t.quote}&rdquo;</blockquote>
            <div className="mt-3 text-xs text-zinc-500">
              <span className="font-medium text-zinc-700">{t.author}</span>
              <span aria-hidden> &middot; </span>
              <span>{t.role}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
