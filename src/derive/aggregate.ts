import fs from "fs/promises";
import {
  loadAzgaar, extractStateFacts, extractBurgFacts,
  getCells, getBiomes, getReligions, getCultures, getRivers, getRoutes
} from "../ingest/azgaar.js";

type NumDict = Record<string, number>;
function topN<T extends [string, number]>(pairs: T[], n: number) {
  return pairs.sort((a,b)=>b[1]-a[1]).slice(0,n);
}

export async function buildDerived() {
  const a = await loadAzgaar();
  const states = extractStateFacts(a);
  const burgs = extractBurgFacts(a);
  const cells = getCells(a);
  const biomes = getBiomes(a);
  const religions = getReligions(a);
  const cultures = getCultures(a);
  const rivers = getRivers(a);
  const routes = getRoutes(a);

  // Burg route-degree & adjacency
  const deg: NumDict = {};
  const adj: Record<string, number[]> = {};
  for (const r of routes) {
    const f = r?.from ?? r?.b1 ?? r?.u; // common variants
    const t = r?.to ?? r?.b2 ?? r?.v;
    if (typeof f === "number" && typeof t === "number") {
      deg[f] = (deg[f] ?? 0) + 1;
      deg[t] = (deg[t] ?? 0) + 1;
      (adj[f] ??= []).push(t);
      (adj[t] ??= []).push(f);
    }
  }

  await fs.mkdir("facts/derived/state", { recursive: true });
  await fs.mkdir("facts/derived/burg", { recursive: true });

  // Pre-index burgs by state
  const burgsByState = new Map<number, any[]>();
  for (const b of burgs) {
    if (b.stateId == null) continue;
    (burgsByState.get(b.stateId) ?? burgsByState.set(b.stateId, []).get(b.stateId))!.push(b);
  }

  // Helper name resolvers
  const biomeName = (i:number)=> biomes.find(x=>x.id===i)?.name ?? `biome#${i}`;
  const religionName = (i:number)=> religions.find(x=>x.id===i)?.name ?? `religion#${i}`;
  const cultureName = (i:number)=> cultures.find(x=>x.id===i)?.name ?? `culture#${i}`;

  // Rivers by state (approx: any river with >=1 cell in state)
  const stateIdByCell: number[] = cells.map((c:any)=> c?.state ?? -1);
  function riverTouchesState(r:any, sid:number) {
    const rcells: number[] = r?.cells ?? r?.river ?? r?.points ?? [];
    if (!Array.isArray(rcells)) return false;
    for (const ci of rcells) {
      const s = typeof ci === "number" ? stateIdByCell[ci] : -1;
      if (s === sid) return true;
    }
    return false;
  }

  // Climate maps
  const biomeByCell: number[] = cells.map((c:any)=> c?.biome ?? -1);
  const relByCell: number[] = cells.map((c:any)=> c?.religion ?? -1);
  const culByCell: number[] = cells.map((c:any)=> c?.culture ?? -1);
  const tempByCell: number[] = cells.map((c:any)=> c?.temp ?? c?.temperature ?? NaN);
  const precByCell: number[] = cells.map((c:any)=> c?.prec ?? c?.precipitation ?? NaN);

  for (const s of states) {
    const sCellsIdx = stateIdByCell.map((sid,i)=> sid===s.id ? i : -1).filter(i=>i>=0);
    const biomeCounts: NumDict = {};
    const relCounts: NumDict = {};
    const culCounts: NumDict = {};
    let tSum=0, pSum=0, nClimate=0;
    for (const ci of sCellsIdx) {
      const b = biomeByCell[ci]; if (b>=0) biomeCounts[biomeName(b)] = (biomeCounts[biomeName(b)]??0)+1;
      const r = relByCell[ci]; if (r>=0) relCounts[religionName(r)] = (relCounts[religionName(r)]??0)+1;
      const c = culByCell[ci]; if (c>=0) culCounts[cultureName(c)] = (culCounts[cultureName(c)]??0)+1;
      const t = tempByCell[ci]; const p = precByCell[ci];
      if (!Number.isNaN(t)&&!Number.isNaN(p)) { tSum+=t; pSum+=p; nClimate++; }
    }

    const sBurgs = burgsByState.get(s.id) ?? [];
    const topBurgs = [...sBurgs].sort((a,b)=>(b.pop??0)-(a.pop??0)).slice(0,5).map(b=>({id:b.id,name:b.name,pop:b.pop,port:b.port}));
    const portCount = sBurgs.filter(b=>b.port).length;
    const hasCoast = portCount>0;
    const riverCount = rivers.filter((r: any)=>riverTouchesState(r, s.id)).length;
    const hubs = sBurgs.filter(b=>(deg[b.id]??0)>=2).map(b=>({id:b.id,name:b.name,degree:deg[b.id]})).sort((a,b)=> (b.degree??0)-(a.degree??0)).slice(0,5);

    const topBiomes = topN(Object.entries(biomeCounts) as [string,number][], 3);
   const topRel = topN(Object.entries(relCounts) as [string,number][], 3);
    const topCul = topN(Object.entries(culCounts) as [string,number][], 3);

    const derived = {
      id: s.id,
      topBurgs,
      portCount,
      hasCoast,
      riverCount,
      routeHubs: hubs,
      dominantBiomes: topBiomes.map(([k,v])=>({biome:k,count:v})),
      dominantReligions: topRel.map(([k,v])=>({religion:k,count:v})),
      dominantCultures: topCul.map(([k,v])=>({culture:k,count:v})),
      meanTemp: nClimate? +(tSum/nClimate).toFixed(2) : undefined,
      meanPrec: nClimate? +(pSum/nClimate).toFixed(2) : undefined
    };
    await fs.writeFile(`facts/derived/state/${s.id}.json`, JSON.stringify(derived,null,2));
  }

  // Burg-level derived
  for (const b of burgs) {
    const degree = deg[b.id] ?? 0;
    const connected = (adj[b.id] ?? []).slice(0,8);
    const isCapital = states.some(st => st.capitalBurgId === b.id);
    const derived = { id: b.id, degree, connectedBurgIds: connected, isCapital };
    await fs.writeFile(`facts/derived/burg/${b.id}.json`, JSON.stringify(derived,null,2));
  }
}
