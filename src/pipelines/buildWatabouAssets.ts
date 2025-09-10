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

// Generate a simple SVG map based on burg data
function generateCitySVG(burg: any, seed: number): string {
  const name = String(burg?.name ?? `Burg_${burg.i}`);
  const population = Math.max(100, Math.round(Number(burg?.population ?? 1000)));
  const size = Math.max(6, Math.min(100, Math.ceil(2.13 * Math.pow(population / 1000, 0.385))));
  
  // Use seed for deterministic layout
  const rng = mulberry32(seed);
  const width = 400;
  const height = 300;
  
  // Generate building positions based on seed
  const buildings: Array<{x: number, y: number, width: number, height: number, type: string, color: string, label: string}> = [];
  
  // Citadel (if present)
  if (burg?.citadel) {
    buildings.push({
      x: 50 + (rng() * 50),
      y: 50 + (rng() * 30),
      width: 80,
      height: 60,
      type: "citadel",
      color: "#8b4513",
      label: "Keep"
    });
  }
  
  // Market/Plaza
  if (burg?.plaza) {
    buildings.push({
      x: 150 + (rng() * 50),
      y: 80 + (rng() * 30),
      width: 60,
      height: 40,
      type: "market",
      color: "#4169e1",
      label: "Market"
    });
  }
  
  // Temple
  if (burg?.temple) {
    buildings.push({
      x: 230 + (rng() * 50),
      y: 70 + (rng() * 30),
      width: 50,
      height: 50,
      type: "temple",
      color: "#228b22",
      label: "Temple"
    });
  }
  
  // Tavern/Inn
  buildings.push({
    x: 300 + (rng() * 50),
    y: 90 + (rng() * 30),
    width: 70,
    height: 30,
    type: "tavern",
    color: "#ff6347",
    label: "Tavern"
  });
  
  // Additional buildings based on population
  const numBuildings = Math.min(8, Math.max(3, Math.floor(population / 200)));
  for (let i = 0; i < numBuildings - buildings.length; i++) {
    const types = [
      { color: "#9370db", label: "Shop" },
      { color: "#20b2aa", label: "House" },
      { color: "#ffa500", label: "Workshop" },
      { color: "#dc143c", label: "Inn" }
    ];
    const type = types[Math.floor(rng() * types.length)];
    buildings.push({
      x: 20 + (rng() * (width - 100)),
      y: 120 + (rng() * (height - 150)),
      width: 40 + (rng() * 30),
      height: 30 + (rng() * 20),
      type: "building",
      color: type.color,
      label: type.label
    });
  }
  
  // Generate SVG
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += `  <rect width="${width}" height="${height}" fill="#f0f8ff"/>\n`;
  svg += `  <text x="${width/2}" y="20" text-anchor="middle" font-family="Arial" font-size="16" fill="#333">${name} - City Map</text>\n`;
  svg += `  <text x="${width/2}" y="40" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">Burg ID: ${burg.i} | Pop: ${population}</text>\n`;
  
  // Add buildings
  buildings.forEach(building => {
    svg += `  <rect x="${building.x}" y="${building.y}" width="${building.width}" height="${building.height}" fill="${building.color}" stroke="#654321" stroke-width="1"/>\n`;
    svg += `  <text x="${building.x + building.width/2}" y="${building.y + building.height/2 + 3}" text-anchor="middle" font-family="Arial" font-size="9" fill="white">${building.label}</text>\n`;
  });
  
  // Add streets
  svg += `  <line x1="0" y1="${height/2}" x2="${width}" y2="${height/2}" stroke="#666" stroke-width="3"/>\n`;
  svg += `  <line x1="${width/2}" y1="60" x2="${width/2}" y2="${height}" stroke="#666" stroke-width="2"/>\n`;
  
  // Add walls if present
  if (burg?.walls) {
    svg += `  <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="none" stroke="#8b4513" stroke-width="4"/>\n`;
  }
  
  svg += `</svg>`;
  return svg;
}

