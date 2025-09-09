import fs from "fs/promises";
import path from "path";
import { WorldFacts, StateFacts, BurgFacts } from "../types/core.js";

type Azgaar = any; // keep loose

export async function loadAzgaar(p = "data/southia.json"): Promise<Azgaar> {
  const raw = await fs.readFile(path.resolve(p), "utf8");
  return JSON.parse(raw);
}

// --- Basics from earlier ---
export function extractWorldFacts(a: Azgaar): WorldFacts {
  return {
    mapName: a?.info?.mapName ?? a?.settings?.mapName ?? "Unknown",
    year: Number(a?.settings?.options?.year ?? 0),
    era: String(a?.settings?.options?.era ?? "Unknown"),
  };
}

export function extractStateFacts(a: Azgaar): StateFacts[] {
  const states = a?.pack?.states ?? [];
  return states
    .filter((s: any) => s && s.i != null && s.name)
    .map((s: any) => ({
      id: s.i,
      name: s.name,
      color: s.color,
      capitalBurgId: s.capital ?? null,
      neighbors: s.neighbors ?? [],
      // optional: many exports store area/pop/military on states
      population: s.population ?? undefined,
      area: s.area ?? undefined,
      military: s.military ?? undefined
    }));
}

export function extractBurgFacts(a: Azgaar): BurgFacts[] {
  const burgs = a?.pack?.burgs ?? [];
  return burgs.filter((b: any) => b && b.i != null).map((b: any) => ({
    id: b.i,
    name: b.name ?? `Burg ${b.i}`,
    stateId: b.state ?? null,
    pop: b.population ?? 0,
    port: Boolean(b.port),
    x: b.x, y: b.y,
    cell: b.cell ?? undefined
  }));
}

// --- Rich accessors (defensive) ---
export function getCells(a: Azgaar) {
  // pack.cells holds per-cell: state, biome idx, culture idx, religion idx, temp, prec, etc.
  return Array.isArray(a?.pack?.cells) ? a.pack.cells : [];
}

export function getBiomes(a: Azgaar): { id: number; name: string }[] {
  const biomesData = a?.biomesData?.biomes ?? a?.biomesData ?? [];
  // normalize to {id,name}
  return Array.isArray(biomesData)
    ? biomesData.map((b: any, i: number) => ({
        id: typeof b?.i === "number" ? b.i : i,
        name: b?.name ?? b?.n ?? `biome#${i}`
      }))
    : [];
}

export function getReligions(a: Azgaar): { id: number; name: string }[] {
  const arr = a?.pack?.religions ?? [];
  return arr
    .filter((r: any) => r && r.i != null && r.name)
    .map((r: any) => ({ id: r.i, name: r.name }));
}

export function getCultures(a: Azgaar): { id: number; name: string }[] {
  const arr = a?.pack?.cultures ?? [];
  return arr
    .filter((c: any) => c && c.i != null && c.name)
    .map((c: any) => ({ id: c.i, name: c.name }));
}

export function getRivers(a: Azgaar) {
  // rivers often have .i id and .cells (list of cell ids) or .coast?. Keep it generic.
  return Array.isArray(a?.pack?.rivers) ? a.pack.rivers : [];
}

export function getRoutes(a: Azgaar) {
  // roads/trade routes, often reference burg ids as endpoints
  return Array.isArray(a?.pack?.routes) ? a.pack.routes : [];
}

export function getProvinces(a: Azgaar) {
  return Array.isArray(a?.pack?.provinces) ? a.pack.provinces : [];
}
