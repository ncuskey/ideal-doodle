import fs from "fs/promises";
import { generateStructured } from "../gen/structured.js";
import { SYSTEM_STATE } from "../gen/systemPrompts.js";
import { MODEL_FULL } from "../gen/openaiClient.js";
import { cacheKeyForEntity } from "../util/cacheKey.js";
import { shouldRegen } from "../util/regenGuard.js";

async function read(p:string){ return JSON.parse(await fs.readFile(p,"utf8")); }

async function main() {
  const id = Number(process.argv.find(a=>a.startsWith("--id="))?.split("=")[1] ?? 1);
  const pack = await read(`index/promptFacts/state/${id}.json`);
  const hash = await cacheKeyForEntity("state", id, []) + ":fullv1";
  const outPath = `lore/state/${id}.json`;
  if (!(await shouldRegen(outPath, hash))) { console.log("No changes; skip."); return; }

  const payload = {
    entity: pack.entity,
    facts: pack,
    request: { sections: ["summary","history","geographyNotes","societyNotes","economyNotes","factions","adventureHooks"] },
    dependsOn: [{ type:"world", id:"world", fields:["era","year"] }]
  };

  const lore = await generateStructured<any>(
    SYSTEM_STATE,
    payload,
    "schemas/lore.state.full.schema.json",
    MODEL_FULL,
    { kind: "state-full", entity: { type:"state", id } }
  );
  lore.hashOfInputs = hash;
  await fs.mkdir("lore/state", { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(lore,null,2));
  console.log(`Full state lore → ${outPath}`);
}
main();
