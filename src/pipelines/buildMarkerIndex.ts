// src/pipelines/buildMarkerIndex.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

type J = any;
const readJson = <T=any>(p: string): T | null => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const ensureDir = (d: string) => fs.mkdirSync(d, { recursive: true });

function checksumString(s: string): string {
  let h = 2166136261>>>0; for (let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0; }
  return `fnv1a_${h.toString(16)}`;
}
const nowIso = () => new Date().toISOString();

// --- HTML helpers ---
const stripTags = (html?: string) => String(html||"").replace(/<[^>]+>/g, "").replace(/\s+\n/g, "\n").trim();
function extractRunes(html?: string) {
  const s = String(html||"");
  // Heuristic: look for long spans of non-Latin glyphs or styled <div> blocks
  const divMatch = s.match(/<div[^>]*>([\s\S]*?)<\/div>/i);
  const candidate = divMatch ? stripTags(divMatch[1]) : stripTags(s);
  // If candidate contains many non a-z characters in a row, keep it; else empty.
  const nonLatinRatio = candidate ? candidate.replace(/[A-Za-z0-9\s.,;:'"!?()\-\[\]{}]/g, "").length / candidate.length : 0;
  return nonLatinRatio > 0.25 && candidate.length >= 12 ? candidate : "";
}

function normTag(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""); }

function findMarkersArray(obj: any): any[] | null {
  // Try common locations first
  if (Array.isArray(obj?.markers)) return obj.markers;
  if (Array.isArray(obj?.map?.markers)) return obj.map.markers;
  // Fallback: scan shallowly for an array of objects that look like markers
  for (const k of Object.keys(obj||{})) {
    const v = (obj as any)[k];
    if (Array.isArray(v) && v.length && typeof v[0] === "object" &&
        ("legend" in v[0] || "type" in v[0]) && ("name" in v[0] || "id" in v[0])) {
      return v;
    }
  }
  return null;
}

function loadMapJson() {
  // Look for your Azgaar export at the usual location
  const candidates = [
    "data/southia.json",
    "data/world.json",
    "facts/world/1.json" // fallback if you re-saved map here
  ];
  for (const p of candidates) if (fs.existsSync(p)) return { path: p, json: readJson<J>(p) };
  console.error("Map JSON not found. Expected one of:", candidates.join(", "));
  process.exit(2);
}

function gatherHints() {
  // Optional hints for state/province/burg mapping later
  const stateOutlines: Record<number, any> = {};
  if (fs.existsSync("canon/state")) {
    for (const f of fs.readdirSync("canon/state").filter(f=>f.endsWith(".outline.json"))) {
      const j = readJson<J>(path.join("canon/state", f)); if (!j) continue;
      const id = j.state_id ?? parseInt(f, 10);
      stateOutlines[id] = j;
    }
  }
  const burgFacts: Array<{id:number; x?:number; y?:number}> = [];
  const burgDir = fs.existsSync("facts/derived/burg") ? "facts/derived/burg" : (fs.existsSync("facts/burg") ? "facts/burg" : "");
  if (burgDir) {
    for (const f of fs.readdirSync(burgDir).filter(f=>f.endsWith(".json"))) {
      const j = readJson<J>(path.join(burgDir, f)); if (!j) continue;
      const id = j?.id ?? parseInt(f,10);
      const x = j?.x ?? j?.X ?? j?.lng ?? j?.lon ?? undefined; // tolerant
      const y = j?.y ?? j?.Y ?? j?.lat ?? undefined;
      burgFacts.push({ id: Number(id), x: typeof x==="number"? x: undefined, y: typeof y==="number"? y: undefined });
    }
  }
  return { stateOutlines, burgFacts };
}

function main() {
  const world = readJson<J>("canon/world/outline.json");
  const world_id = world?.world_id || world?.worldName || "world";

  const map = loadMapJson();
  const arr = findMarkersArray(map.json);
  if (!arr) {
    console.error(`No markers array found in ${map.path}`);
    process.exit(2);
  }

  const { stateOutlines, burgFacts } = gatherHints();

  const markers = arr.map((m:any, idx:number) => {
    const idRaw = String(m?.id ?? m?.i ?? m?.type ?? `marker_${idx}`);
    const id = idRaw.replace(/\s+/g, "_");
    const name = String(m?.name || m?.Name || id).trim();
    const type = String(m?.type || "marker").trim();
    const legend_html = typeof m?.legend === "string" ? m.legend : "";
    const legend_text = stripTags(legend_html);
    const runes_text = extractRunes(legend_html);

    // Positions if present
    const x = typeof m?.x === "number" ? m.x : (typeof m?.X === "number" ? m.X : undefined);
    const y = typeof m?.y === "number" ? m.y : (typeof m?.Y === "number" ? m.Y : undefined);

    // Tags from name/type/legend
    const tags = new Set<string>([
      normTag(type),
      ...name.split(/\s+/).map(normTag),
      ...(legend_text.toLowerCase().includes("inscription") ? ["inscription"] : []),
      ...(legend_text.toLowerCase().includes("ancient") ? ["ancient"] : []),
      ...(runes_text ? ["untranslated","runes"] : [])
    ].filter(Boolean));

    // Optional hints: try to find 0–3 nearest burg IDs if both have coords
    let near_burg_ids_hint: number[] = [];
    if (typeof x === "number" && typeof y === "number" && burgFacts.length) {
      const sorted = burgFacts
        .filter(b => typeof b.x==="number" && typeof b.y==="number")
        .map(b => ({ id: b.id, d2: (b.x!-x)**2 + (b.y!-y)**2 }))
        .sort((a,b)=>a.d2-b.d2)
        .slice(0,3)
        .map(b => b.id);
      near_burg_ids_hint = sorted;
    }

    // Very light heuristics for state/province hints (optional; we keep undefined if unknown)
    const state_id_hint = undefined;
    const province_id_hint = undefined;

    return {
      id, name, type,
      legend_text, legend_html, runes_text,
      x, y,
      state_id_hint, province_id_hint,
      near_burg_ids_hint,
      tags: Array.from(tags)
    };
  });

  const fingerprint = checksumString(JSON.stringify({ world_id, count: markers.length, src: path.basename(map.path) }));
  const out = {
    world_id,
    checksum: fingerprint,
    generated_at: nowIso(),
    markers
  };

  ensureDir("index");
  fs.writeFileSync("index/markers.json", JSON.stringify(out, null, 2), "utf8");
  console.log(`Markers index → index/markers.json  (count=${markers.length})`);
}

main();
