import fs from "fs/promises";
import { cacheKeyForEntity } from "../util/cacheKey.js";
import { generateStructured } from "../gen/structured.js";
import { SYSTEM_STATE } from "../gen/systemPrompts.js";
import { shouldRegen } from "../util/regenGuard.js";
import { MODEL_FULL } from "../gen/openaiClient.js";

async function readJson(p:string){ return JSON.parse(await fs.readFile(p,"utf8")); }

async function main() {
  const id = Number(process.argv.find(a=>a.startsWith("--id="))?.split("=")[1] ?? 1);
  const state = await readJson(`facts/state/${id}.json`);
  const world = await readJson("facts/world/world.json");
  const hash = await cacheKeyForEntity("state", id, []);

  const lorePath = `lore/state/${id}.json`;
  if (!(await shouldRegen(lorePath, hash))) {
    console.log("No changes detected; skipping generation."); process.exit(0);
  }

  const payload = {
    entity: { type:"state", id },
    facts: {
      state: { id: state.id, name: state.name, capitalBurgId: state.capitalBurgId },
      world: { era: world.era, year: world.year }
    },
    request: { sections: ["summary","history","adventureHooks"] }
  };

  const lore = await generateStructured<any>(
    SYSTEM_STATE,
    payload,
    "schemas/lore.state.schema.json",
    MODEL_FULL
  );
  lore.hashOfInputs = hash;
  await fs.mkdir("lore/state", { recursive: true });
  await fs.writeFile(`lore/state/${id}.json`, JSON.stringify(lore, null, 2));
  console.log(`State lore written: lore/state/${id}.json`);
}
main();
