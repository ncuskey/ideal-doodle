import { readJson } from "@/lib/fsjson";
import { dirs } from "@/lib/paths";
import HeraldryBadge from "@/components/HeraldryBadge";
import OverlayPills from "@/components/OverlayPills";
import { RenderedState } from "@/lib/types";

export default async function StatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  const r = await readJson<RenderedState>(dirs.rendered(`state/${id}.json`));
  const law = r.overlay?.law_enforcement?.status || null;

  return (
    <main className="space-y-6">
      <header className="flex items-end justify-between">
        <div className="flex items-start gap-4">
          <HeraldryBadge path={r.heraldry_path} className="h-16 w-12" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{r.name}</h1>
            {r.economy_pillars?.length ? <p className="text-sm text-zinc-600">Economy: {r.economy_pillars.join(", ")}</p> : null}
          </div>
        </div>
        <OverlayPills kind="state" tradeMul={r.overlay?.trade_multiplier} law={law} />
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h3 className="text-base font-semibold">Culture</h3>
          <pre className="mt-2 max-h-96 overflow-auto rounded bg-zinc-50 p-3 text-xs">{JSON.stringify(r.culture || {}, null, 2)}</pre>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <h3 className="text-base font-semibold">Religion</h3>
          <pre className="mt-2 max-h-96 overflow-auto rounded bg-zinc-50 p-3 text-xs">{JSON.stringify(r.religion || {}, null, 2)}</pre>
        </div>
      </section>

      {r.overlay?.reputations?.length ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <h3 className="text-base font-semibold">Faction Reputations</h3>
          <table className="mt-2 min-w-full text-sm">
            <thead><tr><th className="text-left">Faction</th><th className="text-right">Score</th></tr></thead>
            <tbody>
              {r.overlay.reputations.map((rr, i) => (
                <tr key={i} className="border-t border-zinc-100"><td>{rr.faction}</td><td className="text-right">{rr.score}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </main>
  );
}
