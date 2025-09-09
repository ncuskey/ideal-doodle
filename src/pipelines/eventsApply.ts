// src/pipelines/eventsApply.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

type J = any;
const readJson = <T=any>(p: string): T | null => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const writeJson = (p: string, v: any) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2), "utf8"); };
const nowIso = () => new Date().toISOString();

function clamp(n:number, lo:number, hi:number) { return Math.min(hi, Math.max(lo, n)); }

function markDirty(targets: { burgs?: number[]; states?: number[] }) {
  const p = "index/dirty.json";
  const cur = readJson<J>(p) || { burgs: [], states: [], updated_at: nowIso() };
  const setB = new Set<number>(cur.burgs || []);
  const setS = new Set<number>(cur.states || []);
  for (const b of (targets.burgs || [])) setB.add(b);
  for (const s of (targets.states || [])) setS.add(s);
  writeJson(p, { burgs: [...setB], states: [...setS], updated_at: nowIso() });
}

function loadHookTemplates() {
  const dir = "canon/quests/hooks";
  const map = new Map<string, any>();
  if (!fs.existsSync(dir)) return map;
  for (const f of fs.readdirSync(dir).filter(f=>f.endsWith(".json"))) {
    const j = readJson<J>(path.join(dir, f));
    if (j?.hook_template_id) map.set(String(j.hook_template_id), j);
  }
  return map;
}

function ensureState() {
  const ws = readJson<J>("state/world_state.json") || {
    burg_population_delta: {}, // burgId -> fraction
    state_trade_delta: {},     // stateId -> fraction
    assets_destroyed: {},      // burgId -> string[]
    reputations: {},           // `${stateId}:${faction}` -> number
    law_enforcement: {},       // stateId -> { status, until }
    updated_at: nowIso()
  };
  const hooksAvail = readJson<J>("state/hooks_available.json") || { items: [], updated_at: nowIso() };
  const questsActive = readJson<J>("state/quests_active.json") || { chains: {}, updated_at: nowIso() };
  return { ws, hooksAvail, questsActive };
}

function spawnHookInstance(hooksAvail:J, tplMap:Map<string,any>, hook_template_id:string, burg_id:number, rationale?:string) {
  const tpl = tplMap.get(hook_template_id);
  if (!tpl) { console.warn(`spawn_hook: template not found: ${hook_template_id}`); return null; }
  const chain_id = String(tpl.chain_id || "chain_generic");
  const suggKey = `${chain_id}:${hook_template_id}:${burg_id}:${rationale||""}`;
  // tiny deterministic id
  let h = 2166136261>>>0; for (const ch of suggKey) { h^=ch.charCodeAt(0); h=Math.imul(h,16777619)>>>0; }
  const hook_instance_id = `hookinst_${h.toString(16)}`;
  if (hooksAvail.items.find((x:any)=>x.hook_instance_id===hook_instance_id)) return hook_instance_id;

  const state_id = (() => {
    const bo = readJson<J>(`canon/burg/${burg_id}.outline.json`);
    return Number(bo?.state_id ?? 0);
  })();

  const doc = {
    hook_instance_id, chain_id,
    hook_template_id, burg_id, state_id,
    status: "available",
    created_at: nowIso(),
    rationale: rationale || "spawned_by_event",
    source_suggestion_id: "event"
  };
  hooksAvail.items.push(doc);
  return hook_instance_id;
}

function applyQuestOps(ops:J[], hooksAvail:J, questsActive:J, tplMap:Map<string,any>, affectedBurgs:Set<number>) {
  for (const op of ops) {
    const kind = String(op.op);
    if (kind === "spawn_hook" && op.hook_template_id && Number.isFinite(op.burg_id)) {
      const id = spawnHookInstance(hooksAvail, tplMap, String(op.hook_template_id), Number(op.burg_id), op.rationale);
      if (id) affectedBurgs.add(Number(op.burg_id));
      continue;
    }
    // For open/close/advance/branch/replace: record against the active chain, but keep it simple.
    // We don't model full graphs here—just store per-chain step/op log.
    const chain_id = String(op.chain_id || "chain_generic");
    const rec = questsActive.chains[chain_id] || { active: true, step: "entry", ops: [] as J[], updated_at: nowIso() };
    if (!rec.ops) rec.ops = [];
    rec.ops.push(op);
    rec.updated_at = nowIso();
    questsActive.chains[chain_id] = rec;
  }
}

