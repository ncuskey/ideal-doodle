import path from "node:path";
import { promises as fs } from "node:fs";
import Link from "next/link";

type Burg = { burg_id:number; name:string; state_id:number; province_id?:string|null };

async function loadProvince(stateId: number, slug: string) {
  const p = path.join(process.cwd(), "canon", "province", `prov_${stateId}_${slug}.outline.json`);
  const j = JSON.parse(await fs.readFile(p, "utf8"));
  return j;
}

async function loadBurgs(): Promise<Burg[]> {
  const dir = path.join(process.cwd(), "rendered", "burg");
  const files = await fs.readdir(dir).catch(()=>[]);
  const rows: Burg[] = [];
  for (const f of files.filter(x=>x.endsWith(".json"))) {
    const j = JSON.parse(await fs.readFile(path.join(dir,f), "utf8"));
    rows.push({ burg_id:j.burg_id, name:j.name, state_id:j.state_id, province_id:j.province_id || null });
  }
  return rows;
}

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const [stateStr, slug] = key.split("~");
  const stateId = Number(stateStr);
  const prov = await loadProvince(stateId, slug);
  const name = prov?.name || slug.replace(/_/g," ");
  const all = await loadBurgs();
  const burgs = all.filter(b => b.state_id === stateId && String(b.province_id||"").toLowerCase() === slug.toLowerCase());

  return (
    <main className="space-y-6">
      <nav className="text-sm text-zinc-600">
        <Link className="hover:underline" href="/states">States</Link> <span>›</span>{" "}
        <Link className="hover:underline" href={`/states/${stateId}`}>State {stateId}</Link> <span>›</span>{" "}
        <span className="text-zinc-800">{name}</span>
      </nav>

      <header>
        <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
        {prov?.economy_niches?.length ? <p className="text-sm text-zinc-600">Economy: {prov.economy_niches.join(", ")}</p> : null}
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="text-base font-semibold">Burgs</h3>
        {!burgs.length ? <p className="text-sm text-zinc-500">No burgs indexed for this province.</p> : (
          <ul className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
            {burgs.map(b => (
              <li key={b.burg_id} className="rounded-lg border border-zinc-200 p-3">
                <Link className="hover:underline text-sm font-medium" href={`/burgs/${b.burg_id}`}>{b.name}</Link>
                <div className="text-xs text-zinc-500">Burg {b.burg_id}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
