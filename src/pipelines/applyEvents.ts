import fs from "fs/promises";
import path from "path";

type Event = {
  type: "battle"|"rulerChange"|"disaster";
  where: { type:"state"|"burg"; id:number };
  effects?: any;
  date: string; notes?: string;
};

async function readJson(p:string){ return JSON.parse(await fs.readFile(p,"utf8")); }
async function writeJson(p:string, v:any){ await fs.writeFile(p, JSON.stringify(v,null,2)); }

async function applyEvent(ev: Event) {
  if (ev.type === "rulerChange" && ev.where.type==="state") {
    const p = `facts/state/${ev.where.id}.json`;
    const s = await readJson(p);
    s.ruler = ev.effects?.newRuler ?? "Unknown";
   await writeJson(p, s);
    console.log(`State ${s.id} ruler -> ${s.ruler}`);
  }
  // extend here for other types (territory transfers, population deltas, etc.)
}

async function main() {
  const file = process.argv.find(a=>a.startsWith("--file="))?.split("=")[1];
  if (!file) throw new Error("--file=events/xxx.json required");
  const ev: Event = await readJson(path.resolve(file));
  await applyEvent(ev);
  await fs.appendFile("events/log.ndjson", JSON.stringify(ev)+"\n");
  console.log("Event applied & logged.");
}
main();
