import fs from "fs/promises";
import { validateStateFull, validateBurgFull } from "../validate/rich.js";

type Fail = { entity: string; reason: string };

async function validateDir(dir: string, fn: (id:number)=>Promise<boolean>) {
  const out: { passed: number; failed: Fail[] } = { passed: 0, failed: [] };
  const files = await fs.readdir(dir).catch(()=>[]);
  for (const f of files) {
    const id = Number(f.replace(".json",""));
    try { await fn(id); out.passed++; }
    catch (e:any) { out.failed.push({ entity: `${dir.includes("state")?"state":"burg"}:${id}`, reason: String(e?.message ?? e) }); }
  }
  return out;
}

async function main() {
  const stateRes = await validateDir("lore/state", validateStateFull);
  const burgRes  = await validateDir("lore/burg",  validateBurgFull);
  const summary = {
    ts: new Date().toISOString(),
    states: { passed: stateRes.passed, failed: stateRes.failed.length },
    burgs:  { passed: burgRes.passed,  failed: burgRes.failed.length },
    failures: [...stateRes.failed, ...burgRes.failed]
  };
  await fs.mkdir("index", { recursive: true });
  await fs.writeFile("index/validate-summary.json", JSON.stringify(summary, null, 2));
  console.log(`Validation: states ${stateRes.passed}✓/${stateRes.failed.length}✗, burgs ${burgRes.passed}✓/${burgRes.failed.length}✗`);
  if (summary.failures.length) {
    console.log("Failures:", summary.failures.slice(0,10));
    process.exitCode = 1; // non-zero for CI or UI to show red
  }
}
main();
