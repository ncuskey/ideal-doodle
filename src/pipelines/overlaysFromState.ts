// src/pipelines/overlaysFromState.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

type J = any;
const readJson = <T=any>(p:string):T|null=>{try{return JSON.parse(fs.readFileSync(p,"utf8"));}catch{return null;}};
const writeJson = (p:string,v:any)=>{fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p, JSON.stringify(v,null,2),"utf8");};
const nowIso = ()=>new Date().toISOString();
function clamp(n:number,lo:number,hi:number){return Math.min(hi, Math.max(lo, n));}

function main() {
  const dirty = readJson<J>("index/dirty.json") || { burgs: [], states: [] };
  const ws = readJson<J>("state/world_state.json") || {};
  const hooksAvail = readJson<J>("state/hooks_available.json") || { items: [] };

  const popDelta = ws.burg_population_delta || {};
  const tradeDelta = ws.state_trade_delta || {};
  const law = ws.law_enforcement || {};
  const reputations = ws.reputations || {};

  let wroteB=0, wroteS=0;

  // --- Burg overlays
  for (const burgId of new Set<number>(dirty.burgs || [])) {
    const bo = readJson<J>(`canon/burg/${burgId}.outline.json`); if (!bo) continue;
    const stateId = Number(bo.state_id || 0);
    const overlay = {
      burg_id: Number(burgId),
      state_id: stateId,
      population_multiplier: 1 + clamp(Number(popDelta[String(burgId)] || 0), -0.9, 0.9),
      state_trade_multiplier: 1 + clamp(Number(tradeDelta[String(stateId)] || 0), -0.9, 0.9),
      assets_destroyed: (ws.assets_destroyed || {})[String(burgId)] || [],
      law_enforcement: law[String(stateId)] || { status: "none", until: null },
      hooks_active: (hooksAvail.items || []).filter((h:any)=>h.burg_id===Number(burgId) && h.status==="active").map((h:any)=>({
        hook_instance_id: h.hook_instance_id, chain_id: h.chain_id, hook_template_id: h.hook_template_id, rationale: h.rationale || ""
      })),
      notes: [],
      generated_at: nowIso()
    };
    writeJson(`lore/overlays/burg/${burgId}.overlay.json`, overlay);
    wroteB++;
  }

  // --- State overlays
  function repArrayFor(stateId:number){
    const out: Array<{faction:string, score:number}> = [];
    for (const k of Object.keys(reputations)) {
      const [sid, faction] = k.split(":");
      if (Number(sid) === stateId) out.push({ faction, score: Number(reputations[k]) });
    }
    return out;
  }

  for (const stateId of new Set<number>(dirty.states || [])) {
    const so = readJson<J>(`canon/state/${stateId}.outline.json`); if (!so) continue;
    const overlay = {
      state_id: Number(stateId),
      trade_multiplier: 1 + clamp(Number(tradeDelta[String(stateId)] || 0), -0.9, 0.9),
      law_enforcement: law[String(stateId)] || { status: "none", until: null },
      reputations: repArrayFor(Number(stateId)),
      generated_at: nowIso()
    };
    writeJson(`lore/overlays/state/${stateId}.overlay.json`, overlay);
    wroteS++;
  }

  console.log(`Overlays built → burg=${wroteB}, state=${wroteS}`);
}

main();
