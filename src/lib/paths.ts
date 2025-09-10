import path from "node:path";

// Where the pipeline writes files. If UI lives at repo root, this is process.cwd().
// Override in env: DATA_ROOT=../LoreGen (relative or absolute)
const DATA_ROOT = process.env.DATA_ROOT ? path.resolve(process.env.DATA_ROOT) : process.cwd();

export const dirs = {
  dataRoot: DATA_ROOT,
  rendered: (sub = "") => path.join(DATA_ROOT, "rendered", sub),
  index: (sub = "") => path.join(DATA_ROOT, "index", sub),
  state: (sub = "") => path.join(DATA_ROOT, "state", sub),
  canon: (sub = "") => path.join(DATA_ROOT, "canon", sub),
  publicAsset: (p: string) => {
    // Map a file path to a public URL (assuming assets under /public/assets/...)
    const i = p.indexOf("/assets/");
    return i >= 0 ? p.slice(i) : p.startsWith("assets/") ? `/${p}` : null;
  }
};
