/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

type J = any;
const read = <T=any>(p:string):T|null => { try { return JSON.parse(fs.readFileSync(p,"utf8")); } catch { return null; } };
const ensureDir = (d:string)=>fs.mkdirSync(d,{recursive:true});
const iso = () => new Date().toISOString();

// tiny deterministic seed from worldSeed + burgId
function mulberry32(a:number){ return function(){ let t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function seededInt(worldSeed:number, burgId:number) {
  const r = mulberry32(Math.imul(worldSeed|0, 2654435761) ^ (burgId|0));
  return Math.floor(r() * 1e13); // big, stable enough for Watabou
}

function main() {
  // 1) load master JSON
  const master =
    read<J>("data/southia.json") ||
    read<J>("data/world.json") ||
    read<J>("facts/world/1.json");

  if (!master) { console.error("No master world JSON found"); process.exit(2); }

  const worldSeed: number = Number(master.info?.seed ?? master.seed ?? master.world?.seed ?? 12345);
  const burgs: any[] = Array.isArray(master?.pack?.burgs) ? master.pack.burgs : [];
  if (!burgs.length) { console.error("No burgs[] in master JSON"); process.exit(2); }

  const items: Array<{ burg_id:number; name:string; url:string; kind:"city"|"village" }> = [];

  for (const b of burgs) {
    const burg_id = Number(b?.i ?? b?.id);
    if (!Number.isFinite(burg_id)) continue;

    const name = String(b?.name ?? `Burg_${burg_id}`);
    const basePop = Number(b?.population ?? b?.pop ?? 1000);
    const population = Math.max(100, Math.round(basePop)); // FMG multiplies by populationRate*urbanization; we use base as a reasonable proxy
    const size = Math.max(6, Math.min(100, Math.ceil(2.13 * Math.pow(population / 1000, 0.385)))); // rough FMG-like curve
    const seed = seededInt(worldSeed, burg_id);

    // simple heuristics if your data exposes anything similar
    const coast = Number((b?.port ?? b?.coast ?? 0) ? 1 : 0);
    const river = (b?.river ?? b?.onRiver ?? 0) ? 1 : 0;

    // "city or village?" — mirror FMG: treat as city when larger or "city-ish"
    const cityish = population >= 1500 || b?.citadel || b?.walls || b?.temple || b?.shanty;

    let url = "";
    if (cityish) {
      const params = new URLSearchParams({
        name,
        population: String(population),
        size: String(size),
        seed: String(seed),
        river: String(river),
        coast: String(coast),
        farms: "1",
        citadel: String(Number(!!b?.citadel)),
        urban_castle: "0",
        hub: "false",
        plaza: String(Number(!!b?.plaza)),
        temple: String(Number(!!b?.temple)),
        walls: String(Number(!!b?.walls)),
        shantytown: String(Number(!!b?.shanty)),
        gates: "-1"
      });
      // optional 'sea' param omitted (requires FMG haven/cell math)
      url = `https://watabou.github.io/city-generator/?${params.toString()}`;
      items.push({ burg_id, name, url, kind: "city" });
    } else {
      const width = population > 1500 ? 1600 :
                    population > 1000 ? 1400 :
                    population > 500  ? 1000 :
                    population > 200  ? 800  :
                    population > 100  ? 600  : 400;
      const height = Math.round(width / 2.2);
      const tags: string[] = [];
      if (coast) tags.push("coast");
      if (river && !coast) tags.push("river");

      const params = new URLSearchParams({
        pop: String(population),
        name: "",
        seed: String(seed),
        width: String(width),
        height: String(height),
        tags: tags.join(",")
      });
      url = `https://watabou.github.io/village-generator/?${params.toString()}`;
      items.push({ burg_id, name, url, kind: "village" });
    }
  }

  ensureDir("index");
  fs.writeFileSync("index/watabou_links.json", JSON.stringify({ generated_at: iso(), items }, null, 2), "utf8");
  console.log(`Wrote index/watabou_links.json for ${items.length} burgs`);
}

main();