function main() {
  // Args: --id=<action_id> (without .json)
  const args = new Map<string,string>();
  for (const a of process.argv.slice(2)) { const [k,v="true"] = a.replace(/^--/,"").split("="); args.set(k, v); }
  const id = args.get("id");
  if (!id) { console.error("Usage: npm run events:apply -- --id=<action_id>"); process.exit(2); }

  const action = readJson<J>(`events/player/${id}.json`);
  const bundle = readJson<J>(`index/effects/proposed/${id}.json`);
  if (!action || !bundle) { console.error("Missing action or proposed effects. Run events:plan first."); process.exit(2); }

  const { ws, hooksAvail, questsActive } = ensureState();
  const tplMap = loadHookTemplates();

  const inverse: J[] = [];
  const affectedBurgs = new Set<number>();
  const affectedStates = new Set<number>();

  for (const e of (bundle.effects || [])) {
    const t = String(e.type);
    // Normalize targets - handle both schema formats
    const burgId = Number(e.target?.burg ?? (e.target_type === "burg" ? e.target_id : NaN));
    const stateId = Number(e.target?.state ?? (e.target_type === "state" ? e.target_id : (Number.isFinite(burgId) ? readJson<J>(`canon/burg/${burgId}.outline.json`)?.state_id : NaN)));
    if (Number.isFinite(burgId)) affectedBurgs.add(burgId);
    if (Number.isFinite(stateId)) affectedStates.add(stateId);

    if (t === "population_delta" && Number.isFinite(burgId)) {
      const d = clamp(Number(e.delta ?? 0), -0.15, 0.15);
      const key = String(burgId);
      const prior = Number(ws.burg_population_delta[key] ?? 0);
      ws.burg_population_delta[key] = clamp(prior + d, -0.9, 0.9);
      inverse.push({ type:"population_delta", target:{ burg: burgId }, delta: -d });
      continue;
    }

    if (t === "infrastructure" && Number.isFinite(burgId)) {
      const key = String(burgId);
      const arr = new Set<string>(ws.assets_destroyed[key] || []);
      for (const a of (e.assets_destroyed || [])) arr.add(String(a));
      ws.assets_destroyed[key] = [...arr];
      inverse.push({ type:"infrastructure", target:{ burg: burgId }, assets_destroyed: [] }); // inverse is non-lossy noop
      continue;
    }

    if (t === "economy") {
      const d = clamp(Number(e.trade_throughput_delta ?? 0), -0.4, 0.4);
      if (Number.isFinite(stateId)) {
        const key = String(stateId);
        const prior = Number(ws.state_trade_delta[key] ?? 0);
        ws.state_trade_delta[key] = clamp(prior + d, -0.9, 0.9);
        inverse.push({ type:"economy", target:{ state: stateId }, trade_throughput_delta: -d });
      }
      continue;
    }

    if (t === "migration") {
      // Keep as a ledger entry under world_state; no complex counters yet.
      const key = "migrations";
      const refugees = Number(e.refugees || e.count || 0);
      const direction = String(e.direction || "out");
      const target = e.target || { burg: e.from_burg_id, state: e.to_state_id };
      const entry = { t: nowIso(), target, refugees, direction };
      const list = Array.isArray(ws[key]) ? ws[key] : (ws[key] = []);
      list.push(entry);
      inverse.push({ type:"migration", target, refugees: -refugees, direction: direction === "out" ? "in" : "out" });
      continue;
    }

    if (t === "reputation" && Number.isFinite(stateId) && e.faction) {
      const key = `${stateId}:${String(e.faction)}`;
      const prior = Number(ws.reputations[key] ?? 0);
      const d = clamp(Number(e.delta ?? 0), -50, 50);
      ws.reputations[key] = clamp(prior + d, -100, 100);
      inverse.push({ type:"reputation", target:{ state: stateId, faction: e.faction }, delta: -d });
      continue;
    }

    if (t === "law_enforcement" && Number.isFinite(stateId)) {
      const status = String(e.status || "none");
      // Map LLM statuses to schema enum values
      const mappedStatus = status === "investigation" ? "martial_law_local" : 
                          status === "curfew" ? "curfew" : "none";
      const until = new Date(Date.now() + 1000 * 60 * 60 * 24 * Number(e.duration_days || 7)).toISOString();
      ws.law_enforcement[String(stateId)] = { status: mappedStatus, until };
      inverse.push({ type:"law_enforcement", target:{ state: stateId }, status:"none", duration_days:0 });
      continue;
    }

    if (t === "quest_graph") {
      // Handle both array of ops and single op formats
      const ops = Array.isArray(e.ops) ? e.ops : [e];
      applyQuestOps(ops, hooksAvail, questsActive, tplMap, affectedBurgs);
      inverse.push({ type:"quest_graph", ops: [] }); // inverse handled by rollback manually if needed
      continue;
    }

    // Unknown type → skip
    console.warn("Unknown effect type, skipped:", t);
  }

  ws.updated_at = nowIso();
  hooksAvail.updated_at = nowIso();
  questsActive.updated_at = nowIso();

  writeJson("state/world_state.json", ws);
  writeJson("state/hooks_available.json", hooksAvail);
  writeJson("state/quests_active.json", questsActive);

  // Record applied event with inverse for rollback
  const appliedDoc = {
    action_id: bundle.action_id,
    applied_at: nowIso(),
    effects: bundle.effects,
    inverse,
    affected: { burgs: [...affectedBurgs], states: [...affectedStates] }
  };
  const appliedPath = `canon/events/applied/${bundle.action_id}.json`;
  writeJson(appliedPath, appliedDoc);

  markDirty({ burgs: [...affectedBurgs], states: [...affectedStates] });

  console.log(`Applied effects for ${bundle.action_id}. Dirty: burgs=${affectedBurgs.size}, states=${affectedStates.size}`);
}

main();
