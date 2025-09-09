// src/pipelines/canonStateOutline.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import pLimit from "p-limit";
import { client, withRateLimitRetry } from "../gen/openaiClient";

type Json = any;
const readJson = <T=any>(p: string): T | null => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const listJsonFiles = (dir: string) => fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith(".json")).map(f => path.join(dir, f)) : [];
const ensureDir = (d: string) => fs.mkdirSync(d, { recursive: true });

function checksumString(s: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return `fnv1a_${h.toString(16)}`;
}
const nowIso = () => new Date().toISOString();

function gatherBasics() {
  const world = readJson<Json>("canon/world/outline.json");
  const interstate = readJson<Json>("canon/interstate/outline.json");

  const stateFiles =
    listJsonFiles("facts/derived/state").length ? listJsonFiles("facts/derived/state") :
    listJsonFiles("facts/state");

  const states = stateFiles.map(p => {
    const j = readJson<Json>(p);
    const id = j?.id ?? parseInt(path.basename(p, ".json"), 10);
    const name = j?.name || j?.Name || j?.stateName || `State_${id}`;
    const coastal = !!(j?.coastal ?? j?.hasCoast ?? false);
    const pop = j?.population ?? j?.pop ?? undefined;
    return { id, name, coastal, pop, path: p };
  });

  return { world, interstate, states };
}

function buildPromptForState(g: ReturnType<typeof gatherBasics>, s: {id:number;name:string;coastal:boolean;pop?:number}) {
  const world = g.world || {};
  const worldName = world.world_id || world.worldName || "world";
  const eras = (world.eras || []).map((e: any) => `${e.name} (${e.start_ybp}–${e.end_ybp} ybp)`).slice(0, 6);
  const langFamilies = (world.language_families || []).slice(0, 6);
  const relFamilies = (world.religion_families || []).slice(0, 6);
  const techBaseline = world.tech_magic?.baseline || "unspecified";
  const techConstraints = world.tech_magic?.constraints || [];
  const stateMap = g.states.map(st => `${st.id}: ${st.name}${st.coastal ? " (coastal)" : ""}`).join(", ");

  // find interstate refs that mention this state id
  function refsFrom(list: any[], type: string, idKey: string) {
    if (!Array.isArray(list)) return [];
    return list
      .filter((x: any) => Array.isArray(x.states) ? x.states.includes(s.id) : Array.isArray(x.states_involved) ? x.states_involved.includes(s.id) : false)
      .slice(0, 8)
      .map((x: any) => ({ type, id: x[idKey], label_hint: x.label || x.summary || type }));
  }
  const extRefs = [
    ...refsFrom(g.interstate?.alliances, "alliance", "rel_id"),
    ...refsFrom(g.interstate?.wars_conflicts, "war", "rel_id"),
    ...refsFrom(g.interstate?.treaties, "treaty", "rel_id"),
    ...refsFrom(g.interstate?.border_changes, "border_change", "ev_id"),
    ...(Array.isArray(g.interstate?.trade_blocs) ? g.interstate.trade_blocs.filter((b:any)=>Array.isArray(b.members)&&b.members.includes(s.id)).map((b:any)=>({type:"trade_bloc", id:b.bloc_id, label_hint:b.label})) : [])
  ].slice(0, 12);

  const sys = [
    "You are creating a concise STATE OUTLINE.",
    "Output MUST satisfy the JSON Schema. Use LISTS; no prose paragraphs.",
    "Reference world/interstate context; do not contradict it."
  ].join(" ");

  const text = [
    `World: ${worldName}`,
    `State target: ${s.id} - ${s.name} ${s.coastal ? "(coastal)" : ""}${s.pop ? `, pop~${s.pop}` : ""}`,
    "",
    "World context (hints):",
    `Eras: ${eras.join("; ") || "(n/a)"}`,
    `Language families: ${langFamilies.join(", ") || "(n/a)"}`,
    `Religion families: ${relFamilies.join(", ") || "(n/a)"}`,
    `Tech baseline: ${techBaseline}; constraints: ${techConstraints.join("; ") || "(n/a)"}`,
    "",
    `State map (ID→Name): ${stateMap}`,
    "",
    "Inter-state relations touching this state (refs only):",
    JSON.stringify(extRefs),
    "",
    "Produce the following fields per the schema:",
    "- timeline_beats: 3–7 items with optional YBP and refs_world_events (world-scale IDs if relevant)",
    "- factions: 3–6, short labels + influence_hint",
    "- economy_pillars: 3–6 keywords",
    "- culture: language_family + 3–6 trait bullets",
    "- religion: families_present (subset of world families); optionally dominant",
    "- regions: 3–7 labels with 0–3 tags each (e.g., coastal, highland, trade-hub)",
    "- external_relations_refs: copy the applicable refs above (no invention of new IDs here)",
    "- constraints: inherit world/interstate constraints that the state MUST respect",
    "- notes: anything lower layers must know",
    "",
    "Keep everything tight. No flowery text."
  ].join("\n");

  return {
    sys,
    user: { role: "user", content: [{ type: "text", text }] as const }
  };
}

