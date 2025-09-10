import path from "node:path";
import { promises as fs } from "node:fs";
import Link from "next/link";

type Row = { state_id: number; prov_id: string; name: string; burg_count: number };

async function readRows(): Promise<Row[]> {
  const dir = path.join(process.cwd(), "canon", "province");
  const files = await fs.readdir(dir).catch(() => []);
  const rows: Row[] = [];
  for (const f of files.filter(x => x.endsWith(".outline.json"))) {
    const m = f.match(/^prov_(\d+)_(.+)\.outline\.json$/);
    if (!m) continue;
    const state_id = Number(m[1]);
    const prov_id = m[2]; // slug
    const j = JSON.parse(await fs.readFile(path.join(dir, f), "utf8"));
    const name = j?.name || prov_id.replace(/_/g, " ");
    const burgs = Array.isArray(j?.burg_ids) ? j.burg_ids.length : (j?.burgs?.length || 0);
    rows.push({ state_id, prov_id, name, burg_count: burgs });
  }
  return rows.sort((a,b)=> a.state_id - b.state_id || a.name.localeCompare(b.name));
}

export default async function Page() {
  const rows = await readRows();
  return (
    <main className="space-y-6">
      <h2 className="text-lg font-semibold">Provinces</h2>
      {!rows.length ? <p className="text-sm text-zinc-500">No provinces indexed.</p> : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50">
              <tr><th className="px-3 py-2 text-left">Province</th><th className="px-3 py-2">State</th><th className="px-3 py-2 text-right">Burgs</th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={`${r.state_id}-${r.prov_id}`} className="border-t border-zinc-100 hover:bg-zinc-50/80">
                  <td className="px-3 py-2"><Link className="hover:underline" href={`/provinces/${r.state_id}~${r.prov_id}`}>{r.name}</Link></td>
                  <td className="px-3 py-2"><Link className="hover:underline" href={`/states/${r.state_id}`}>State {r.state_id}</Link></td>
                  <td className="px-3 py-2 text-right">{r.burg_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
