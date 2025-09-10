import { readJson } from "@/lib/fsjson";
import { dirs } from "@/lib/paths";

async function buildOverlays() { "use server"; await fetch("/api/ops/overlays/build", { method: "POST" }); }
async function renderDirty() { "use server"; await fetch("/api/ops/render/dirty", { method: "POST" }); }

export default async function QAPage() {
  const dirty = await readJson<{ burgs: number[]; states: number[] }>(dirs.index("dirty.json")).catch(() => ({ burgs: [], states: [] }));
  return (
    <main className="space-y-6">
      <h2 className="text-lg font-semibold">QA / Ops</h2>
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="text-sm">Dirty: <strong>{dirty.burgs.length}</strong> burg(s), <strong>{dirty.states.length}</strong> state(s)</div>
        <div className="mt-3 flex gap-2">
          <form action={buildOverlays}><button className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white">Build overlays</button></form>
          <form action={renderDirty}><button className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white">Render dirty</button></form>
        </div>
      </div>
    </main>
  );
}
