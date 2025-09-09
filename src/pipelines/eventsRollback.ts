// src/pipelines/eventsRollback.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

type J = any;
const readJson = <T=any>(p: string): T | null => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const writeJson = (p: string, v: any) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2), "utf8"); };
const nowIso = () => new Date().toISOString();
function clamp(n:number, lo:number, hi:number) { return Math.min(hi, Math.max(lo, n)); }

function ensureState() {
  const ws = readJson<J>("state/world_state.json") || { burg_population_delta:{}, state_trade_delta:{}, assets_destroyed:{}, reputations:{}, law_enforcement:{}, updated_at: nowIso() };
  const hooksAvail = readJson<J>("state/hooks_available.json") || { items: [], updated_at: nowIso() };
  const questsActive = readJson<J>("state/quests_active.json") || { chains: {}, updated_at: nowIso() };
  return { ws, hooksAvail, questsActive };
}

function main() {
  // Args: --id=<action_id>
  const args = new Map<string,string>();
  for (const a of process.argv.slice(2)) { const [k,v="true"] = a.replace(/^--/,"").split("="); args.set(k, v); }
  const id = args.get("id");
  if (!id) { console.error("Usage: npm run events:rollback -- --id=<action_id>"); process.exit(2); }

  const applied = readJson<J>(`canon/events/applied/${id}.json`);
  if (!applied) { console.error("Applied record not found."); process.exit(2); }

  const { ws, hooksAvail, questsActive } = ensureState();

  for (const e of (applied.inverse || [])) {
    const t = String(e.type);
    const burgId = Number(e.target?.burg ?? NaN);
    const stateId = Number(e.target?.state ?? NaN);

    if (t === "population_delta" && Number.isFinite(burgId)) {
      const key = String(burgId);
      const prior = Number(ws.burg_population_delta[key] ?? 0);
      ws.burg_population_delta[key] = clamp(prior + Number(e.delta||0), -0.9, 0.9);
      continue;
    }
    if (t === "economy" && Number.isFinite(stateId)) {
      const key = String(stateId);
      const prior = Number(ws.state_trade_delta[key] ?? 0);
      ws.state_trade_delta[key] = clamp(prior + Number(e.trade_throughput_delta||0), -0.9, 0.9);
      continue;
    }
    if (t === "reputation" && Number.isFinite(stateId) && e.faction) {
      const key = `${stateId}:${String(e.faction)}`;
      const prior = Number(ws.reputations[key] ?? 0);
      ws.reputations[key] = clamp(prior + Number(e.delta||0), -100, 100);
      continue;
    }
    if (t === "law_enforcement" && Number.isFinite(stateId)) {
      ws.law_enforcement[String(stateId)] = { status: "none", until: nowIso() };
      continue;
    }
    // For infrastructure/migration/quest_graph we don't attempt to restore exact prior lists
  }

  ws.updated_at = nowIso();
  writeJson("state/world_state.json", ws);
  writeJson("state/hooks_available.json", hooksAvail);
  writeJson("state/quests_active.json", questsActive);

  // Archive the applied file
  const arch = `canon/events/applied/_rolledback_${id}.json`;
  fs.renameSync(`canon/events/applied/${id}.json`, arch);
  console.log(`Rolled back ${id}. Archived applied record to ${arch}`);
}

main();
