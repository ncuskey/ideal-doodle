// src/view/md/stateMd.ts
import fs from "node:fs";

type J = any;
const readJson = <T=any>(p:string):T|null=>{try{return JSON.parse(fs.readFileSync(p,"utf8"));}catch{return null;}};

function pct(n:number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${(n*100).toFixed(Math.abs(n) < 0.005 ? 2 : 1)}%`;
}
function mdEsc(s:string){return s.replace(/[\\`*_{}[\]()#+\-.!]/g,"\\$&");}

export function stateMarkdown(stateId:number): string {
  const r = readJson<J>(`rendered/state/${stateId}.json`);
  if (!r) throw new Error(`Rendered state JSON not found: rendered/state/${stateId}.json`);

  const ov = r.overlay || {};
  const tradeMul = typeof ov.trade_multiplier === "number" ? ov.trade_multiplier : 1;
  const law = ov.law_enforcement || { status: "none" };
  const reps: Array<{faction:string,score:number}> = Array.isArray(ov.reputations) ? ov.reputations : [];

  const lines: string[] = [];
  lines.push(`# ${mdEsc(r.name)} (State ${r.state_id})`);
  if (r.heraldry_path) {
    lines.push(`![Coat of Arms](${r.heraldry_path})`);
  }
  lines.push("");
  if (Array.isArray(r.economy_pillars) && r.economy_pillars.length) {
    lines.push(`**Economy Pillars**: ${r.economy_pillars.join(", ")}`);
  }
  lines.push("");

  const pills: string[] = [];
  pills.push(`Trade: ${pct(tradeMul - 1)}`);
  if (law?.status && law.status !== "none") pills.push(`Law: ${law.status.replace(/_/g," ")}`);
  lines.push(pills.map(p=>`• ${p}`).join("  \n"));
  lines.push("");

  // Reputation table (markdown)
  if (reps.length) {
    lines.push(`### Faction Reputations`);
    lines.push(`| Faction | Score |`);
    lines.push(`|---|---:|`);
    for (const rr of reps.sort((a,b)=>b.score-a.score)) {
      lines.push(`| ${mdEsc(rr.faction)} | ${rr.score} |`);
    }
    lines.push("");
  }

  lines.push(`### Culture`);
  lines.push("```json");
  lines.push(JSON.stringify(r.culture || {}, null, 2));
  lines.push("```");
  lines.push("");

  lines.push(`### Religion`);
  lines.push("```json");
  lines.push(JSON.stringify(r.religion || {}, null, 2));
  lines.push("```");
  lines.push("");

  lines.push(`_Generated: ${new Date().toISOString()}_`);
  return lines.join("\n");
}
