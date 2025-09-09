import fs from "fs/promises";
import { hashOf } from "./hash.js";

async function readJson(p: string){ return JSON.parse(await fs.readFile(p,"utf8")); }

export async function cacheKeyForEntity(kind: "burg"|"state", id: number|string, fieldsFromParent: string[] = []) {
  const selfFacts = await readJson(`facts/${kind}/${id}.json`);
  if (kind === "state") {
    const world = await readJson("facts/world/world.json");
    const upstream = { world: { era: world.era, year: world.year } }; // tiny slice
    return hashOf(selfFacts, upstream, "schema:v1", "prompt:v1");
  } else {
    const burg = selfFacts;
    const upstream: any = {};
    if (burg.stateId != null) {
      const s = await readJson(`facts/state/${burg.stateId}.json`);
      upstream.state = fieldsFromParent.length ? Object.fromEntries(fieldsFromParent.map(f=>[f,(s as any)[f]])) : s;
    }
    return hashOf(burg, upstream, "schema:v1", "prompt:v1");
  }
}
