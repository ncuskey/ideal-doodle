/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

type J = any;
const read = <T=any>(p:string):T|null => { try { return JSON.parse(fs.readFileSync(p,"utf8")); } catch { return null; } };

function findMaster(): {path:string, json:any} {
  const candidates = [
    "data/southia.json",
    "data/world.json",
    "facts/world/1.json"
  ];
  for (const p of candidates) if (fs.existsSync(p)) return { path:p, json: read(p) };
  throw new Error("Master JSON not found (looked in data/southia.json, data/world.json, facts/world/1.json)");
}

function scanForCity(obj:any): {url?:string, svg?:string, seed?:string, notes:string[]} {
  const notes:string[] = [];
  const res: any = {};
  // Deep scan for a watabou URL, inline SVG, or seedish fields
  const stack = [obj];
  while (stack.length) {
    const cur = stack.pop();
    for (const [k,v] of Object.entries(cur || {})) {
      if (typeof v === "string") {
        if (/watabou\.github\.io\/city-generator/.test(v)) res.url = v;
        if (v.includes("<svg") || v.startsWith("data:image/svg+xml")) res.svg = (res.svg ?? v);
        if (/seed/i.test(k)) res.seed = String(v);
      } else if (typeof v === "number" && /seed/i.test(k)) {
        res.seed = String(v);
      } else if (v && typeof v === "object") {
        stack.push(v);
      }
    }
  }
  if (!res.url && !res.svg && !res.seed) notes.push("No explicit watabou URL/SVG/seed fields detected.");
  return { ...res, notes };
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: npx tsx scripts/find-burg.ts [burg-name]

Searches for a burg (city) in the Southia data and scans for Watabou city generator information.

Examples:
  npx tsx scripts/find-burg.ts "Slalzan"
  npx tsx scripts/find-burg.ts "Oz'jash"
  npx tsx scripts/find-burg.ts  # Uses "Oz'jash" as default

The script will:
- Find the burg by name (case-insensitive)
- Extract population and coastal information
- Scan for Watabou URLs, SVG data, or seed values
- Output JSON with all found information
`);
    process.exit(0);
  }
  
  const nameQ = args.join(" ").trim() || "Oz'jash";
  const { path: masterPath, json } = findMaster();
  const burgs:any[] = Array.isArray(json?.pack?.burgs) ? json.pack.burgs : [];
  if (!burgs.length) throw new Error("No burgs[] in master JSON");

  const match = burgs.find(b => (b?.name || "").toLowerCase() === nameQ.toLowerCase());
  if (!match) {
    console.log(`No burg named "${nameQ}" found in ${masterPath}.`);
    console.log(`\nAvailable burgs (showing first 20):`);
    const namedBurgs = burgs.filter(b => b?.name).slice(0, 20);
    namedBurgs.forEach(b => console.log(`  - ${b.name} (id: ${b.i})`));
    if (burgs.length > 20) console.log(`  ... and ${burgs.length - 20} more`);
    process.exit(1);
  }

  const report = scanForCity(match);
  const pop = match.population ?? match.pop ?? "(n/a)";
  const coastish = match.port ?? match.coast ?? match.sea ?? false;

  console.log(JSON.stringify({
    masterPath,
    burg_id: match.i ?? match.id,
    name: match.name,
    population: pop,
    coastish,
    watabou: report
  }, null, 2));
}

main();
