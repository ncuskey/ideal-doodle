// src/qa/patchDryRun.js
if (process.env.DRY_RUN !== "1") return;

const fs = require("node:fs");
const path = require("node:path");

const log = (...a) => console.log("[dry-run]", ...a);

const passthrough = new Set([
  "readFileSync","readFile","readdirSync","readdir","statSync","stat","existsSync","exists",
  "createReadStream","realpathSync","realpath"
]);

for (const k of Object.keys(fs)) {
  const v = fs[k];
  if (typeof v !== "function") continue;
  if (passthrough.has(k)) continue;

  if (k === "writeFileSync") {
    fs[k] = function(p, data, ...rest) {
      const rel = path.relative(process.cwd(), p);
      const size = typeof data === "string" ? Buffer.byteLength(data) : (Buffer.isBuffer(data) ? data.length : 0);
      log(`write ${rel} (${size} bytes)`);
      return; // swallow
    };
  } else if (k === "mkdirSync") {
    fs[k] = function(p, opts) {
      const rel = path.relative(process.cwd(), p);
      log(`mkdir ${rel}`);
      return; // swallow
    };
  } else if (k === "renameSync" || k === "rmSync" || k === "unlinkSync" || k === "rmdirSync" || k === "copyFileSync") {
    fs[k] = function(p, ...rest) {
      const rel = path.relative(process.cwd(), p);
      log(`${k} ${rel}`);
      return; // swallow
    };
  }
}
console.log("[dry-run] File system writes are disabled for this process.");
