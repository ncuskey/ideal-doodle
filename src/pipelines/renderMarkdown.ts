// src/pipelines/renderMarkdown.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import { burgMarkdown } from "../view/md/burgMd";
import { stateMarkdown } from "../view/md/stateMd";

const ensureDir = (d:string)=>fs.mkdirSync(d,{recursive:true});

function listIds(dir:string){ return fs.existsSync(dir) ? fs.readdirSync(dir).filter(f=>f.endsWith(".json")).map(f=>Number(f.replace(/\.json$/,""))) : []; }

function main() {
  const args = new Map<string,string>();
  for (const a of process.argv.slice(2)) { const [k,v="true"] = a.replace(/^--/,"").split("="); args.set(k,v); }

  const kind = args.get("kind") as "burg"|"state"|"all" | undefined;
  const id = args.get("id") ? Number(args.get("id")) : undefined;

  if (!kind || kind === "all") {
    // Make everything that currently has rendered JSON
    const burgIds = listIds("rendered/burg");
    const stateIds = listIds("rendered/state");

    for (const b of burgIds) {
      const md = burgMarkdown(b);
      ensureDir("rendered_md/burg");
      fs.writeFileSync(path.join("rendered_md/burg", `${b}.md`), md, "utf8");
    }
    for (const s of stateIds) {
      const md = stateMarkdown(s);
      ensureDir("rendered_md/state");
      fs.writeFileSync(path.join("rendered_md/state", `${s}.md`), md, "utf8");
    }
    console.log(`Markdown written for burg=${burgIds.length}, state=${stateIds.length}`);
    return;
  }

  if (kind === "burg") {
    if (!Number.isFinite(id)) { console.error("Usage: npm run render:md:burg -- --id=<burg_id>"); process.exit(2); }
    const md = burgMarkdown(id!);
    ensureDir("rendered_md/burg");
    fs.writeFileSync(path.join("rendered_md/burg", `${id}.md`), md, "utf8");
    console.log(`Markdown written → rendered_md/burg/${id}.md`);
    return;
  }

  if (kind === "state") {
    if (!Number.isFinite(id)) { console.error("Usage: npm run render:md:state -- --id=<state_id>"); process.exit(2); }
    const md = stateMarkdown(id!);
    ensureDir("rendered_md/state");
    fs.writeFileSync(path.join("rendered_md/state", `${id}.md`), md, "utf8");
    console.log(`Markdown written → rendered_md/state/${id}.md`);
    return;
  }
}

main();
