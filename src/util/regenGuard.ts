import fs from "fs/promises";
export async function shouldRegen(pLore:string, newHash:string): Promise<boolean> {
  try {
    const lore = JSON.parse(await fs.readFile(pLore, "utf8"));
    return lore.hashOfInputs !== newHash;
  } catch { return true; }
}
