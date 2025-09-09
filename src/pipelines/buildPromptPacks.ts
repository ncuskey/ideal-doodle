import fs from "fs/promises";
import { buildStatePromptPack, buildBurgPromptPack } from "../derive/promptPacks.js";

async function main() {
  const states = await fs.readdir("facts/state");
  const burgs = await fs.readdir("facts/burg");
  for (const f of states) await buildStatePromptPack(Number(f.replace(".json","")));
  for (const f of burgs) await buildBurgPromptPack(Number(f.replace(".json","")));
  console.log("Prompt packs built.");
}
main();
