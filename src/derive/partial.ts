import fs from "fs/promises";
import {
  loadAzgaar, extractStateFacts, extractBurgFacts,
  getCells, getBiomes, getReligions, getCultures, getRivers, getRoutes
} from "../ingest/azgaar.js";

type NumDict = Record<string, number>;
function topN<T extends [string, number]>(pairs: T[], n: number) {
  return pairs.sort((a,b)=>b[1]-a[1]).slice(0,n);
}

async function computeRouteDegAdj() {
  const a = await loadAzgaar();
  const routes = getRoutes(a);
  const deg: Record<number, number> = {};
  const adj: Record<number, number[]> = {};
  for (const r of routes) {
    const f = r?.from ?? r?.b1 ?? r?.u;
    const t = r?.to ?? r?.b2 ?? r?.v;
    if (typeof f === "number" && typeof t === "number") {
      deg[f] = (deg[f] ?? 0) + 1;
      deg[t] = (deg[t] ?? 0) + 1;
      (adj[f] ??= []).push(t);
      (adj[t] ??= []).push(f);
    }
  }
  return { deg, adj, a };
}

export async function deriveStatePartial(stateId:number) {
  const { a } = await computeRouteDegAdj(); // routes not needed here, but keeps API symmetrical
  const states = extractStateFacts(a);
  const burgs = extractBurgFacts(a);
  const cells = getCells(a);
  const biomes = getBiomes(a);
  const religions = getReligions(a);
  const cultures = getCultures(a);
  const rivers = getRivers(a);

  const stateIdByCell: number[] = cells.map((c:any)=> c?.state ?? -1);
  const biomeByCell: number[] = cells.map((c:any)=> c?.biome ?? -1);
  const relByCell: number[] = cells.map((c:any)=> c?.religion ?? -1);
  const culByCell: number[] = cells.map((c:any)=> c?.culture ?? -1);
  const tempByCell: number[] = cells.map((c:any)=> c?.temp ?? c?.temperature ?? NaN);
  const precByCell: number[] = cells.map((c:any)=> c?.prec ?? c?.precipitation ?? NaN);

  const biomeName = (i:number)=> biomes.find(x=>x.id===i)?.name ?? `biome#${i}`;
  const religionName = (i:number)=> religions.find(x=>x.id===i)?.name ?? `religion#${i}`;
  const cultureName = (i:number)=> cultures.find(x=>x.id===i)?.name ?? `culture#${i}`;

  const sCellsIdx = stateIdByCell.map((sid,i)=> sid===stateId ? i : -1).filter(i=>i>=0);
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

  const sBurgs = (burgs.filter(b=>b.stateId===stateId));
  const topBurgs = [...sBurgs].sort((a,b)=>(b.pop??0)-(a.pop??0)).slice(0,5).map(b=>({id:b.id,name:b.name,pop:b.pop,port:b.port}));
  const portCount = sBurgs.filter(b=>b.port).length;
  const hasCoast = portCount>0;
  const riverCount = rivers.filter((r:any)=>{
    const rcells: number[] = r?.cells ?? r?.river ?? r?.points ?? [];
    if (!Array.isArray(rcells)) return false;
    return rcells.some(ci => stateIdByCell[ci] === stateId);
  }).length;

  const topBiomes = topN(Object.entries(biomeCounts) as [string,number][], 3);
  const topRel = topN(Object.entries(relCounts) as [string,number][], 3);
  const topCul = topN(Object.entries(culCounts) as [string,number][], 3);

  const derived = {
    id: stateId,
    topBurgs,
    portCount,
    hasCoast,
    riverCount,
    routeHubs: [], // hubs require degrees; optional here, or compute globally if needed
    dominantBiomes: topBiomes.map(([k,v])=>({biome:k,count:v})),
    dominantReligions: topRel.map(([k,v])=>({religion:k,count:v})),
    dominantCultures: topCul.map(([k,v])=>({culture:k,count:v})),
    meanTemp: nClimate? +(tSum/nClimate).toFixed(2) : undefined,
    meanPrec: nClimate? +(pSum/nClimate).toFixed(2) : undefined
  };
  await fs.mkdir("facts/derived/state", { recursive: true });
  await fs.writeFile(`facts/derived/state/${stateId}.json`, JSON.stringify(derived,null,2));
}

export async function deriveBurgPartial(burgId:number) {
  const { a, deg, adj } = await computeRouteDegAdj();
  const states = extractStateFacts(a);
  const burgs = extractBurgFacts(a);
  const b = burgs.find(x=>x.id===burgId);
  if (!b) return;
  const isCapital = states.some(st => st.capitalBurgId === b.id);
  const degree = deg[b.id] ?? 0;
  const connected = (adj[b.id] ?? []).slice(0,8);
  const derived = { id: b.id, degree, connectedBurgIds: connected, isCapital };
  await fs.mkdir("facts/derived/burg", { recursive: true });
  await fs.writeFile(`facts/derived/burg/${burgId}.json`, JSON.stringify(derived,null,2));
}
