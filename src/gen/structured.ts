import { client, MODEL } from "./openaiClient.js";
import fs from "fs/promises";

export async function generateStructured<T>(system: string, userPayload: unknown, schemaPath: string): Promise<T> {
  const json_schema = JSON.parse(await fs.readFile(schemaPath,"utf8"));
  const res = await client.chat.completions.create({
    model: MODEL,
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
  });
  const content = res.choices[0]?.message?.content;
  if (!content) throw new Error("No JSON content from model");
  return JSON.parse(content) as T;
}
