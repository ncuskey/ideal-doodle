import fs from "fs/promises";
import pLimit from "p-limit";
import { spawn, ChildProcess } from "child_process";
import { isAbortRequested, watchAbort } from "../util/abort.js";

const CONCURRENCY = Number(process.env.LORE_CONCURRENCY ?? 4);

async function runOne(id: number, children: Set<ChildProcess>) {
  if (await isAbortRequested()) return;
  await new Promise<void>((resolve, reject) => {
    const child = spawn("node", ["./node_modules/.bin/tsx", "src/pipelines/genBurgLoreFull.ts", `--id=${id}`],
      { env: process.env, stdio: "ignore" });
    children.add(child);
    child.on("exit", (code, signal) => {
      children.delete(child);
      if (signal === "SIGTERM") return resolve();
      if (code === 0) return resolve();
      reject(new Error(`burg ${id} exited with code ${code}`));
    });
  });
}

async function main() {
  const files = await fs.readdir("facts/burg");
  const ids = files.map(f => Number(f.replace(".json",""))).filter(Number.isFinite);
  const limit = pLimit(CONCURRENCY);
  const children = new Set<ChildProcess>();
  const watcher = watchAbort(() => {
    console.log("\n⚠️ Abort requested — terminating running burg jobs…");
    for (const c of children) try { c.kill("SIGTERM"); } catch {}
  });

  console.log(`Burgs to (re)generate: ${ids.length} (concurrency=${CONCURRENCY})`);
  const tasks: Promise<any>[] = [];
  let scheduled = 0, done = 0;
  for (const id of ids) {
    if (await isAbortRequested()) { console.log("\n⏹️  Scheduling halted by abort."); break; }
    tasks.push(limit(async () => {
      if (await isAbortRequested()) return;
      scheduled++;
      await runOne(id, children);
      done++;
      process.stdout.write(`burg ${done}/${scheduled}\r`);
    }));
  }
  const results = await Promise.allSettled(tasks);
  watcher.stop();
  const failures = results.filter(r => r.status === "rejected").length;
  console.log(`\nBurg bulk run finished. Failures: ${failures}`);
}
main();