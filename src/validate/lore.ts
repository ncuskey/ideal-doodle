import fs from "fs/promises";

export async function validateBurgLore(id:number) {
  const burg = JSON.parse(await fs.readFile(`facts/burg/${id}.json`,"utf8"));
  const lore = JSON.parse(await fs.readFile(`lore/burg/${id}.json`,"utf8"));
  if (Array.isArray(lore.adventureHooks) && lore.adventureHooks.length > 3)
    throw new Error("Too many adventure hooks");
  if (lore.summary && /port|harbor/i.test(lore.summary) && !burg.port)
    throw new Error("Lore claims port/harbor but burg.port=false");
  return true;
}
