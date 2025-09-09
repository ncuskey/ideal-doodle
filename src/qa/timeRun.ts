// src/qa/timeRun.ts
/* eslint-disable no-console */
import { spawn } from "node:child_process";

function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error("Usage: tsx src/qa/timeRun.ts -- <cmd> [args...]");
    process.exit(2);
  }
  const cmdIdx = args.indexOf("--");
  const cmd = cmdIdx >= 0 ? args.slice(cmdIdx + 1) : args;
  if (!cmd.length) { console.error("Missing command after --"); process.exit(2); }

  const [exe, ...rest] = cmd;
  const t0 = process.hrtime.bigint();
  console.log(`[time] start: ${exe} ${rest.join(" ")}`);

  const child = spawn(exe, rest, { stdio: "inherit", shell: process.platform === "win32" });
  child.on("close", (code) => {
    const t1 = process.hrtime.bigint();
    const ms = Number(t1 - t0) / 1e6;
    console.log(`[time] end: exit=${code}  elapsed=${ms.toFixed(0)}ms`);
    process.exit(code ?? 0);
  });
}
main();