async function generateOne(g: ReturnType<typeof gatherBasics>, s: {id:number;name:string;coastal:boolean;pop?:number}, force=false) {
  const outDir = "canon/state";
  ensureDir(outDir);
  const outPath = path.join(outDir, `${s.id}.outline.json`);

  const worldCk = g.world?.checksum || "";
  const interCk = g.interstate?.checksum || "";
  const fingerprint = checksumString(JSON.stringify([worldCk, interCk, s.id, s.name, s.coastal]));

  const existing = readJson<Json>(outPath);
  if (existing?.checksum === fingerprint && !force) {
    console.log(`No changes; skip state ${s.id}.`);
    return;
  }

  const schema = readJson<Json>("schemas/state_outline.schema.json");
  if (!schema) { throw new Error("Missing schemas/state_outline.schema.json"); }

  const { sys, user } = buildPromptForState(g, s);
  const model = process.env.LORE_OUTLINE_MODEL || "gpt-5-mini";

  const res = await withRateLimitRetry(() =>
    client.chat.completions.create({
      model,
      messages: [{ role: "system", content: sys }, user],
      response_format: { type: "json_schema", json_schema: { name: "state_outline", schema } }
    })
  );

  // Parse the JSON content from the chat completion response
  const content = res.choices[0]?.message?.content;
  if (!content) throw new Error("No JSON content from model");
  const parsed = JSON.parse(content);
  
  const doc = {
    ...parsed,
    world_id: g.world?.world_id || g.world?.worldName || "world",
    state_id: s.id,
    name: parsed.name || s.name,
    checksum: fingerprint,
    generated_at: nowIso()
  };

  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2), "utf8");
  console.log(`State outline → ${outPath}`);
}

async function main() {
  const g = gatherBasics();
  if (!g.world) { console.error("Run world outline first: npm run canon:world:outline"); process.exit(2); }
  if (!g.interstate) { console.error("Run interstate outline first: npm run canon:interstate:outline"); process.exit(2); }

  const force = process.argv.includes("--force") || process.env.FORCE_REGEN === "1";
  const argId = process.argv.find(a => a.startsWith("--id="))?.split("=")[1];
  const ids = argId ? [Number(argId)] : g.states.map(s => s.id);
  const idSet = new Set(ids);

  const targets = g.states.filter(s => idSet.has(s.id));
  const limit = pLimit(Number(process.env.OUTLINE_CONCURRENCY ?? 4));

  let i = 0, n = targets.length;
  await Promise.all(targets.map(st => limit(async () => {
    const idx = ++i;
    console.log(`state ${idx}/${n}`);
    try { await generateOne(g, st, force); }
    catch (e: any) { console.error(`State ${st.id} failed:`, e?.message || e); }
  })));
}

main().catch(e => { console.error(e); process.exit(1); });
