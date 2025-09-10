import { db } from "@/db/client";
import { burgs, markers } from "@/db/schema";
import { eq } from "drizzle-orm";
import HeraldryBadge from "@/components/HeraldryBadge";
import OverlayPills from "@/components/OverlayPills";
import HookList from "@/components/HookList";
import MarkerCard from "@/components/MarkerCard";

export const dynamic = "force-dynamic";

export default async function BurgPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  
  // Get burg data from database
  const [burg] = await db.select().from(burgs).where(eq(burgs.burgId, id)).limit(1);
  if (!burg) {
    return <div>Burg not found</div>;
  }

  // Get nearby markers
  const nearby = await db.select().from(markers).where(eq(markers.burgId, id));

  const cityUrl = burg.citySvgUrl ? `/${burg.citySvgUrl}` : null;
  const villageUrl = burg.villageSvgUrl ? `/${burg.villageSvgUrl}` : null;
  const watabouUrl = burg.watabouUrl || null;

  return (
    <main className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <HeraldryBadge path={null} className="h-20 w-16" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{burg.name}</h1>
            <p className="text-sm text-zinc-600">Burg {burg.burgId} • State {burg.stateId} • Province {burg.provinceId}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700">{burg.kind}</span>
              {burg.population && <span className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700">Pop: {burg.population}</span>}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-base font-semibold">Location</h3>
            <p className="text-sm text-zinc-600">
              {burg.lat && burg.lon ? `Coordinates: ${burg.lat.toFixed(4)}, ${burg.lon.toFixed(4)}` : 'Coordinates not available'}
            </p>
          </section>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-base font-semibold">Nearby Markers</h3>
            {!nearby.length ? <p className="text-sm text-zinc-500">No markers near this burg.</p> : (
              <ul className="mt-3 space-y-3">{nearby.map(m => (<li key={m.id}><MarkerCard m={m} /></li>))}</ul>
            )}
          </section>
          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-base font-semibold">Local Maps (Watabou)</h3>
            {cityUrl || villageUrl ? (
              <div className="space-y-4">
                {cityUrl ? (<div><p className="mb-2 text-sm font-medium text-zinc-700">City</p><img src={cityUrl} alt="City Map" className="w-full rounded border border-zinc-200"/></div>) : null}
                {villageUrl ? (<div><p className="mb-2 text-sm font-medium text-zinc-700">Village</p><img src={villageUrl} alt="Village Map" className="w-full rounded border border-zinc-200"/></div>) : null}
              </div>
            ) : watabouUrl ? (
              <a href={watabouUrl} target="_blank" rel="noreferrer"
                 className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Open in Watabou
              </a>
            ) : (
              <p className="text-sm text-zinc-500">No maps attached.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
