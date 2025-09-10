import fs from "fs/promises";
import { generateStructured } from "../gen/structured.js";
import { SYSTEM_BURG } from "../gen/systemPrompts.js";
// Removed MODEL_FULL import - using environment variable instead
import { cacheKeyForEntity } from "../util/cacheKey.js";
import { shouldRegen } from "../util/regenGuard.js";

async function read(p:string){ return JSON.parse(await fs.readFile(p,"utf8")); }

async function main() {
  const id = Number(process.argv.find(a=>a.startsWith("--id="))?.split("=")[1] ?? 1);
  const pack = await read(`index/promptFacts/burg/${id}.json`);
  const hash = await cacheKeyForEntity("burg", id, ["name","capitalBurgId"]) + ":fullv1";
  const outPath = `lore/burg/${id}.json`;
  if (!(await shouldRegen(outPath, hash))) { console.log("No changes; skip."); return; }

  const payload = {
    entity: pack.entity,
    facts: pack,
    request: { sections: ["summary","localColor","notables","factions","adventureHooks"] },
    dependsOn: pack.state ? [{ type:"state", id: pack.state.id, fields:["name","capitalBurgId"] }] : []
  };

  const lore = await generateStructured<any>(
    SYSTEM_BURG,
    payload,
    "schemas/lore.burg.full.schema.json",
    process.env.LORE_FULL_MODEL || "gpt-4o",
    { kind: "burg-full", entity: { type:"burg", id } }
  );
  lore.hashOfInputs = hash;
  await fs.mkdir("lore/burg", { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(lore,null,2));
  console.log(`Full burg lore → ${outPath}`);
}
main();
