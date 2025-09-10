// src/qa/diffJson.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

type J = any;
const readJson = <T=any>(p:string):T|null=>{try{return JSON.parse(fs.readFileSync(p,"utf8"));}catch{return null;}};

function isDir(p:string) { try { return fs.statSync(p).isDirectory(); } catch { return false; } }
function listJson(p:string){ return fs.readdirSync(p).filter(f=>f.endsWith(".json")).map(f=>path.join(p,f)); }

function normalize(obj:any, ignore:Set<string>): any {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(x=>normalize(x, ignore));
  const out:any = {};
  for (const [k,v] of Object.entries(obj)) {
    if (ignore.has(k)) continue;
    out[k] = normalize(v, ignore);
  }
  return out;
}

function diff(a:any, b:any, base=""): string[] {
  const out:string[] = [];
  if (a === b) return out;
  const ta = Object.prototype.toString.call(a);
  const tb = Object.prototype.toString.call(b);
  if (ta !== tb) { out.push(`${base}: type ${ta} -> ${tb}`); return out; }
  if (typeof a !== "object" || a === null) { out.push(`${base}: ${JSON.stringify(a)} -> ${JSON.stringify(b)}`); return out; }
  if (Array.isArray(a)) {
    const len = Math.max(a.length, (b as any[]).length);
    for (let i=0;i<len;i++){
      out.push(...diff(a[i], (b as any[])[i], `${base}[${i}]`));
    }
    return out;
  }
  // objects
  const keys = new Set([...Object.keys(a), ...Object.keys(b as any)]);
  for (const k of keys) {
    if (!(k in a)) out.push(`${base}/${k}: <missing> -> ${JSON.stringify((b as any)[k])}`);
    else if (!(k in (b as any))) out.push(`${base}/${k}: ${JSON.stringify(a[k])} -> <missing>`);
    else out.push(...diff(a[k], (b as any)[k], base ? `${base}/${k}` : k));
  }
  return out;
}

function main() {
  const args = new Map<string,string>();
  for (const a of process.argv.slice(2)) { const [k,v="true"] = a.replace(/^--/,"").split("="); args.set(k, v); }

  const left = args.get("left");
  const right = args.get("right");
  const ignore = new Set((args.get("ignore") ?? "generated_at,updated_at,checksum,__meta").split(",").map(s=>s.trim()).filter(Boolean));

  if (!left || !right) {
    console.error("Usage: tsx src/qa/diffJson.ts --left=<file|dir> --right=<file|dir> [--ignore=a,b,c]");
    process.exit(2);
  }

  const L = isDir(left) ? listJson(left) : [left];
  const R = isDir(right) ? listJson(right) : [right];

  const mapR = new Map<string,string>();
  for (const rp of R) mapR.set(path.basename(rp), rp);

  let changed = 0, same = 0, missing = 0;
  for (const lp of L) {
    const name = path.basename(lp);
    const rp = mapR.get(name);
    if (!rp) { console.log(`[MISSING] ${name} only in LEFT`); missing++; continue; }
    const l = normalize(readJson<J>(lp), ignore);
    const r = normalize(readJson<J>(rp), ignore);
    const d = diff(l, r);
    if (d.length) {
      console.log(`\n[CHANGED] ${name}`);
      for (const line of d.slice(0, 200)) console.log(" -", line);
      if (d.length > 200) console.log(` ... (${d.length-200} more lines)`);
      changed++;
    } else {
      same++;
    }
  }

  console.log(`\nSummary: changed=${changed}, same=${same}, missing=${missing}`);
}

main();
