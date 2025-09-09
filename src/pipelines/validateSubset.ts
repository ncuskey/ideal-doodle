import { validateStateFull, validateBurgFull } from "../validate/rich.js";

function parseCsv(arg?: string): number[] {
  if (!arg) return [];
  return arg.split(",").map(s=>Number(s.trim())).filter(Number.isFinite);
}

async function main() {
  const states = parseCsv(process.argv.find(a=>a.startsWith("--states="))?.split("=")[1]);
  const burgs  = parseCsv(process.argv.find(a=>a.startsWith("--burgs="))?.split("=")[1]);
  let ok=0, fail=0;
  for (const id of states) { try { await validateStateFull(id); ok++; } catch (e:any){ console.error(`state:${id} ✗ ${e.message}`); fail++; } }
  for (const id of burgs)  { try { await validateBurgFull(id);  ok++; } catch (e:any){ console.error(`burg:${id} ✗ ${e.message}`);  fail++; } }
  console.log(`Subset validation done → OK: ${ok}, Fail: ${fail}`);
  if (fail) process.exitCode = 1;
}
main();
