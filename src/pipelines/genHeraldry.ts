// src/pipelines/genHeraldry.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import pLimit from "p-limit";
import { generateOneHeraldry, loadWorldId } from "../heraldry/armoria";

type J = any;
const readJson = <T=any>(p: string): T | null => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const listJson = (dir: string) => fs.existsSync(dir) ? fs.readdirSync(dir).filter(f=>f.endsWith(".json")).map(f=>path.join(dir, f)) : [];
const ensureDir = (d: string) => fs.mkdirSync(d, { recursive: true });

function checksumString(s: string): string { let h = 2166136261>>>0; for (let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0;} return `fnv1a_${h.toString(16)}`; }
const nowIso = () => new Date().toISOString();

function buildSeed(kind:"state"|"province"|"burg", id:string|number, name:string, extra?:string) {
  const world = loadWorldId();
  return `${world}:${kind}:${id}:${name}${extra ? ":"+extra : ""}`;
}

type OutRow = {
  kind:"state"|"province"|"burg";
  id:number|string;
  state_id?:number;
  name:string;
  seed:string;
  path:string;
  format:string;
  shield?:string;
  coa?:string;
};

async function main() {
  const force = process.argv.includes("--force") || process.env.FORCE_REGEN === "1";
  const kinds = new Set(process.argv.filter(a=>a.startsWith("--kind=")).map(a=>a.split("=")[1] as "state"|"province"|"burg"));
  const doState = !kinds.size || kinds.has("state");
  const doProv  = !kinds.size || kinds.has("province");
  const doBurg  = !kinds.size || kinds.has("burg");

  const items: OutRow[] = [];

  // STATES from canon/state/*.outline.json
  if (doState && fs.existsSync("canon/state")) {
    for (const f of listJson("canon/state")) {
      const j = readJson<J>(f); if (!j) continue;
      const id = Number(j.state_id ?? path.basename(f).split(".")[0]);
      const name = String(j.name || `State_${id}`);
      const seed = buildSeed("state", id, name);
      // Optional: look for a preferred shield name or direct COA in facts (customize as needed)
      items.push({ kind:"state", id, name, seed, path:"", format:"svg" });
    }
  }

  // PROVINCES from canon/province/*.outline.json
  if (doProv && fs.existsSync("canon/province")) {
    for (const f of listJson("canon/province")) {
      const j = readJson<J>(f); if (!j) continue;
      const id = String(j.province_id ?? path.basename(f, ".json"));
      const name = String(j.name || id);
      const state_id = Number(j.state_id ?? 0);
      const seed = buildSeed("province", id, name, `s${state_id}`);
      items.push({ kind:"province", id, state_id, name, seed, path:"", format:"svg" });
    }
  }

  // BURGS from canon/burg/*.outline.json
  if (doBurg && fs.existsSync("canon/burg")) {
    for (const f of listJson("canon/burg")) {
      const j = readJson<J>(f); if (!j) continue;
      const id = Number(j.burg_id ?? path.basename(f, ".json"));
      const name = String(j.name || `Burg_${id}`);
      const state_id = Number(j.state_id ?? 0);
      const seed = buildSeed("burg", id, name, `s${state_id}`);
      items.push({ kind:"burg", id, state_id, name, seed, path:"", format:"svg" });
    }
  }

  const limit = pLimit(Number(process.env.HERALDRY_CONCURRENCY ?? 3));
  const results: OutRow[] = [];

  let i = 0, n = items.length;
  await Promise.all(items.map(it => limit(async () => {
    const idx = ++i;
    try {
      const done = await generateOneHeraldry(it, force);
      results.push(done);
      if ((idx % 25) === 0 || idx === n) console.log(`heraldry ${idx}/${n}`);
    } catch (e:any) {
      console.error(`Heraldry failed ${it.kind}:${it.id} — ${e?.message || e}`);
    }
  })));

  // Write index
  ensureDir("index");
  const fingerprint = checksumString(JSON.stringify(results.map(r => [r.kind, r.id, r.path])));
  const out = {
    world_id: loadWorldId(),
    generated_at: nowIso(),
    checksum: fingerprint,
    count: results.length,
    items: results
  };
  fs.writeFileSync("index/heraldry_map.json", JSON.stringify(out, null, 2), "utf8");
  console.log(`Heraldry index → index/heraldry_map.json (items=${results.length})`);
}

main().catch(e => { console.error(e); process.exit(1); });
