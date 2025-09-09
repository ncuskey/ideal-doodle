// src/ingest/canonicalNames.ts
import fs from "node:fs";

type J = any;
const readJson = <T=any>(p: string): T | null => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };

function loadMaster() {
  const candidates = ["data/southia.json", "data/world.json", "facts/world/1.json"];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const data = readJson<J>(p);
      // Handle Azgaar format where data is in 'pack' object
      return data?.pack || data;
    }
  }
  return null;
}

/**
 * Build canonical name maps from the master export.
 * - States: json.states (id → name)
 * - Provinces: json.provinces (id → name) if present
 * - Burgs: json.burgs (id → name)
 */
export function buildNameMaps() {
  const m = loadMaster() || {};
  const stateNameById = new Map<number, string>();
  const provinceNameById = new Map<string, string>();
  const burgNameById = new Map<number, string>();

  const states = Array.isArray(m.states) ? m.states : [];
  for (const s of states) {
    const id = Number(s?.i ?? s?.id);
    const name = String(s?.name || s?.Name || "").trim();
    if (Number.isFinite(id) && name) stateNameById.set(id, name);
  }

  const provinces = Array.isArray(m.provinces) ? m.provinces : (Array.isArray(m.regions) ? m.regions : []);
  for (const p of provinces) {
    const idRaw = p?.i ?? p?.id;
    if (idRaw === undefined || idRaw === null) continue;
    const pid = String(idRaw);
    const name = String(p?.name || p?.Name || "").trim();
    if (pid && name) provinceNameById.set(pid, name);
  }

  const burgs = Array.isArray(m.burgs) ? m.burgs : [];
  for (const b of burgs) {
    const id = Number(b?.i ?? b?.id);
    const name = String(b?.name || b?.Name || "").trim();
    if (Number.isFinite(id) && name) burgNameById.set(id, name);
  }

  return { stateNameById, provinceNameById, burgNameById };
}
