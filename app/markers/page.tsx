import { readJson } from "@/lib/fsjson";
import { dirs } from "@/lib/paths";
import MarkerCard from "@/components/MarkerCard";
import { MarkerIndex } from "@/lib/types";

export default async function MarkersPage() {
  const idx = await readJson<MarkerIndex>(dirs.index("markers.json")).catch(() => ({ markers: [] }));
  const items = idx.markers;
  return (
    <main className="space-y-6">
      <h2 className="text-lg font-semibold">Markers</h2>
      {!items.length ? <p className="text-sm text-zinc-500">No markers indexed.</p> : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map(m => (<MarkerCard key={m.id} m={m as any} />))}
        </div>
      )}
    </main>
  );
}
