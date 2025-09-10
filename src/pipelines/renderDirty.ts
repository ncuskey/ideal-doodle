// src/pipelines/renderDirty.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import { heraldryLookup } from "../render/heraldryIndex";

type J = any;
const readJson = <T=any>(p:string):T|null=>{try{return JSON.parse(fs.readFileSync(p,"utf8"));}catch{return null;}};
const writeJson = (p:string,v:any)=>{fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p, JSON.stringify(v,null,2),"utf8");};
const nowIso = ()=>new Date().toISOString();

function renderOneBurg(id:number) {
  const bo = readJson<J>(`canon/burg/${id}.outline.json`); if (!bo) return;
  const ov = readJson<J>(`lore/overlays/burg/${id}.overlay.json`) || null;
  
  // Load Watabou links
  const links = readJson<J>("index/watabou_links.json");
  const linkRow = links?.items?.find((x:any)=> Number(x.burg_id) === Number(id));
  const watabou_url = linkRow?.url || null;
  
  // Load Watabou SVG assets
  const watabouMap = readJson<J>("index/watabou_map.json");
  const mapRow = watabouMap?.items?.find((x:any)=> Number(x.burg_id) === Number(id));
  const city_svg_path = mapRow?.city_svg_path || null;
  const village_svg_path = mapRow?.village_svg_path || null;

  const doc = {
    burg_id: Number(bo.burg_id || id),
    name: String(bo.name || `Burg_${id}`),
    state_id: Number(bo.state_id || 0),
    province_id: bo.province_id || null,
    heraldry_path: heraldryLookup("burg", id) || "",
    tags: bo.tags || [],
    economy_roles: bo.economy_roles || [],
    problems: bo.problems || [],
    religion_presence: bo.religion_presence || [],
    culture_notes: bo.culture_notes || [],
    overlay: ov,
    maps: {
      watabou_url,
      city_svg_path,
      village_svg_path
    },
    generated_at: nowIso()
  };

  writeJson(`rendered/burg/${id}.json`, doc);
}

function renderOneState(id:number) {
  const so = readJson<J>(`canon/state/${id}.outline.json`); if (!so) return;
  const ov = readJson<J>(`lore/overlays/state/${id}.overlay.json`) || null;

  const doc = {
    state_id: Number(so.state_id || id),
    name: String(so.name || `State_${id}`),
    economy_pillars: so.economy_pillars || [],
    culture: so.culture || {},
    religion: so.religion || {},
    heraldry_path: heraldryLookup("state", id) || "",
    overlay: ov,
    generated_at: nowIso()
  };

  writeJson(`rendered/state/${id}.json`, doc);
}

function listJson(dir:string){ return fs.existsSync(dir) ? fs.readdirSync(dir).filter(f=>f.endsWith(".json")).map(f=>Number(f.replace(/\.json$/,""))) : []; }

function main() {
  const args = new Map<string,string>();
  for (const a of process.argv.slice(2)) { const [k,v="true"] = a.replace(/^--/,"").split("="); args.set(k,v); }
  const all = args.has("all");

  let burgIds:number[] = [], stateIds:number[] = [];
  if (all) {
    burgIds = listJson("canon/burg");
    stateIds = listJson("canon/state");
  } else {
    const dirty = readJson<J>("index/dirty.json") || { burgs: [], states: [] };
    burgIds = Array.from(new Set<number>(dirty.burgs || []));
    stateIds = Array.from(new Set<number>(dirty.states || []));
  }

  let b=0, s=0;
  for (const id of burgIds) { renderOneBurg(id); b++; }
  for (const id of stateIds) { renderOneState(id); s++; }

  console.log(`Rendered → burg=${b}, state=${s}  (mode=${all ? "all":"dirty"})`);
}

main();
