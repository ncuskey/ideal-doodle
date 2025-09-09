// src/qa/lsDirty.ts
/* eslint-disable no-console */
import fs from "node:fs";
type J = any;
const readJson = <T=any>(p:string):T|null=>{try{return JSON.parse(fs.readFileSync(p,"utf8"));}catch{return null;}};

function main() {
  const d = readJson<J>("index/dirty.json") || { burgs: [], states: [], updated_at: null };
  const b = new Set<number>(d.burgs || []);
  const s = new Set<number>(d.states || []);
  console.log(`Dirty → burgs=${b.size}, states=${s.size} (updated_at=${d.updated_at || "n/a"})`);
  if (b.size) console.log("  Burgs:", [...b].slice(0, 80).join(", "), b.size>80?"...":"");
  if (s.size) console.log("  States:", [...s].slice(0, 80).join(", "), s.size>80?"...":"");
}
main();
