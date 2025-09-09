// src/pipelines/crossLinkSuggest.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

type J = any;
const readJson = <T=any>(p: string): T | null => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const listJson = (dir: string) => fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith(".json")).map(f => path.join(dir, f)) : [];
const ensureDir = (d: string) => fs.mkdirSync(d, { recursive: true });

function checksumString(s: string): string { let h = 2166136261>>>0; for (let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0;} return `fnv1a_${h.toString(16)}`; }
const nowIso = () => new Date().toISOString();

function jaccard(a: Set<string>, b: Set<string>) {
  const i = new Set([...a].filter(x => b.has(x))).size;
  const u = new Set([...a, ...b]).size || 1;
  return i / u;
}
function normTag(s: string) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""); }

type Burg = { id:number; name:string; state_id:number; province_id?:string; tags:Set<string>; econ:Set<string>; rel:Set<string>; cult:Set<string> };
type Prov = { province_id:string; name:string; state_id:number; econ:Set<string>; rel:Set<string>; cultAdj:Set<string>; tags:Set<string>; burgs:string[] };

function gather() {
  const world = readJson<J>("canon/world/outline.json");
  const interstate = readJson<J>("canon/interstate/outline.json");

  // State outlines
  const stateOutlines = new Map<number, J>();
  for (const f of listJson("canon/state")) {
    const so = readJson<J>(f);
    const sid = so?.state_id ?? parseInt(path.basename(f).split(".")[0], 10);
    if (Number.isFinite(sid)) stateOutlines.set(sid, so);
  }

  // Provinces (optional but preferred)
  const provs: Prov[] = [];
  if (fs.existsSync("canon/province")) {
    for (const f of listJson("canon/province")) {
      const po = readJson<J>(f);
      if (!po) continue;
      const state_id = po.state_id ?? 0;
      const province_id = String(po.province_id ?? path.basename(f, ".json"));
      const name = po.name || province_id;
      const econ = new Set<string>((po.economy_niches || []).map(normTag));
      const rel = new Set<string>(((po.religion_profile?.families_present) || []).map(normTag));
      const cultAdj = new Set<string>((po.culture_adjustments || []).map(normTag));
      const tags = new Set<string>((po.tags || []).map(normTag));
      const settlements_hint = Array.isArray(po.settlements_hint) ? po.settlements_hint.map(String) : [];
      provs.push({ province_id, name, state_id, econ, rel, cultAdj, tags, burgs: settlements_hint });
    }
  }

  // Burgs
  const burgs: Burg[] = [];
  for (const f of listJson("canon/burg")) {
    const bo = readJson<J>(f);
    if (!bo) continue;
    const id = Number(bo.burg_id ?? path.basename(f, ".json"));
    const name = bo.name || `Burg_${id}`;
    const state_id = Number(bo.state_id ?? 0);
    const province_id = bo.province_id ? String(bo.province_id) : undefined;
    const tags = new Set<string>((bo.tags || []).map(normTag));
    const econ = new Set<string>((bo.economy_roles || []).map(normTag));
    const rel = new Set<string>((bo.religion_presence || []).map(normTag));
    const cult = new Set<string>((bo.culture_notes || []).map(normTag));
    burgs.push({ id, name, state_id, province_id, tags, econ, rel, cult });
  }

  // Hooks templates (optional; not required for this step)
  const hookTemplates: Array<{hook_template_id:string; themes:Set<string>; placement_rules?:any}> = [];
  if (fs.existsSync("canon/quests/hooks")) {
    for (const f of listJson("canon/quests/hooks")) {
      const ho = readJson<J>(f);
      if (!ho) continue;
      const id = String(ho.hook_template_id || path.basename(f, ".json"));
      const themes = new Set<string>([
        ...(Array.isArray(ho.themes) ? ho.themes : []),
        ...(Array.isArray(ho.keywords) ? ho.keywords : []),
        ...(Array.isArray(ho.outline?.clue_bullets) ? ho.outline.clue_bullets : [])
      ].map(normTag).filter(Boolean));
      hookTemplates.push({ hook_template_id: id, themes, placement_rules: ho.placement_rules });
    }
  }

  // Markers (from Azgaar export → index/markers.json)
  let markers: Array<{id:string; name:string; type:string; tags:string[]; near_burg_ids_hint:number[]}> = [];
  if (fs.existsSync("index/markers.json")) {
    const mi = readJson<J>("index/markers.json");
    if (mi?.markers && Array.isArray(mi.markers)) {
      markers = mi.markers.map((m:any) => ({
        id: String(m.id), name: String(m.name || m.id),
        type: String(m.type || "marker"),
        tags: Array.isArray(m.tags) ? m.tags.map((t:string)=>String(t).toLowerCase()) : [],
        near_burg_ids_hint: Array.isArray(m.near_burg_ids_hint) ? m.near_burg_ids_hint.map((x:any)=>Number(x)).filter(Number.isFinite) : []
      }));
    }
  }

  return { world, interstate, stateOutlines, provs, burgs, hookTemplates, markers };
}

