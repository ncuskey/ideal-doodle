// src/qa/validate.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";

type J = any;
const readJson = <T=any>(p:string):T|null=>{try{return JSON.parse(fs.readFileSync(p,"utf8"));}catch{return null;}};

function list(dir:string){ return fs.existsSync(dir) ? fs.readdirSync(dir).filter(f=>f.endsWith(".json")).map(f=>path.join(dir,f)) : []; }

function main() {
  const args = new Map<string,string>();
  for (const a of process.argv.slice(2)) { const [k,v="true"] = a.replace(/^--/,"").split("="); args.set(k, v); }

  const schemaPath = args.get("schema");
  const dir = args.get("dir");
  if (!schemaPath || !dir) {
    console.error("Usage: tsx src/qa/validate.ts --schema=schemas/xyz.schema.json --dir=rendered/burg");
    process.exit(2);
  }

  const schema = readJson<J>(schemaPath);
  if (!schema) { console.error("Schema not found:", schemaPath); process.exit(2); }

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  let ok=0, bad=0;
  for (const p of list(dir)) {
    const j = readJson<J>(p);
    const valid = validate(j);
    if (!valid) {
      console.log(`❌ ${path.basename(p)}:`);
      console.log(validate.errors);
      bad++;
    } else ok++;
  }
  console.log(`Validation done: ok=${ok}, bad=${bad}`);
  process.exit(bad ? 1 : 0);
}
main();
