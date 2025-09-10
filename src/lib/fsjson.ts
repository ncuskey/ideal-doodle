import fs from "node:fs/promises";
import path from "node:path";

export async function readJson<T>(p: string): Promise<T> {
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw) as T;
}
export async function listJsonFiles(dir: string): Promise<string[]> {
  const all = await fs.readdir(dir).catch(() => []);
  return all.filter(f => f.endsWith(".json")).map(f => path.join(dir, f));
}
