import path from "node:path";
import { readJson } from "@/lib/fsjson";
import { dirs } from "@/lib/paths";
import HeraldryBadge from "@/components/HeraldryBadge";
import OverlayPills from "@/components/OverlayPills";
import HookList from "@/components/HookList";
import MarkerCard from "@/components/MarkerCard";
import { MarkerIndex, RenderedBurg } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BurgPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  const r = await readJson<RenderedBurg>(dirs.rendered(`burg/${id}.json`));
  const markers = await readJson<MarkerIndex>(dirs.index("markers.json")).catch(() => ({ markers: [] }));
  const nearby = markers.markers.filter(m => (m.near_burg_ids_hint || []).includes(id));

  const ov = r.overlay || undefined;
  const law = ov?.law_enforcement?.status || null;
  const damaged = ov?.assets_destroyed?.length || 0;

  const cityUrl = r.maps?.city_svg_path ? dirs.publicAsset(r.maps.city_svg_path) : null;
  const villageUrl = r.maps?.village_svg_path ? dirs.publicAsset(r.maps.village_svg_path) : null;

  return (
    <main className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <HeraldryBadge path={r.heraldry_path} className="h-20 w-16" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{r.name}</h1>
            <p className="text-sm text-zinc-600">Burg {r.burg_id} • State {r.state_id}{r.province_id ? ` • Province ${r.province_id}` : ""}</p>
            {r.tags?.length ? (
              <div className="mt-2 flex flex-wrap gap-1">{r.tags.map((t, i) => (<span key={`${t}-${i}`} className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700">{t}</span>))}</div>
            ) : null}
          </div>
        </div>
        <OverlayPills kind="burg" popMul={ov?.population_multiplier} tradeMul={ov?.state_trade_multiplier} law={law} damaged={damaged} />
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-base font-semibold">Economy Roles</h3>
            <ul className="mt-2 list-disc pl-5 text-sm">{(r.economy_roles || []).map((x, i) => (<li key={i}>{x}</li>))}</ul>
          </section>
          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-base font-semibold">Problems</h3>
            <ul className="mt-2 list-disc pl-5 text-sm">{(r.problems || []).map((x, i) => (<li key={i}>{x}</li>))}</ul>
          </section>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-xl border border-zinc-200 bg-white p-4"><h3 className="text-base font-semibold">Culture Notes</h3><ul className="mt-2 list-disc pl-5 text-sm">{(r.culture_notes || []).map((x, i) => (<li key={i}>{x}</li>))}</ul></section>
            <section className="rounded-xl border border-zinc-200 bg-white p-4"><h3 className="text-base font-semibold">Religious Presence</h3><ul className="mt-2 list-disc pl-5 text-sm">{(r.religion_presence || []).map((x, i) => (<li key={i}>{x}</li>))}</ul></section>
          </div>
          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-base font-semibold">Active Hooks</h3>
            <HookList items={(ov?.hooks_active || []).map(h => ({ ...h, status: "active", state_id: r.state_id, burg_id: r.burg_id })) as any} />
          </section>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-base font-semibold">Nearby Mysterious Markers</h3>
            {!nearby.length ? <p className="text-sm text-zinc-500">No indexed markers near this burg.</p> : (
              <ul className="mt-3 space-y-3">{nearby.map(m => (<li key={m.id}><MarkerCard m={m} /></li>))}</ul>
            )}
          </section>
          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-base font-semibold">Local Maps (Watabou)</h3>
            {!cityUrl && !villageUrl ? <p className="text-sm text-zinc-500">No maps attached.</p> : (
              <div className="space-y-4">
                {cityUrl ? (<div><p className="mb-2 text-sm font-medium text-zinc-700">City</p><img src={cityUrl} alt="City Map" className="w-full rounded border border-zinc-200"/></div>) : null}
                {villageUrl ? (<div><p className="mb-2 text-sm font-medium text-zinc-700">Village</p><img src={villageUrl} alt="Village Map" className="w-full rounded border border-zinc-200"/></div>) : null}
              </div>
            )}
          </section>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
            <p><strong>Generated:</strong> {new Date(r.generated_at).toLocaleString()}</p>
            {ov?.generated_at ? <p><strong>Overlay:</strong> {new Date(ov.generated_at).toLocaleString()}</p> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
