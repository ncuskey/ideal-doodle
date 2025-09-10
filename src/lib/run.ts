import { spawn } from "node:child_process";

// Whitelist npm scripts to invoke from API routes
const WHITELIST = new Map<string, string[]>([
  ["hooks:accept", []],
  ["quests:activate", []],
  ["events:plan", []],
  ["events:apply", []],
  ["overlays:build", []],
  ["render:dirty", []]
]);

export async function runScript(name: string, args: string[] = []) {
  if (!WHITELIST.has(name)) {
    return { ok: false, code: 1, out: "", err: `script not allowed: ${name}` };
  }
  const full = ["run", name, "--", ...args];
  const child = spawn(process.platform === "win32" ? "npm.cmd" : "npm", full, { shell: false });
  let out = "", err = "";
  child.stdout.on("data", d => (out += d.toString()));
  child.stderr.on("data", d => (err += d.toString()));
  const code: number = await new Promise(res => child.on("close", c => res(c ?? 0)));
  return { ok: code === 0, code, out, err };
}
