import { readJson } from "@/lib/fsjson";
import { dirs } from "@/lib/paths";

export default async function Page() {
  const dirty = await readJson<{ burgs: number[]; states: number[]; updated_at?: string }>(dirs.index("dirty.json")).catch(() => ({ burgs: [], states: [] }));
  const heraldry = await readJson<{ count: number }>(dirs.index("heraldry_map.json")).catch(() => ({ count: 0 }));
  const hooks = await readJson<{ items: any[] }>(dirs.state("hooks_available.json")).catch(() => ({ items: [] }));

  return (
    <main className="space-y-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs text-zinc-500">Dirty queue</div>
          <div className="mt-1 text-2xl font-semibold">{dirty.burgs.length + dirty.states.length}</div>
          <div className="text-xs text-zinc-500">burgs: {dirty.burgs.length}, states: {dirty.states.length}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs text-zinc-500">Heraldry</div>
          <div className="mt-1 text-2xl font-semibold">{heraldry.count}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs text-zinc-500">Hook instances</div>
          <div className="mt-1 text-2xl font-semibold">{hooks.items.length}</div>
        </div>
      </section>
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
        Use the nav to browse states/burgs, accept & activate hooks, and run overlays/render on dirty nodes.
      </div>
    </main>
  );
}
