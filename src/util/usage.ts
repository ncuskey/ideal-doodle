import fs from "fs/promises";
import path from "path";

export type UsageEntry = {
  ts: string; model: string; kind: "state-full"|"burg-full"|"burg-hooks"|"state-hooks"|"other";
  entity?: { type: "state"|"burg"; id: number|string };
  promptTokens?: number; completionTokens?: number; totalTokens?: number;
  estCostUSD?: number;
};

function getPricePerToken(model: string, which: "input"|"output"): number {
  // Prices per token in USD; configure via env to avoid hardcoding.
  // Example:
  //   GPT5_INPUT_USD=0.000003  GPT5_OUTPUT_USD=0.000012
  //   GPT5MINI_INPUT_USD=0.000001  GPT5MINI_OUTPUT_USD=0.000004
  //   GPT5NANO_INPUT_USD=0.0000005 GPT5NANO_OUTPUT_USD=0.000002
  const upper = model.toUpperCase().replace(/\W+/g,"");
  const inKey = `${upper}_INPUT_USD`;
  const outKey = `${upper}_OUTPUT_USD`;
  const pi = Number(process.env[inKey] ?? 0);
  const po = Number(process.env[outKey] ?? 0);
  return which === "input" ? pi : po;
}

export async function logUsage(entry: UsageEntry) {
  try {
    const dir = "index/runs";
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, `run-${new Date().toISOString().slice(0,10)}.ndjson`);
    await fs.appendFile(file, JSON.stringify(entry) + "\n", "utf8");
  } catch {}
}

export function estimateCostUSD(model: string, promptTokens=0, completionTokens=0): number {
  const cin = getPricePerToken(model, "input") * promptTokens;
  const cout = getPricePerToken(model, "output") * completionTokens;
  return +(cin + cout).toFixed(6);
}
