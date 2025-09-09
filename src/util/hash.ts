import { createHash } from "crypto";
import { canonical } from "./canonical.js";
export { canonical };
export function hashOf(...parts: any[]): string {
  const h = createHash("sha256");
  for (const p of parts) h.update(canonical(p));
  return h.digest("hex");
}
