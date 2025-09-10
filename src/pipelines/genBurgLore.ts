import fs from "fs/promises";
import { cacheKeyForEntity } from "../util/cacheKey.js";
import { generateStructured } from "../gen/structured.js";
import { SYSTEM_BURG } from "../gen/systemPrompts.js";
import { shouldRegen } from "../util/regenGuard.js";
// Removed MODEL_FULL import - using environment variable instead

async function readJson(p:string){ return JSON.parse(await fs.readFile(p,"utf8")); }

async function main() {
  const id = Number(process.argv.find(a=>a.startsWith("--id="))?.split("=")[1] ?? 1);
  const burg = await readJson(`facts/burg/${id}.json`);
  const state = burg.stateId!=null ? await readJson(`facts/state/${burg.stateId}.json`) : null;
  const hash = await cacheKeyForEntity("burg", id, ["name","color","capitalBurgId"]);

  const lorePath = `lore/burg/${id}.json`;
  if (!(await shouldRegen(lorePath, hash))) {
    console.log("No changes detected; skipping generation."); process.exit(0);
  }

  const payload = {
    entity: { type:"burg", id },
    facts: {
      burg: { name: burg.name, pop: burg.pop, port: burg.port, x: burg.x, y: burg.y },
      state: state ? { id: state.id, name: state.name } : null
    },
    request: { sections: ["summary","factions","notables","adventureHooks"] },
    dependsOn: state ? [{ type:"state", id: state.id, fields:["name","capitalBurgId"] }] : []
  };

  const lore = await generateStructured<any>(
    SYSTEM_BURG,
    payload,
    "schemas/lore.burg.schema.json",
    process.env.LORE_FULL_MODEL || "gpt-4o"
  );
  lore.hashOfInputs = hash;
  await fs.mkdir("lore/burg", { recursive: true });
  await fs.writeFile(`lore/burg/${id}.json`, JSON.stringify(lore, null, 2));
  console.log(`Burg lore written: lore/burg/${id}.json`);
}
main();
