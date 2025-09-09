import fs from "fs/promises";

const FLAG = "index/abort.flag";

export async function isAbortRequested(): Promise<boolean> {
  try { await fs.access(FLAG); return true; } catch { return false; }
}

export async function requestAbort(): Promise<void> {
  await fs.mkdir("index", { recursive: true });
  await fs.writeFile(FLAG, `aborted@${new Date().toISOString()}`, "utf8");
}

export async function clearAbort(): Promise<void> {
  try { await fs.rm(FLAG); } catch {}
}

export function watchAbort(onAbort: () => void, intervalMs = 500) {
  let fired = false;
  const t = setInterval(async () => {
    if (!fired && await isAbortRequested()) {
      fired = true;
      try { onAbort(); } catch {}
    }
  }, intervalMs);
  return { stop() { clearInterval(t); } };
}
