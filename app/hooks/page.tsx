import { readJson } from "@/lib/fsjson";
import { dirs } from "@/lib/paths";
import { HookSuggestion, HookInstance } from "@/lib/types";

async function accept(suggIds: string[]) {
  "use server";
  // Call API route to run npm script (keeps server components clean)
  const res = await fetch("/api/hooks/accept", { method: "POST", body: JSON.stringify({ suggIds }), headers: { "content-type": "application/json" } });
  return res.json();
}

export default async function HooksPage() {
  const linkSug = await readJson<{ hook_placements: HookSuggestion[] }>(dirs.index("link_suggestions.json")).catch(() => ({ hook_placements: [] }));
  const hooksAvail = await readJson<{ items: HookInstance[] }>(dirs.state("hooks_available.json")).catch(() => ({ items: [] }));

  return (
    <main className="space-y-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="text-base font-semibold">Suggestions</h3>
        {!linkSug.hook_placements.length ? <p className="text-sm text-zinc-500">No suggestions.</p> : (
          <form className="mt-3 space-y-3" action={async (formData) => {
            const picked = linkSug.hook_placements.map(s => formData.get(s.sugg_id) ? s.sugg_id : null).filter(Boolean) as string[];
            if (picked.length) await accept(picked);
          }}>
            <ul className="space-y-2">
              {linkSug.hook_placements.map(s => (
                <li key={s.sugg_id} className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3">
                  <input type="checkbox" name={s.sugg_id} className="mt-1" />
                  <div>
                    <div className="text-sm"><strong>{s.hook_template_id}</strong> → burg {s.burg_id} (state {s.state_id})</div>
                    <div className="text-xs text-zinc-500">{s.rationale}</div>
                  </div>
                </li>
              ))}
            </ul>
            <button type="submit" className="mt-3 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">Accept selected</button>
          </form>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="text-base font-semibold">Instances</h3>
        {!hooksAvail.items.length ? <p className="text-sm text-zinc-500">No instances.</p> : (
          <ul className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            {hooksAvail.items.map(h => (
              <li key={h.hook_instance_id} className="rounded-lg border border-zinc-200 p-3">
                <div className="text-sm"><strong>{h.chain_id}</strong> · {h.hook_template_id}</div>
                <div className="text-xs text-zinc-500">burg {h.burg_id} · state {h.state_id} · status {h.status}</div>
                <form className="mt-2" action={async () => {
                  await fetch("/api/quests/activate", { method: "POST", body: JSON.stringify({ chain: h.chain_id, hook: h.hook_instance_id }), headers: { "content-type": "application/json" } });
                  await fetch("/api/ops/overlays/build", { method: "POST" });
                  await fetch("/api/ops/render/dirty", { method: "POST" });
                }}>
                  <button type="submit" className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">Activate</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
