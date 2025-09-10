import { db } from "@/db/client";
import { states, provinces } from "@/db/schema";
import { eq } from "drizzle-orm";
import HeraldryBadge from "@/components/HeraldryBadge";
import OverlayPills from "@/components/OverlayPills";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  
  // Get state data from database
  const [state] = await db.select().from(states).where(eq(states.stateId, id)).limit(1);
  if (!state) {
    return <div>State not found</div>;
  }

  // Get provinces for this state
  const provs = await db.select().from(provinces).where(eq(provinces.stateId, id)).orderBy(provinces.name);

  return (
    <main className="space-y-6">
      <header className="flex items-end justify-between">
        <div className="flex items-start gap-4">
          <HeraldryBadge path={state.heraldrySvgUrl} className="h-16 w-12" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{state.name}</h1>
            {state.summary && <p className="text-sm text-zinc-600">{state.summary}</p>}
          </div>
        </div>
      </header>

      {provs.length ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <h3 className="text-base font-semibold">Provinces</h3>
          <ul className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
            {provs.map(p=>(
              <li key={p.slug}><Link className="hover:underline" href={`/provinces/${id}~${p.slug}`}>{p.name}</Link></li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
