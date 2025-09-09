import OpenAI from "openai";
import "dotenv/config"; // <-- loads .env

export const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---- Rate-limit helpers ----
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const jitter = (ms: number) => Math.round(ms * (0.85 + Math.random() * 0.3)); // ±15%

function parseHeaderMs(v?: string) {
  if (!v) return undefined;
  // supports "1200" (ms) or "1.2s" / "1m6.299s"
  const simple = v.match(/^(\d+(?:\.\d+)?)(ms|s|m)?$/i);
  if (simple) {
    const n = parseFloat(simple[1]);
    const u = (simple[2] || "ms").toLowerCase();
    if (u === "ms") return Math.round(n);
    if (u === "s")  return Math.round(n * 1000);
    if (u === "m")  return Math.round(n * 60_000);
  }
  const total =
    (v.match(/(\d+(?:\.\d+)?)m/)?.[1] ? parseFloat(v.match(/(\d+(?:\.\d+)?)m/)![1]) * 60_000 : 0) +
    (v.match(/(\d+(?:\.\d+)?)s/)?.[1] ? parseFloat(v.match(/(\d+(?:\.\d+)?)s/)![1]) * 1000 : 0) +
    (v.match(/(\d+(?:\.\d+)?)ms/)?.[1] ? parseFloat(v.match(/(\d+(?:\.\d+)?)ms/)![1]) : 0);
  return total || undefined;
}

/**
 * Wrap an OpenAI call with smart retries for 429s.
 * Honors server-provided retry hints and falls back to capped exponential backoff with jitter.
 *
 * Tuning knobs (env):
 *   OPENAI_MAX_RETRIES (default 8)
 *   OPENAI_BASE_DELAY_MS (default 500)
 */
export async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  opts: { maxRetries?: number; baseDelayMs?: number } = {}
): Promise<T> {
  const maxRetries = opts.maxRetries ?? Number(process.env.OPENAI_MAX_RETRIES ?? 8);
  const baseDelay  = opts.baseDelayMs  ?? Number(process.env.OPENAI_BASE_DELAY_MS ?? 500);

  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const is429 = err?.status === 429 || err?.code === "rate_limit_exceeded";
      if (!is429 || attempt >= maxRetries) throw err;

      const h = err?.headers ?? {};
      const ra = parseHeaderMs(h["retry-after-ms"]) ?? parseHeaderMs(h["retry-after"]);
      const reset = parseHeaderMs(h["x-ratelimit-reset-tokens"]);

      const exp = baseDelay * 2 ** attempt;
      const wait = jitter(Math.min(30_000, ra ?? reset ?? exp));
      // Compact console log for your dashboard stream:
      // Example: [429] retrying in 1244ms (attempt 2/8)
      console.log(`[429] retrying in ${wait}ms (attempt ${attempt + 1}/${maxRetries})`);
      await sleep(wait);
      continue;
    }
  }
}

// Quality-first
export const MODEL_FULL = "gpt-5";        // use for full lore (state/burg deep)
export const MODEL_SUMMARY = "gpt-5-nano"; // use for batch summaries
export const MODEL_CHEAP = "gpt-5-mini";   // use for partial regen, cheap hooks
