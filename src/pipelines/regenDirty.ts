import fs from "fs/promises";
import { affectedBy } from "../graph/dirty.js";
import { buildStatePromptPack, buildBurgPromptPack } from "../derive/promptPacks.js";
import { deriveStatePartial, deriveBurgPartial } from "../derive/partial.js";
import { execFile } from "child_process";
import { promisify } from "util";
const execFileAsync = promisify(execFile);

type StartNode = `${"state"|"burg"|"world"}:${string}`;

async function readJson(p:string){ return JSON.parse(await fs.readFile(p,"utf8")); }

function parseArgs() {
  const nodes: StartNode[] = [];
  let eventFile: string|undefined;
  for (const a of process.argv.slice(2)) {
    if (a.startsWith("--node=")) nodes.push(a.split("=")[1] as StartNode);
    if (a.startsWith("--event-file=")) eventFile = a.split("=")[1];
  }
  return { nodes, eventFile };
}

async function nodesFromEvent(file:string): Promise<StartNode[]> {
  const data = await readJson(file);
  const out: StartNode[] = [];
  
  // Handle seed files (from applyEvents)
  if (data.nodes && Array.isArray(data.nodes)) {
    return data.nodes as StartNode[];
  }
  
  // Handle event files (original format)
  if (data.where?.type === "state") out.push(`state:${data.where.id}`);
  if (data.where?.type === "burg") out.push(`burg:${data.where.id}`);
  // Extend here for multi-actor/territory events if needed
  return out;
}

function uniq<T>(arr:T[]) { return [...new Set(arr)]; }

function partition(nodes: string[]) {
  const states = new Set<number>();
  const burgs = new Set<number>();
  for (const n of nodes) {
    const [k,idStr] = n.split(":");
    const id = Number(idStr);
    if (k==="state" && Number.isFinite(id)) states.add(id);
    if (k==="burg"  && Number.isFinite(id)) burgs.add(id);
  }
  return { states:[...states], burgs:[...burgs] };
}

async function main() {
  const { nodes: argNodes, eventFile } = parseArgs();
  const startNodes = [...argNodes, ...(eventFile ? await nodesFromEvent(eventFile) : [])];
  if (!startNodes.length) throw new Error("Provide at least one --node=state:ID|burg:ID or --event-file=...");

  // Compute downstream dependents
  const allTargets = new Set<string>();
  for (const n of startNodes) {
    allTargets.add(n);
    for (const dep of await affectedBy(n)) allTargets.add(dep);
  }
  const targets = [...allTargets];
  const { states, burgs } = partition(targets);

  console.log(`Changed/affected → states: ${states.length}, burgs: ${burgs.length}`);

  // 1) Rebuild derived facts (partial) for targeted nodes
  //    (safe + fast; does NOT hit the API)
  for (const sid of states) await deriveStatePartial(sid);
  for (const bid of burgs) await deriveBurgPartial(bid);

  // 2) Rebuild prompt packs only for targeted nodes
  for (const sid of states) await buildStatePromptPack(sid);
  for (const bid of burgs) await buildBurgPromptPack(bid);

  // 3) Regenerate full lore only for targeted nodes.
  //    We invoke the existing full pipelines; they will skip if hash unchanged.
  for (const sid of states) {
    await execFileAsync("node", ["./node_modules/.bin/tsx", "src/pipelines/genStateLoreFull.ts", `--id=${sid}`], { env: process.env });
    console.log(`State regenerated: ${sid}`);
  }
  for (const bid of burgs) {
    await execFileAsync("node", ["./node_modules/.bin/tsx", "src/pipelines/genBurgLoreFull.ts", `--id=${bid}`], { env: process.env });
    console.log(`Burg regenerated: ${bid}`);
  }

  console.log("Dirty regeneration complete.");
}
main();
