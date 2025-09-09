// src/pipelines/hooksAccept.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

type J = any;
const readJson = <T=any>(p: string): T | null => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const writeJson = (p: string, v: any) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2), "utf8"); };

function checksumString(s: string): string { let h = 2166136261>>>0; for (let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0;} return `fnv1a_${h.toString(16)}`; }
const nowIso = () => new Date().toISOString();

function loadHookTemplates() {
  const dir = "canon/quests/hooks";
  const map = new Map<string, any>(); // hook_template_id -> template JSON (w/ chain_id)
  if (!fs.existsSync(dir)) return map;
  for (const f of fs.readdirSync(dir).filter(f=>f.endsWith(".json"))) {
    const j = readJson<J>(path.join(dir, f));
    if (!j?.hook_template_id) continue;
    map.set(String(j.hook_template_id), j);
  }
  return map;
}

function main() {
  const suggestions = readJson<J>("index/link_suggestions.json");
  if (!suggestions?.hook_placements?.length) {
    console.error("No hook placements found. Run: npm run links:suggest");
    process.exit(2);
  }
  const templates = loadHookTemplates();
  if (!templates.size) {
    console.error("No hook templates found in canon/quests/hooks. Add templates before accepting.");
    process.exit(2);
  }

  // CLI options
  const args = new Map<string,string>();
  for (const a of process.argv.slice(2)) { const [k,v="true"] = a.replace(/^--/,"").split("="); args.set(k, v); }
  const pick = args.get("sugg");            // comma-separated sugg_ids to accept
  const acceptAll = args.has("all");
  const minScore = Number(args.get("minScore") ?? "0.7"); // default threshold
  const limit = Number(args.get("limit") ?? "50");

  const byId = new Map<string, any>();
  for (const s of suggestions.hook_placements) byId.set(String(s.sugg_id), s);

  let selected: any[] = [];
  if (pick) {
    for (const id of pick.split(",").map(s=>s.trim()).filter(Boolean)) {
      const s = byId.get(id);
      if (s) selected.push(s);
      else console.warn(`Suggestion not found: ${id}`);
    }
  } else if (acceptAll) {
    selected = suggestions.hook_placements
      .filter((s:any)=> typeof s.score === "number" ? s.score >= minScore : true)
      .slice(0, limit);
  } else {
    console.error("Usage: npm run hooks:accept -- --sugg=<id,id,...>  OR  --all --minScore=0.7 --limit=50");
    process.exit(2);
  }

  if (!selected.length) {
    console.error("No suggestions selected.");
    process.exit(2);
  }

  // State files
  const stateHooksPath = "state/hooks_available.json";
  const stateHooks = readJson<J>(stateHooksPath) || { items: [] as any[], updated_at: nowIso() };

  let created = 0;
  for (const s of selected) {
    const tpl = templates.get(String(s.hook_template_id));
    if (!tpl) { console.warn(`Template not found for suggestion ${s.sugg_id}: ${s.hook_template_id}`); continue; }
    const chain_id = String(tpl.chain_id || "chain_generic");
    const burg_id = Number(s.burg_id);
    const state_id = Number(s.state_id || 0);

    // Deterministic instance id from (chain, template, burg, sugg_id)
    const hook_instance_id = `hookinst_${checksumString(`${chain_id}:${s.hook_template_id}:${burg_id}:${s.sugg_id}`)}`;

    // Skip if already created
    const existing = stateHooks.items.find((x:any)=>x.hook_instance_id === hook_instance_id);
    if (existing) continue;

    // Materialize file for the burg
    const matPath = path.join("canon/hooks/materialized", String(burg_id), `${hook_instance_id}.json`);
    const doc = {
      hook_instance_id,
      chain_id,
      hook_template_id: String(s.hook_template_id),
      burg_id,
      state_id,
      status: "available",
      created_at: nowIso(),
      rationale: String(s.rationale || ""),
      source_suggestion_id: String(s.sugg_id || "")
    };

    // Ensure schema exists and write
    if (!fs.existsSync("schemas/hook_instance.schema.json")) {
      console.warn("schemas/hook_instance.schema.json not found (writing anyway).");
    }
    writeJson(matPath, doc);

    // Add to state
    stateHooks.items.push(doc);
    created++;
  }

  stateHooks.updated_at = nowIso();
  writeJson(stateHooksPath, stateHooks);

  console.log(`Accepted ${created} hook instance(s). Materialized under canon/hooks/materialized/{burg_id}/... and indexed in ${stateHooksPath}`);
}

main();
