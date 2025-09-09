import fs from "fs/promises";
import { generateStructured } from "../gen/structured.js";
import { SYSTEM_BURG } from "../gen/systemPrompts.js";
import { MODEL_CHEAP } from "../gen/openaiClient.js";
import { cacheKeyForEntity } from "../util/cacheKey.js";

type BurgLore = {
  entity: { type: "burg"; id: number|string };
  summary?: string;
  factions?: any[];
  notables?: any[];
  adventureHooks?: any[];
  dependsOn?: any[];
  hashOfInputs?: string;
  lastGeneratedAt?: string;
};

async function readJson(p:string){ return JSON.parse(await fs.readFile(p,"utf8")); }
async function writeJson(p:string, v:any){ await fs.writeFile(p, JSON.stringify(v, null, 2)); }

async function main() {
  const id = Number(process.argv.find(a=>a.startsWith("--id="))?.split("=")[1] ?? 1);

  // facts
  const burg = await readJson(`facts/burg/${id}.json`);
  const state = burg.stateId!=null ? await readJson(`facts/state/${burg.stateId}.json`) : null;

  // tiny payload: only what hooks plausibly need
  const payload = {
    entity: { type:"burg", id },
    facts: {
      burg: { name: burg.name, pop: burg.pop, port: burg.port },
      state: state ? { id: state.id, name: state.name } : null
    },
    request: { sections: ["adventureHooks"] },
    dependsOn: state ? [{ type:"state", id: state.id, fields:["name"] }] : []
  };

  // compute a section-specific hash so we don't needlessly regen
  const hooksHash = await cacheKeyForEntity("burg", id, ["name"]); // section-level salt is built into prompt/schema versions
  const lorePath = `lore/burg/${id}.json`;

  // load or create lore
  let lore: BurgLore;
  try { lore = await readJson(lorePath); }
  catch { lore = { entity: { type:"burg", id } }; }

  // if same inputs created same overall hash before but we only refresh hooks, we still proceed:
  const out = await generateStructured<BurgLore>(
    SYSTEM_BURG,
    payload,
    "schemas/lore.burg.schema.json",
    MODEL_CHEAP
  );

  // merge: only replace hooks + bookkeeping
  lore.adventureHooks = out.adventureHooks ?? [];
  lore.dependsOn = out.dependsOn ?? lore.dependsOn;
  lore.hashOfInputs = hooksHash; // record the latest inputs for hooks
  lore.lastGeneratedAt = new Date().toISOString();

  await fs.mkdir("lore/burg", { recursive: true });
  await writeJson(lorePath, lore);
  console.log(`Hooks refreshed for burg ${id}: ${lore.adventureHooks?.length ?? 0} hook(s).`);
}

main();
