// src/view/md/burgMd.ts
import fs from "node:fs";

type J = any;
const readJson = <T=any>(p:string):T|null=>{try{return JSON.parse(fs.readFileSync(p,"utf8"));}catch{return null;}};

function pct(n:number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${(n*100).toFixed(Math.abs(n) < 0.005 ? 2 : 1)}%`;
}
function mdEsc(s:string){return s.replace(/[\\`*_{}[\]()#+\-.!]/g,"\\$&");}

function nearbyMarkersForBurg(burgId:number) {
  const idx = readJson<J>("index/markers.json");
  if (!idx?.markers) return [];
  return idx.markers
    .filter((m:any)=>Array.isArray(m.near_burg_ids_hint) && m.near_burg_ids_hint.includes(burgId))
    .map((m:any)=>({
      id:String(m.id), name:String(m.name||m.id), type:String(m.type||"marker"),
      legend_text: String(m.legend_text||"").trim(),
      runes_text: String(m.runes_text||"").trim(),
      tags: (m.tags||[]).map((t:string)=>String(t))
    }));
}

export function burgMarkdown(burgId:number): string {
  const r = readJson<J>(`rendered/burg/${burgId}.json`);
  if (!r) throw new Error(`Rendered burg JSON not found: rendered/burg/${burgId}.json`);

  const ov = r.overlay || {};
  const popMul = typeof ov.population_multiplier === "number" ? ov.population_multiplier : 1;
  const tradeMul = typeof ov.state_trade_multiplier === "number" ? ov.state_trade_multiplier : 1;
  const law = ov.law_enforcement || { status: "none" };

  const popDelta = popMul - 1;
  const tradeDelta = tradeMul - 1;

  const hooks: Array<any> = Array.isArray(ov.hooks_active) ? ov.hooks_active : [];

  const lines: string[] = [];
  lines.push(`# ${mdEsc(r.name)} (Burg ${r.burg_id})`);
  if (r.heraldry_path) {
    lines.push(`![Coat of Arms](${r.heraldry_path})`);
  }
  lines.push("");
  lines.push(`**State**: ${r.state_id}${r.province_id ? `  •  **Province**: ${mdEsc(String(r.province_id))}` : ""}`);
  if (Array.isArray(r.tags) && r.tags.length) lines.push(`**Tags**: ${r.tags.join(", ")}`);
  lines.push("");

  // Overlay pills
  const pills: string[] = [];
  pills.push(`Population: ${pct(popDelta)}`);
  pills.push(`Trade: ${pct(tradeDelta)}`);
  if (law?.status && law.status !== "none") pills.push(`Law: ${law.status.replace(/_/g," ")}`);
  if (ov.assets_destroyed?.length) pills.push(`Damaged: ${ov.assets_destroyed.length} asset(s)`);
  lines.push(pills.map(p=>`• ${p}`).join("  \n"));
  lines.push("");

  // Economy / problems / culture / religion
  const sec = (title:string, arr:any[])=>{
    if (Array.isArray(arr) && arr.length) {
      lines.push(`### ${title}`);
      for (const x of arr) lines.push(`- ${mdEsc(String(x))}`);
      lines.push("");
    }
  };
  sec("Economy Roles", r.economy_roles || []);
  sec("Problems", r.problems || []);
  sec("Culture Notes", r.culture_notes || []);
  sec("Religious Presence", r.religion_presence || []);

  // Active hooks
  lines.push(`### Active Hooks`);
  if (hooks.length === 0) {
    lines.push("_None active here._");
  } else {
    for (const h of hooks) {
      lines.push(`- **${h.chain_id}** via \`${h.hook_template_id}\`  —  _${mdEsc(h.rationale||"")}_  \`(${h.hook_instance_id})\``);
    }
  }
  lines.push("");

  // Nearby runic markers
  const markers = nearbyMarkersForBurg(r.burg_id);
  lines.push(`### Nearby Mysterious Markers`);
  if (!markers.length) {
    lines.push("_No indexed markers near this burg._");
  } else {
    for (const m of markers) {
      lines.push(`- **${mdEsc(m.name)}**  \`type:${m.type}\`  ${m.tags?.length ? ` _(tags: ${m.tags.join(", ")})_` : ""}`);
      if (m.legend_text) lines.push(`  - ${mdEsc(m.legend_text.slice(0,180))}${m.legend_text.length>180?"…":""}`);
      if (m.runes_text) {
        lines.push("");
        lines.push("```runes");
        lines.push(m.runes_text);
        lines.push("```");
      }
    }
  }

  lines.push("");
  lines.push(`_Generated: ${new Date().toISOString()}_`);
  return lines.join("\n");
}
