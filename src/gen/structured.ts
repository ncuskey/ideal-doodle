import { openai, withRateLimitRetry } from "./openaiClient.js";
import fs from "fs/promises";
import { logUsage, estimateCostUSD } from "../util/usage.js";

export async function generateStructured<T>(
  system: string,
  userPayload: unknown,
  schemaPath: string,
  model: string,
  usageMeta?: { kind: "state-full"|"burg-full"|"burg-hooks"|"state-hooks"|"other"; entity?: {type:"state"|"burg"; id:number|string} }
): Promise<T> {
  const json_schema = JSON.parse(await fs.readFile(schemaPath,"utf8"));
  const res = await withRateLimitRetry(() =>
    openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(userPayload) }
      ],
      response_format: { 
        type: "json_schema", 
        json_schema: {
          name: json_schema.title || "response",
          schema: json_schema
        }
      }
    })
  );
  const content = res.choices[0]?.message?.content;
  if (!content) throw new Error("No JSON content from model");

  // Try to obtain token usage if present
  const usage = res.usage ?? null;
  const promptTokens = usage?.prompt_tokens ?? undefined;
  const completionTokens = usage?.completion_tokens ?? undefined;
  const totalTokens = (promptTokens ?? 0) + (completionTokens ?? 0);
  const estCostUSD = estimateCostUSD(model, promptTokens ?? 0, completionTokens ?? 0);

  await logUsage({
    ts: new Date().toISOString(),
    model,
    kind: usageMeta?.kind ?? "other",
    entity: usageMeta?.entity,
    promptTokens, completionTokens, totalTokens, estCostUSD
  });

  return JSON.parse(content) as T;
}
