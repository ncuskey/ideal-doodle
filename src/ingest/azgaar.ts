import fs from "fs/promises";
import path from "path";
import { WorldFacts, StateFacts, BurgFacts } from "../types/core.js";

type Azgaar = any; // keep loose for now

export async function loadAzgaar(p = "data/southia.json"): Promise<Azgaar> {
  const raw = await fs.readFile(path.resolve(p), "utf8");
  return JSON.parse(raw);
}

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
    .filter((s: any) => s && s.i != null && s.name) // Azgaar uses indices
    .map((s: any) => ({
      id: s.i,
      name: s.name,
      color: s.color,
      capitalBurgId: s.capital ?? null,
      neighbors: s.neighbors ?? [],
    }));
}

export function extractBurgFacts(a: Azgaar): BurgFacts[] {
  const burgs = a?.pack?.burgs ?? [];
  return burgs.filter((b: any) => b && b.i != null).map((b: any) => ({
    id: b.i, name: b.name ?? `Burg ${b.i}`,
    stateId: b.state ?? null, pop: b.population ?? 0,
    port: Boolean(b.port), x: b.x, y: b.y
  }));
}
