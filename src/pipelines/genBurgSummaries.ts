import fs from "fs/promises";
import { generateStructured } from "../gen/structured.js";
import { SYSTEM_BURG } from "../gen/systemPrompts.js";
import { MODEL_SUMMARY } from "../gen/openaiClient.js";

async function readJson(p:string){ return JSON.parse(await fs.readFile(p,"utf8")); }

async function main() {
  const files = (await fs.readdir("facts/burg")).slice(0,20);
  const facts = await Promise.all(files.map(f=>readJson(`facts/burg/${f}`)));
  const payload = { batch: facts.map(b => ({ entity:{type:"burg",id:b.id}, facts:{burg:{name:b.name,pop:b.pop,port:b.port}} })), request:{ sections:["summary"] } };
  const out = await generateStructured<any>(
    SYSTEM_BURG,
    payload,
    "schemas/lore.burg.schema.json",
    MODEL_SUMMARY
  );
  console.log("Batch done. (You can extend to write files individually.)");
}
main();