// --- Affinity scoring heuristics (deterministic, cheap) ---
function scoreReligion(a: {rel:Set<string>}, b:{rel:Set<string>}) { return jaccard(a.rel, b.rel); }
function scoreCulture(a: {cult?:Set<string>, tags:Set<string>}, b:{cult?:Set<string>, tags:Set<string>}) {
  const ca = a.cult ?? new Set<string>(); const cb = b.cult ?? new Set<string>();
  return 0.7 * jaccard(ca, cb) + 0.3 * jaccard(a.tags, b.tags);
}
function scoreTrade(a:{econ:Set<string>, tags:Set<string>}, b:{econ:Set<string>, tags:Set<string>}) {
  // Simple complementarity: port/coastal pairs with inland producer; shared econ also adds a bit.
  const hasPortA = a.tags.has("port") || a.tags.has("coastal");
  const hasPortB = b.tags.has("port") || b.tags.has("coastal");
  const producer = (s:Set<string>) => Number(s.has("grain") || s.has("timber") || s.has("ore") || s.has("mining") || s.has("quarry") || s.has("textiles"));
  const comp = (hasPortA && producer(b.econ) ? 0.6 : 0) + (hasPortB && producer(a.econ) ? 0.6 : 0);
  const shared = 0.4 * jaccard(a.econ, b.econ);
  return Math.min(1, comp + shared);
}
function scoreMigration(a:{tags:Set<string>}, b:{tags:Set<string>}) {
  // If A has disaster/war/famine hints and B has safety/hub hints
  const trouble = ["famine","plague","war","banditry","unrest","floodplain","drought"].some(t => a.tags.has(t));
  const safe = ["capital","university","cathedral","trade_hub","fortified"].some(t => b.tags.has(t));
  return (trouble && safe) ? 0.7 : 0.0;
}

function mkSuggId(prefix:string, aKey:string, bKey:string) {
  const pair = [aKey, bKey].sort().join("__");
  return `${prefix}_${checksumString(pair)}`;
}

