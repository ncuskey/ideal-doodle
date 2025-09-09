// src/render/heraldryIndex.ts
import fs from "node:fs";
type J = any;
const readJson = <T=any>(p:string):T|null=>{try{return JSON.parse(fs.readFileSync(p,"utf8"));}catch{return null;}};

export function heraldryLookup(kind:"state"|"province"|"burg", id:number|string): string | undefined {
  const idx = readJson<J>("index/heraldry_map.json");
  if (!idx?.items) return undefined;
  const found = idx.items.find((x:any)=>x.kind===kind && String(x.id)===String(id));
  return found?.path;
}
