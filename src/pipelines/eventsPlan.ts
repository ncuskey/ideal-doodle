// src/pipelines/eventsPlan.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import { client, withRateLimitRetry } from "../gen/openaiClient";

type J = any;
const readJson = <T=any>(p: string): T | null => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const writeJson = (p: string, v: any) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2), "utf8"); };

function list(dir: string) { return fs.existsSync(dir) ? fs.readdirSync(dir) : []; }
const nowIso = () => new Date().toISOString();

function loadCtx() {
  const world = readJson<J>("canon/world/outline.json") || {};
  const interstate = readJson<J>("canon/interstate/outline.json") || {};
  const stateOut = new Map<number,J>();
  if (fs.existsSync("canon/state")) {
    for (const f of list("canon/state").filter(x=>x.endsWith(".json"))) {
      const j = readJson<J>(path.join("canon/state", f)); if (!j) continue;
      const id = j.state_id ?? parseInt(f,10); stateOut.set(Number(id), j);
    }
  }
  const burgOut = new Map<number,J>();
  if (fs.existsSync("canon/burg")) {
    for (const f of list("canon/burg").filter(x=>x.endsWith(".json"))) {
      const j = readJson<J>(path.join("canon/burg", f)); if (!j) continue;
      const id = j.burg_id ?? parseInt(f,10); burgOut.set(Number(id), j);
    }
  }
  return { world, interstate, stateOut, burgOut };
}

function buildPrompt(action: J, ctx: ReturnType<typeof loadCtx>) {
  const loc = action.location || {};
  const burg = loc.type === "burg" ? ctx.burgOut.get(Number(loc.id)) : undefined;
  const state = loc.type === "state" ? ctx.stateOut.get(Number(loc.id)) :
               burg ? ctx.stateOut.get(Number(burg.state_id)) : undefined;

  const sys = [
    "You are a world-state planner. Output MUST be a compact JSON matching the schema.",
    "Propose EFFECTS (numbers/flags only) — no prose — that are plausible and bounded by the context.",
    "Use small magnitudes unless magnitude=high."
  ].join(" ");

  const text = [
    `Player Action: ${JSON.stringify(action)}`,
    "",
    "World hints:",
    JSON.stringify({ eras: (ctx.world.eras||[]).map((e:any)=>({name:e.name, start:e.start_ybp, end:e.end_ybp})),
                    tech_magic: ctx.world.tech_magic || {} }),
    "",
    "State hints:",
    JSON.stringify({ state: state ? { id: state.state_id, name: state.name, economy: state.economy_pillars, culture: state.culture, religion: state.religion } : null }),
    "",
    "Burg hints:",
    JSON.stringify(burg ? { id: burg.burg_id, name: burg.name, tags: burg.tags, economy_roles: burg.economy_roles, problems: burg.problems } : null),
    "",
    "Effects you may use:",
    "- population_delta (target burg/province/state) with delta in [-0.15, +0.15]",
    "- infrastructure (assets_destroyed at burg level)",
    "- economy (trade_throughput_delta at burg OR state level: [-0.4, +0.4])",
    "- migration (refugees integer ±, direction in/out, target province or state)",
    "- reputation (state + faction string, delta in [-50,+50])",
    "- law_enforcement (state, status, duration_days)",
    "- morale/environment (short deltas if applicable)",
    "- quest_graph (ops: open/close/replace/advance/branch/spawn_hook; respect chain_id/quest ids if present)",
    "",
    "Do not invent new global lore. Keep it local unless justified by magnitude."
  ].join("\n");

  return { sys, user: { role: "user", content: [{ type: "text", text }] as const } };
}

async function main() {
  // Choose actions: --id=<action_id> (without .json) OR plan all in events/player/*.json
  const args = new Map<string,string>();
  for (const a of process.argv.slice(2)) { const [k,v="true"] = a.replace(/^--/,"").split("="); args.set(k, v); }
  const pickId = args.get("id");

  const actions: Array<{ id: string; body: J }> = [];
  if (pickId) {
    const p = `events/player/${pickId}.json`;
    const j = readJson<J>(p);
    if (!j) { console.error(`Action not found: ${p}`); process.exit(2); }
    actions.push({ id: pickId, body: j });
  } else {
    for (const f of list("events/player").filter(x=>x.endsWith(".json"))) {
      const id = path.basename(f, ".json");
      const j = readJson<J>(path.join("events/player", f)); if (!j) continue;
      actions.push({ id, body: j });
    }
  }
  if (!actions.length) { console.error("No actions found in events/player/*.json"); process.exit(2); }

  const ctx = loadCtx();
  const schema = readJson<J>("schemas/effects_bundle.schema.json");

  for (const a of actions) {
    const { sys, user } = buildPrompt(a.body, ctx);
    const model = process.env.LORE_OUTLINE_MODEL || "gpt-5-mini";

    const res = await withRateLimitRetry(() =>
      client.chat.completions.create({
        model,
        messages: [{ role: "system", content: sys }, user],
        response_format: { type: "json_schema", json_schema: { name: "effects_bundle", schema } }
      })
    );

    // Parse the JSON content from the chat completion response
    const content = res.choices[0]?.message?.content;
    if (!content) throw new Error("No JSON content from model");
    const parsed = JSON.parse(content);

    const outPath = `index/effects/proposed/${a.id}.json`;
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    writeJson(outPath, { ...parsed, generated_at: nowIso() });
    console.log(`Proposed effects → ${outPath}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
