import fs from "fs/promises";
import path from "path";

type StateRow = {
  id: number;
  name: string;
  color?: string;
  capitalBurgId?: number|null;
  population?: number;
  area?: number;
  military?: number;
};

type BurgRow = {
  id: number;
  name: string;
  stateId?: number|null;
  pop?: number;
  port?: boolean;
};

async function readJson<T=any>(p:string): Promise<T> {
  return JSON.parse(await fs.readFile(p, "utf8"));
}

async function fileExists(p:string) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function main() {
  const stateFiles = await fs.readdir("facts/state").catch(()=>[]);
  const burgFiles  = await fs.readdir("facts/burg").catch(()=>[]);

  // Load states
  const states: StateRow[] = [];
  for (const f of stateFiles) states.push(await readJson(`facts/state/${f}`));

  // Load burgs (and derived flags if available)
  const burgs: (BurgRow & { isCapital?: boolean })[] = [];
  for (const f of burgFiles) {
    const b = await readJson<BurgRow>(`facts/burg/${f}`);
    let isCapital = false;
    try {
      const drv = await readJson<any>(`facts/derived/burg/${b.id}.json`);
      isCapital = !!drv.isCapital;
    } catch {}
    burgs.push({ ...b, isCapital });
  }

  // Group burgs by state
  const burgsByState = new Map<number, (BurgRow & {isCapital?:boolean})[]>();
  for (const b of burgs) {
    if (b.stateId == null) continue;
    (burgsByState.get(b.stateId) ?? burgsByState.set(b.stateId, []).get(b.stateId))!.push(b);
  }

  // Build catalog items
  const items = [];
  for (const s of states) {
    const sb = (burgsByState.get(s.id) ?? []).sort((a,b)=>(b.pop??0)-(a.pop??0));
    const emblemSvg = `assets/emblems/state-${s.id}.svg`;
    const hasEmblem = await fileExists(emblemSvg);

    items.push({
      kind: "state",
      id: s.id,
      name: s.name,
      color: s.color,
      emblem: hasEmblem ? emblemSvg : null,
      stats: {
        population: s.population ?? null,
        area: s.area ?? null,
        military: s.military ?? null,
        burgCount: sb.length,
        portCount: sb.filter(x=>x.port).length
      },
      burgs: sb.map(b => ({
        id: b.id,
        name: b.name,
        pop: b.pop ?? 0,
        port: !!b.port,
        isCapital: !!b.isCapital,
        emblem: (/* optional */ false) ? `assets/emblems/burg-${b.id}.svg` : null
      }))
    });
  }

  await fs.mkdir("index", { recursive: true });
  await fs.writeFile("index/catalog.json", JSON.stringify({ kingdoms: items }, null, 2));
  console.log(`Catalog written: index/catalog.json (states=${items.length})`);
}
main();
