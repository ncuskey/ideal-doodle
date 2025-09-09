// src/gen/openaiClient.ts
/* eslint-disable no-console */
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // You can set baseURL here if needed; leaving default.
});

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Simple pacing to stay below org TPM (tokens per minute).
// We don't know exact tokens per call, so we use an AVG estimate.
// You can tune with envs to match your account limits and prompts.
const TPM = Number(process.env.LORE_TPM_LIMIT ?? 30000);
const AVG_TOKENS = Number(process.env.LORE_AVG_REQ_TOKENS ?? 800); // rough per-call avg
const MIN_GAP_MS = Math.ceil((AVG_TOKENS / Math.max(TPM, 1)) * 60_000); // ms between starts
const MAX_RETRIES = Number(process.env.LORE_MAX_RETRIES ?? 8);
const JITTER_MS = Number(process.env.LORE_JITTER_MS ?? 150);

let lastStart = 0;

// Gate start times so we don't burst above TPM
async function paceGate(label?: string) {
  const now = Date.now();
  const wait = lastStart + MIN_GAP_MS - now;
  if (wait > 0) {
    if (process.env.DEBUG?.includes("pace")) {
      console.log(`[pace] waiting ${wait}ms before ${label || "call"}`);
    }
    await sleep(wait);
  }
  lastStart = Date.now();
}

function headerMs(h: Headers, key: string): number | null {
  const v = h.get(key);
  if (!v) return null;
  if (v.endsWith("ms")) return Number(v.replace(/ms$/, "")) || null;
  if (/^\d+(\.\d+)?$/.test(v)) return Math.round(Number(v) * 1000);
  return null;
}

export async function withRateLimitRetry<T>(
  call: () => Promise<T>,
  label?: string
): Promise<T> {
  let attempt = 0;
  for (;;) {
    await paceGate(label);

    try {
      const out = await call();
      return out;
    } catch (err: any) {
      const status = err?.status || err?.code;
      const headers: Headers | undefined = err?.headers;
      const is429 = Number(status) === 429 || err?.code === "rate_limit_exceeded";
      const is503 = Number(status) === 503;
      if (!(is429 || is503) || attempt >= MAX_RETRIES) {
        // Surface non-retryable or exhausted
        if (process.env.DEBUG?.includes("rl")) {
          console.error(`[rl] giving up after ${attempt} attempts:`, err?.message || err);
        }
        throw err;
      }

      // Compute backoff
      const hRetryMs =
        (headers && (headerMs(headers, "retry-after-ms") ??
        headerMs(headers, "x-ratelimit-reset-tokens"))) ?? null;

      const base = hRetryMs ?? (2000 + attempt * 800);
      const jitter = Math.floor(Math.random() * (JITTER_MS + 1));
      const wait = base + jitter;

      attempt++;
      const why = is429 ? "429 rate limit" : "503 unavailable";
      console.warn(`[rl] ${why}; backing off ${wait}ms (attempt ${attempt}/${MAX_RETRIES}) ${label ? "→ "+label : ""}`);
      await sleep(wait);
      // next loop
    }
  }
}