function generateVillageSVG(burg: any, seed: number): string {
  const name = String(burg?.name ?? `Burg_${burg.i}`);
  const population = Math.max(100, Math.round(Number(burg?.population ?? 1000)));
  
  // Use seed for deterministic layout
  const rng = mulberry32(seed);
  const width = 600;
  const height = Math.round(width / 2.2);
  
  // Generate building positions based on seed
  const buildings: Array<{x: number, y: number, width: number, height: number, type: string, color: string, label: string}> = [];
  
  // Central meeting area
  buildings.push({
    x: width/2 - 30,
    y: height/2 - 20,
    width: 60,
    height: 40,
    type: "meeting",
    color: "#8b4513",
    label: "Hall"
  });
  
  // Houses around the center
  const numHouses = Math.min(12, Math.max(4, Math.floor(population / 100)));
  for (let i = 0; i < numHouses; i++) {
    const angle = (i / numHouses) * 2 * Math.PI;
    const radius = 80 + (rng() * 40);
    const x = width/2 + Math.cos(angle) * radius - 20;
    const y = height/2 + Math.sin(angle) * radius - 15;
    
    buildings.push({
      x: Math.max(10, Math.min(width-50, x)),
      y: Math.max(10, Math.min(height-40, y)),
      width: 40,
      height: 30,
      type: "house",
      color: "#20b2aa",
      label: "House"
    });
  }
  
  // Generate SVG
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += `  <rect width="${width}" height="${height}" fill="#f0f8ff"/>\n`;
  svg += `  <text x="${width/2}" y="20" text-anchor="middle" font-family="Arial" font-size="16" fill="#333">${name} - Village Map</text>\n`;
  svg += `  <text x="${width/2}" y="40" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">Burg ID: ${burg.i} | Pop: ${population}</text>\n`;
  
  // Add buildings
  buildings.forEach(building => {
    svg += `  <rect x="${building.x}" y="${building.y}" width="${building.width}" height="${building.height}" fill="${building.color}" stroke="#654321" stroke-width="1"/>\n`;
    svg += `  <text x="${building.x + building.width/2}" y="${building.y + building.height/2 + 3}" text-anchor="middle" font-family="Arial" font-size="9" fill="white">${building.label}</text>\n`;
  });
  
  // Add paths between buildings
  for (let i = 1; i < buildings.length; i++) {
    const prev = buildings[i-1];
    const curr = buildings[i];
    svg += `  <line x1="${prev.x + prev.width/2}" y1="${prev.y + prev.height/2}" x2="${curr.x + curr.width/2}" y2="${curr.y + curr.height/2}" stroke="#8b7355" stroke-width="2" opacity="0.6"/>\n`;
  }
  
  svg += `</svg>`;
  return svg;
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

  const items: Array<{ burg_id:number; name:string; city_svg_path?:string; village_svg_path?:string; kind:"city"|"village" }> = [];

  // Ensure directories exist
  ensureDir("assets/watabou/city");
  ensureDir("assets/watabou/village");

  for (const b of burgs) {
    const burg_id = Number(b?.i ?? b?.id);
    if (!Number.isFinite(burg_id)) continue;

    const name = String(b?.name ?? `Burg_${burg_id}`);
    const basePop = Number(b?.population ?? b?.pop ?? 1000);
    const population = Math.max(100, Math.round(basePop));
    const seed = seededInt(worldSeed, burg_id);

    // Determine if city or village
    const cityish = population >= 1500 || b?.citadel || b?.walls || b?.temple || b?.shanty;

    const item: any = { burg_id, name, kind: cityish ? "city" : "village" };

    if (cityish) {
      // Generate city SVG
      const citySvg = generateCitySVG(b, seed);
      const cityPath = `assets/watabou/city/${burg_id}.svg`;
      fs.writeFileSync(cityPath, citySvg, "utf8");
      item.city_svg_path = cityPath;
    } else {
      // Generate village SVG
      const villageSvg = generateVillageSVG(b, seed);
      const villagePath = `assets/watabou/village/${burg_id}.svg`;
      fs.writeFileSync(villagePath, villageSvg, "utf8");
      item.village_svg_path = villagePath;
    }

    items.push(item);
  }

  // Write index
  ensureDir("index");
  fs.writeFileSync("index/watabou_map.json", JSON.stringify({ generated_at: iso(), items }, null, 2), "utf8");
  console.log(`Generated ${items.length} Watabou SVG assets and wrote index/watabou_map.json`);
}

main();
