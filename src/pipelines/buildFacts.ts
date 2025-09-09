import fs from "fs/promises";
import path from "path";
import { loadAzgaar, extractWorldFacts, extractStateFacts, extractBurgFacts } from "../ingest/azgaar.js";

async function main() {
  const a = await loadAzgaar();
  const world = extractWorldFacts(a);
  const states = extractStateFacts(a);
  const burgs = extractBurgFacts(a);

  await fs.mkdir("facts/world", { recursive: true });
  await fs.mkdir("facts/state", { recursive: true });
  await fs.mkdir("facts/burg", { recursive: true });

  await fs.writeFile("facts/world/world.json", JSON.stringify(world, null, 2));
  for (const s of states) await fs.writeFile(`facts/state/${s.id}.json`, JSON.stringify(s, null, 2));
  for (const b of burgs) await fs.writeFile(`facts/burg/${b.id}.json`, JSON.stringify(b, null, 2));

  console.log(`World, ${states.length} states, ${burgs.length} burgs written.`);
}
main();
