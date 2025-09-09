import fs from "fs/promises";

async function read(p:string){ return JSON.parse(await fs.readFile(p,"utf8")); }

export async function validateStateFull(id:number) {
  const pack = await read(`index/promptFacts/state/${id}.json`);
  const lore = await read(`lore/state/${id}.json`);
  // If pack.geography.hasCoast === false, reject mentions of "navy"/"naval"/"fleet"
  if (pack?.geography?.hasCoast === false) {
    const bad = /navy|naval|fleet/i;
    if (bad.test(lore.summary) || bad.test(lore.geographyNotes) || bad.test(lore.economyNotes))
      throw new Error("State mentions navy/fleet but has no coast.");
  }
  // Limit hooks to <=4
  if ((lore.adventureHooks?.length ?? 0) > 4) throw new Error("Too many hooks.");
  return true;
}

export async function validateBurgFull(id:number) {
  const pack = await read(`index/promptFacts/burg/${id}.json`);
  const lore = await read(`lore/burg/${id}.json`);
  if (pack?.burg?.port === false) {
    const bad = /harbor|harbour|dock|naval/i;
    if (bad.test(lore.summary) || bad.test(lore.localColor))
      throw new Error("Burg claims harbor/naval but port=false.");
  }
  if ((lore.adventureHooks?.length ?? 0) > 4) throw new Error("Too many hooks.");
  return true;
}
