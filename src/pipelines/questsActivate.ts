// src/pipelines/questsActivate.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

type J = any;
const readJson = <T=any>(p: string): T | null => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const writeJson = (p: string, v: any) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2), "utf8"); };
const nowIso = () => new Date().toISOString();

function markDirty(targets: { burgs?: number[]; states?: number[] }) {
  const p = "index/dirty.json";
  const cur = readJson<J>(p) || { burgs: [], states: [], updated_at: nowIso() };
  const setB = new Set<number>(cur.burgs || []);
  const setS = new Set<number>(cur.states || []);
  for (const b of (targets.burgs || [])) setB.add(b);
  for (const s of (targets.states || [])) setS.add(s);
  const out = { burgs: [...setB], states: [...setS], updated_at: nowIso() };
  writeJson(p, out);
}

function main() {
  // Args
  const args = new Map<string,string>();
  for (const a of process.argv.slice(2)) { const [k,v="true"] = a.replace(/^--/,"").split("="); args.set(k, v); }
  const chainId = args.get("chain");
  const hookInst = args.get("hook");
  if (!chainId || !hookInst) {
    console.error("Usage: npm run quests:activate -- --chain=<chain_id> --hook=<hook_instance_id>");
    process.exit(2);
  }

  // Load state files
  const hooksStatePath = "state/hooks_available.json";
  const activeStatePath = "state/quests_active.json";
  const hooksState = readJson<J>(hooksStatePath) || { items: [] as any[], updated_at: nowIso() };
  const activeState = readJson<J>(activeStatePath) || { chains: {}, updated_at: nowIso() };

  // Find the activating hook
  const idx = hooksState.items.findIndex((x:any)=>x.hook_instance_id === hookInst);
  if (idx === -1) {
    console.error(`Hook instance not found: ${hookInst}`);
    process.exit(2);
  }
  const target = hooksState.items[idx];
  if (String(target.chain_id) !== String(chainId)) {
    console.error(`Chain mismatch: hook ${hookInst} belongs to ${target.chain_id}, not ${chainId}`);
    process.exit(2);
  }

  // Activate chain + suppress siblings
  const affectedBurgs = new Set<number>();
  target.status = "active";
  hooksState.items[idx] = target;
  affectedBurgs.add(Number(target.burg_id));

  for (const h of hooksState.items) {
    if (h.hook_instance_id === hookInst) continue;
    if (String(h.chain_id) === String(chainId) && h.status === "available") {
      h.status = "withdrawn";
      affectedBurgs.add(Number(h.burg_id));
    }
  }

  activeState.chains[chainId] = {
    active: true,
    entry_hook: hookInst,
    activated_at: nowIso(),
    step: "entry"
  };

  hooksState.updated_at = nowIso();
  activeState.updated_at = nowIso();

  // Write back
  writeJson(hooksStatePath, hooksState);
  writeJson(activeStatePath, activeState);

  // Event record (optional audit)
  const evPath = path.join("canon/events/quests", `activate_${chainId}_${hookInst}.json`);
  writeJson(evPath, {
    type: "quest_chain_activate",
    chain_id: chainId,
    hook_instance_id: hookInst,
    activated_at: nowIso(),
    affects: { burgs: [...affectedBurgs] }
  });

  // Dirty marks so downstream burg/regens can drop withdrawn hooks and add active content
  markDirty({ burgs: [...affectedBurgs] });

  console.log(`Activated chain ${chainId} via ${hookInst}. Withdrawn ${affectedBurgs.size - 1} sibling hook(s). Dirty marked affected burgs.`);
}

main();
