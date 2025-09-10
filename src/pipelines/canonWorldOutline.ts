// src/pipelines/canonWorldOutline.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import { openai, withRateLimitRetry } from "../gen/openaiClient";

// ===== Helpers =====
const readJson = <T=any>(p: string): T | null => {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
};
const listJsonFiles = (dir: string) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith(".json")).map(f => path.join(dir, f)) : [];

const ensureDir = (dir: string) => fs.mkdirSync(dir, { recursive: true });

function checksumString(s: string): string {
  // tiny non-crypto hash (good enough for regen guard at outline stage)
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return `fnv1a_${h.toString(16)}`;
}

function nowIsoLocal() {
  return new Date().toISOString();
}

// ===== Gather minimal world context from facts =====
function gatherWorldContext() {
  const factsWorld1 = readJson<any>("facts/world/1.json") || readJson<any>("facts/world.json");
  const stateFiles =
    listJsonFiles("facts/derived/state").length ? listJsonFiles("facts/derived/state") :
    listJsonFiles("facts/state");

  const states = stateFiles
    .map(p => ({ p, j: readJson<any>(p) }))
    .map(({ p, j }) => {
      const name = j?.name || j?.Name || j?.stateName || path.basename(p, ".json");
      const id = j?.id ?? j?.Id ?? parseInt(path.basename(p, ".json"), 10);
      const coastal = !!(j?.coastal ?? j?.hasCoast ?? false);
      const pop = j?.population ?? j?.pop ?? undefined;
      return { id, name, coastal, pop };
    });

  const burgFiles =
    listJsonFiles("facts/derived/burg").length ? listJsonFiles("facts/derived/burg") :
    listJsonFiles("facts/burg");
  const burgCount = burgFiles.length;

  const worldName = factsWorld1?.name || factsWorld1?.worldName || "world";
  const world_id = `world_${worldName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;

  return { world_id, worldName, states, burgCount, factsWorld1 };
}

// ===== Prompt builder (outline, NOT prose) =====
function buildPrompt(ctx: ReturnType<typeof gatherWorldContext>) {
  const topStates = ctx.states.slice(0, 12).map(s => s.name).filter(Boolean);
  const coastalCount = ctx.states.filter(s => s.coastal).length;

  const sys = [
    "You are worldbuilding as a structured planner.",
    "Output MUST satisfy the provided JSON Schema exactly.",
    "Be concise, list-oriented, no flowery prose. Avoid inventing granular proper nouns beyond families/buckets.",
    "Limit eras to 3–6. Limit global threats to ≤5. Use hints when uncertain."
  ].join(" ");

  const user = {
    role: "user" as const,
    content: `Build a WORLD CANON OUTLINE (not full lore) for the map.

World facts (minimal):
- World name: ${ctx.worldName}
- States: ${ctx.states.length} total; sample names: ${topStates.join(", ") || "(no names found)"}
- Coastal states (approx): ${coastalCount}/${ctx.states.length}
- Burgs (approx): ${ctx.burgCount}

Requirements:
- Produce eras with coarse dates in YBP (years before present), descending.
- Civilization buckets: 3–6 culture macro-groups with 2–4 trait bullets each; include optional member_states_hint by name when possible.
- Religion families and language families: 3–6 each, short labels.
- Tech/magic baseline: one sentence baseline plus 3–6 constraint bullets.
- Trade lanes skeleton: 3–7 lanes; mode = sea/river/land/mixed; hubs_hint are short labels, not coordinates.
- Global threats: up to 5, succinct.
- Notes: any constraints the lower layers must inherit (e.g., banned magics, calendar).
- Do NOT write prose paragraphs. Lists only. Use safe placeholders when fact is unknown.

Schema is attached via response_format.`
  };

  return { sys, user };
}

// ===== Main =====
async function main() {
  const ctx = gatherWorldContext();
  const inputFingerprint = checksumString(JSON.stringify({ world_id: ctx.world_id, states: ctx.states.map(s => s.name), burgs: ctx.burgCount }));
  const outDir = "canon/world";
  const outPath = path.join(outDir, "outline.json");
  ensureDir(outDir);

  // If existing file matches checksum, short-circuit (cheap guard)
  const existing = readJson<any>(outPath);
  if (existing?.checksum === inputFingerprint && !process.argv.includes("--force")) {
    console.log("No changes; skip.");
    return;
  }

  const schema = readJson<any>("schemas/world_canon_outline.schema.json");
  if (!schema) {
    console.error("Missing schemas/world_canon_outline.schema.json");
    process.exit(2);
  }

  const { sys, user } = buildPrompt(ctx);
  const model = process.env.LORE_OUTLINE_MODEL || "gpt-5-mini";

  const res = await withRateLimitRetry(() =>
    openai.chat.completions.create({
      model,
      messages: [
        { role: "system" as const, content: sys },
        user
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "world_canon_outline",
          schema
        }
      }
    })
  );

  // Parse the JSON content from the chat completion response
  const content = res.choices[0]?.message?.content;
  if (!content) throw new Error("No JSON content from model");
  const parsed = JSON.parse(content);
  const doc = {
    ...parsed,
    world_id: parsed.world_id || ctx.world_id,
    checksum: inputFingerprint,
    generated_at: nowIsoLocal()
  };

  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2), "utf8");
  console.log(`World canon outline → ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
