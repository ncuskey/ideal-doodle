// src/pipelines/canonInterstateOutline.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import { openai, withRateLimitRetry } from "../gen/openaiClient";

const readJson = <T=any>(p: string): T | null => {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
};
const listJsonFiles = (dir: string) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith(".json")).map(f => path.join(dir, f)) : [];
const ensureDir = (dir: string) => fs.mkdirSync(dir, { recursive: true });

function checksumString(s: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return `fnv1a_${h.toString(16)}`;
}

function nowIso() { return new Date().toISOString(); }

function gather() {
  const world = readJson<any>("canon/world/outline.json");
  const stateFiles =
    listJsonFiles("facts/derived/state").length ? listJsonFiles("facts/derived/state") :
    listJsonFiles("facts/state");

  const states = stateFiles.map(p => {
    const j = readJson<any>(p);
    const id = j?.id ?? parseInt(path.basename(p, ".json"), 10);
    const name = j?.name || j?.Name || j?.stateName || `State_${id}`;
    const coastal = !!(j?.coastal ?? j?.hasCoast ?? false);
    const pop = j?.population ?? j?.pop ?? undefined;
    return { id, name, coastal, pop };
  });

  return { world, states };
}

function buildPrompt(g: ReturnType<typeof gather>) {
  const worldName = g.world?.world_id || g.world?.worldName || "world";
  const mapLines = g.states.map(s => `${s.id}: ${s.name}${s.coastal ? " (coastal)" : ""}${s.pop ? `, pop~${s.pop}` : ""}`);

  const system = [
    "You are creating a concise INTER-STATE OUTLINE.",
    "Output MUST satisfy the JSON Schema. Use LISTS, not prose.",
    "Refer to states by their NUMERIC id from the mapping. Avoid inventing new proper nouns beyond labels for relations."
  ].join(" ");

  const text = [
    `World: ${worldName}`,
    "",
    "State ID → Name (hints):",
    ...mapLines,
    "",
    "Produce:",
    "- alliances (2–6), wars_conflicts (2–6), treaties (2–6), migrations (1–6), trade_blocs (1–4), border_changes (2–6), cross_state_themes (3–8), notes (2–6).",
    "- Use coarse dating with YBP where applicable; keep summaries to one sentence.",
    "- Prefer plausible coastal vs inland dynamics for trade and wars.",
    "- If uncertain about adjacency, keep relations plausible and generic (no hard geography claims).",
    "- Keep output tight; no paragraphs."
  ].join("\n");

  return {
    sys: system,
    user: { role: "user" as const, content: text }
  };
}

async function main() {
  const g = gather();
  if (!g.world) {
    console.error("Missing canon/world/outline.json — run: npm run canon:world:outline");
    process.exit(2);
  }

  const fingerprint = checksumString(JSON.stringify({
    world_id: g.world.world_id || "world",
    state_ids: g.states.map(s => s.id)
  }));

  const outDir = "canon/interstate";
  const outPath = path.join(outDir, "outline.json");
  ensureDir(outDir);

  const existing = readJson<any>(outPath);
  const forced = process.argv.includes("--force") || process.env.FORCE_REGEN === "1";
  if (existing?.checksum === fingerprint && !forced) {
    console.log("No changes; skip.");
    return;
  }

  const schema = readJson<any>("schemas/interstate_outline.schema.json");
  if (!schema) {
    console.error("Missing schemas/interstate_outline.schema.json");
    process.exit(2);
  }

  const { sys, user } = buildPrompt(g);
  const model = process.env.LORE_OUTLINE_MODEL || "gpt-5-mini";

  const res = await withRateLimitRetry(() =>
    openai.chat.completions.create({
      model,
        messages: [{ role: "system" as const, content: sys }, user],
      response_format: {
        type: "json_schema",
        json_schema: { name: "interstate_outline", schema }
      }
    })
  );

  // Parse the JSON content from the chat completion response
  const content = res.choices[0]?.message?.content;
  if (!content) throw new Error("No JSON content from model");
  const parsed = JSON.parse(content);
  
  const doc = {
    ...parsed,
    world_id: g.world.world_id || g.world.worldName || "world",
    checksum: fingerprint,
    generated_at: nowIso()
  };

  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2), "utf8");
  console.log(`Inter-state outline → ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
