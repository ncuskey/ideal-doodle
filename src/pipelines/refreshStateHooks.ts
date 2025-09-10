import fs from "fs/promises";
import { generateStructured } from "../gen/structured.js";
import { SYSTEM_STATE } from "../gen/systemPrompts.js";
// Removed MODEL_CHEAP import - using environment variable instead
import { cacheKeyForEntity } from "../util/cacheKey.js";

type StateLore = {
  entity: { type: "state"; id: number|string };
  summary?: string;
  history?: string[];
  adventureHooks?: any[];
  hashOfInputs?: string;
  lastGeneratedAt?: string;
};

async function readJson(p:string){ return JSON.parse(await fs.readFile(p,"utf8")); }
async function writeJson(p:string, v:any){ await fs.writeFile(p, JSON.stringify(v, null, 2)); }

async function main() {
  const id = Number(process.argv.find(a=>a.startsWith("--id="))?.split("=")[1] ?? 1);
  const state = await readJson(`facts/state/${id}.json`);
  const world = await readJson("facts/world/world.json");

  const payload = {
    entity: { type:"state", id },
    facts: {
      state: { id: state.id, name: state.name, capitalBurgId: state.capitalBurgId },
      world: { era: world.era, year: world.year }
    },
    request: { sections: ["adventureHooks"] }
  };

  const hooksHash = await cacheKeyForEntity("state", id, []); // section salt covered by prompt/schema versions
  const lorePath = `lore/state/${id}.json`;

  let lore: StateLore;
  try { lore = await readJson(lorePath); }
  catch { lore = { entity: { type:"state", id } }; }

  const out = await generateStructured<StateLore>(
    SYSTEM_STATE,
    payload,
    "schemas/lore.state.schema.json",
    process.env.LORE_CHEAP_MODEL || "gpt-4o-mini",
    { kind: "state-hooks", entity: { type:"state", id } }
  );

  lore.adventureHooks = out.adventureHooks ?? [];
  lore.hashOfInputs = hooksHash;
  lore.lastGeneratedAt = new Date().toISOString();

  await fs.mkdir("lore/state", { recursive: true });
  await writeJson(lorePath, lore);
  console.log(`Hooks refreshed for state ${id}: ${lore.adventureHooks?.length ?? 0} hook(s).`);
}

main();