function main() {
  const g = gather();
  if (!g.world) {
    console.error("Missing canon/world/outline.json — run earlier steps first.");
    process.exit(2);
  }

  // Build checksum over inputs (world + counts + simple sums of state/prov/burg)
  const ck = checksumString(JSON.stringify({
    w: g.world.checksum || g.world.world_id,
    i: g.interstate?.checksum || "",
    s: [...g.stateOutlines.values()].map((x:any)=>x.checksum||x.state_id).slice(0,50),
    pc: g.provs.length, bc: g.burgs.length
  }));

  const affinities: any[] = [];
  const pushAff = (type:string, a:any, b:any, score:number, rationale:string, evidence:any, impact:"local"|"regional"|"state"|"interstate") => {
    if (a.state_id === b.state_id) return; // cross-state only, per your spec
    const sugg_id = mkSuggId(type, `${a.kind}:${a.id}`, `${b.kind}:${b.id}`);
    affinities.push({ sugg_id, type, a, b, score: Number(score.toFixed(3)), rationale, evidence, impact_scope: impact });
  };

  // Province ↔ Province (religion, culture, trade, migration)
  for (let i=0;i<g.provs.length;i++) {
    for (let j=i+1;j<g.provs.length;j++) {
      const A = g.provs[i], B = g.provs[j];
      if (A.state_id === B.state_id) continue;
      const aRef = { kind:"province", id:A.province_id, state_id:A.state_id, label:A.name };
      const bRef = { kind:"province", id:B.province_id, state_id:B.state_id, label:B.name };

      const r = scoreReligion({rel:A.rel},{rel:B.rel});
      if (r >= 0.5) pushAff("religion_link", aRef, bRef, r, "Shared/overlapping religion families", {a:[...A.rel], b:[...B.rel]}, "interstate");
      const c = jaccard(A.cultAdj, B.cultAdj);
      if (c >= 0.5) pushAff("culture_link", aRef, bRef, c, "Similar culture adjustments", {a:[...A.cultAdj], b:[...B.cultAdj]}, "interstate");
      const t = scoreTrade({econ:A.econ, tags:A.tags}, {econ:B.econ, tags:B.tags});
      if (t >= 0.6) pushAff("trade_link", aRef, bRef, t, "Trade complementarity (producer ↔ hub/port)", {a:[...A.econ,...A.tags], b:[...B.econ,...B.tags]}, "interstate");
      const m = scoreMigration({tags:A.tags},{tags:B.tags});
      if (m >= 0.6) pushAff("migration_link", aRef, bRef, m, "Push/pull migration potential", {a:[...A.tags], b:[...B.tags]}, "interstate");
    }
  }

  // Burg ↔ Burg (religion, culture, trade)
  const capPerType = Number(process.env.LINKS_CAP_PER_TYPE ?? 120);
  let counters: Record<string, number> = {};
  for (let i=0;i<g.burgs.length;i++) {
    for (let j=i+1;j<g.burgs.length;j++) {
      const A = g.burgs[i], B = g.burgs[j];
      if (A.state_id === B.state_id) continue;
      const aRef = { kind:"burg", id:A.id, state_id:A.state_id, label:A.name };
      const bRef = { kind:"burg", id:B.id, state_id:B.state_id, label:B.name };

      const pairs: Array<[string, number, string, any]> = [];
      const r = scoreReligion({rel:A.rel},{rel:B.rel});
      if (r >= 0.55) pairs.push(["religion_link", r, "Shared/overlapping religion presence", {a:[...A.rel], b:[...B.rel]}]);
      const c = scoreCulture({cult:A.cult, tags:A.tags}, {cult:B.cult, tags:B.tags});
      if (c >= 0.55) pairs.push(["culture_link", c, "Cultural affinity (dialect/customs/tags)", {a:[...A.cult,...A.tags], b:[...B.cult,...B.tags]}]);
      const t = scoreTrade({econ:A.econ, tags:A.tags}, {econ:B.econ, tags:B.tags});
      if (t >= 0.65) pairs.push(["trade_link", t, "Trade complementarity", {a:[...A.econ,...A.tags], b:[...B.econ,...B.tags]}]);

      for (const [type, score, rationale, evidence] of pairs.sort((x,y)=>y[1]-x[1])) {
        if ((counters[type]||0) >= capPerType) continue;
        pushAff(type, aRef, bRef, score, rationale, evidence, "regional");
        counters[type] = (counters[type]||0) + 1;
      }
    }
  }

  // Optional: Hook placements (templates + markers)
  const hook_placements: any[] = [];
  if (g.hookTemplates.length) {
    // Index burgs by id for quick lookups
    const burgById = new Map<number, (typeof g.burgs)[number]>();
    for (const b of g.burgs) burgById.set(b.id, b);

    // 1) Theme-based placements (burg quest_hook_slots overlap) — keep previous simple logic
    for (const f of listJson("canon/burg")) {
      const bo = readJson<J>(f);
      if (!bo) continue;
      const burg_id = Number(bo.burg_id ?? path.basename(f, ".json"));
      const state_id = Number(bo.state_id ?? 0);
      const slots: string[] = (bo.quest_hook_slots || []).map((s:string)=>s.toLowerCase());
      if (!slots.length) continue;

      for (const ht of g.hookTemplates) {
        const overlap = jaccard(new Set(slots), new Set(ht.themes || []));
        if (overlap >= 0.5) {
          const sugg_id = mkSuggId("hook_place", `hook:${ht.hook_template_id}`, `burg:${burg_id}`);
          hook_placements.push({
            sugg_id, hook_template_id: ht.hook_template_id,
            burg_id, state_id, score: Number(overlap.toFixed(3)),
            rationale: `Theme overlap between burg slots ${JSON.stringify(slots)} and template themes`
          });
        }
      }
    }

    // 2) Marker-based placements (e.g., untranslated monoliths near burgs)
    const htById = new Map<string, any>();
    for (const ht of g.hookTemplates) htById.set(String(ht.hook_template_id), ht);

    for (const ht of g.hookTemplates) {
      const pr = ht.placement_rules || {};
      const markerTypes = new Set<string>((pr.marker_types || []).map((x:string)=>x.toLowerCase()));
      const markerTagsAny = new Set<string>((pr.marker_tags_any || []).map((x:string)=>x.toLowerCase()));
      const capPerState = pr.cap_per_state ?? Infinity;
      const capWorld = pr.cap_world ?? Infinity;
      const burgsPerMarker = Math.max(1, pr.burgs_per_marker ?? 1);

      if (!markerTypes.size && !markerTagsAny.size) continue;

      // counters for caps
      const perState: Record<number, number> = {};
      let total = 0;

      for (const mk of g.markers) {
        if (total >= capWorld) break;

        const typeOk = markerTypes.size ? markerTypes.has(mk.type.toLowerCase()) : true;
        const tagOk = markerTagsAny.size ? mk.tags.some(t => markerTagsAny.has(String(t).toLowerCase())) : true;
        if (!typeOk || !tagOk) continue;

        // choose up to N nearest burgs (from precomputed hints)
        let candidates = (mk.near_burg_ids_hint || []).map(id => burgById.get(id)).filter(Boolean) as (typeof g.burgs)[number][];
        
        // Fallback: if no nearby burg hints, use all burgs as candidates (will be capped by placement rules)
        if (!candidates.length) {
          candidates = g.burgs;
        }

        // score heuristic: base on theme match + marker presence; 0.9 for direct marker proximity
        const baseScore = 0.9;

        let placedForThisMarker = 0;
        for (const b of candidates) {
          if (placedForThisMarker >= burgsPerMarker) break;
          const usedInState = perState[b.state_id] || 0;
          if (usedInState >= capPerState) continue;
          if (total >= capWorld) break;

          const sugg_id = mkSuggId("hook_place_marker", `hook:${ht.hook_template_id}`, `burg:${b.id}_${mk.id}`);
          hook_placements.push({
            sugg_id,
            hook_template_id: ht.hook_template_id,
            burg_id: b.id,
            state_id: b.state_id,
            score: baseScore,
            rationale: `Near marker "${mk.name}" (${mk.type}); tags ${JSON.stringify(mk.tags)}`
          });

          perState[b.state_id] = usedInState + 1;
          total += 1;
          placedForThisMarker += 1;
        }
      }
    }
  }

  // Cap totals for sanity
  const MAX_AFF = Number(process.env.LINKS_MAX_AFFINITIES ?? 400);
  const MAX_HOOKS = Number(process.env.LINKS_MAX_HOOKS ?? 200);

  affinities.sort((a,b)=>b.score - a.score);
  const affOut = affinities.slice(0, MAX_AFF);
  hook_placements.sort((a,b)=>b.score - a.score);
  const hooksOut = hook_placements.slice(0, MAX_HOOKS);

  const outDoc = {
    world_id: g.world.world_id || g.world.worldName || "world",
    checksum: ck,
    generated_at: nowIso(),
    affinities: affOut,
    hook_placements: hooksOut
  };

  ensureDir("index");
  fs.writeFileSync("schemas/link_suggestions.schema.json", fs.readFileSync("schemas/link_suggestions.schema.json")); // ensures file exists at runtime
  fs.writeFileSync("index/link_suggestions.json", JSON.stringify(outDoc, null, 2), "utf8");
  console.log(`Link suggestions → index/link_suggestions.json  (affinities=${affOut.length}, hooks=${hooksOut.length})`);
}

main();
