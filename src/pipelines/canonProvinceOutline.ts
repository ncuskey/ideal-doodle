// src/pipelines/canonProvinceOutline.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import pLimit from "p-limit";
import { openai, withRateLimitRetry } from "../gen/openaiClient";
import { buildNameMaps } from "../ingest/canonicalNames";

type J = any;
const readJson = <T=any>(p: string): T | null => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const listJson = (dir: string) => fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith(".json")).map(f => path.join(dir, f)) : [];
const ensureDir = (d: string) => fs.mkdirSync(d, { recursive: true });

const slug = (s: string) => (s || "region").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);
function checksumString(s: string): string { let h = 2166136261>>>0; for (let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0;} return `fnv1a_${h.toString(16)}`; }
const nowIso = () => new Date().toISOString();

function gather() {
  const world = readJson<J>("canon/world/outline.json");
  const interstate = readJson<J>("canon/interstate/outline.json");
  const stateFiles = listJson("canon/state");
  if (!world || !interstate || stateFiles.length === 0) {
    console.error("Missing prerequisites: canon/world, canon/interstate, canon/state. Run the earlier steps first.");
    process.exit(2);
  }

  // Provinces from facts if available:
  const provFactDir = fs.existsSync("facts/derived/province") ? "facts/derived/province" :
                      fs.existsSync("facts/province") ? "facts/province" : "";
  const haveFactProvs = !!provFactDir;

  const { provinceNameById } = buildNameMaps();
  const states = stateFiles.map(p => {
    const so = readJson<J>(p); // state outline
    const id = so?.state_id ?? parseInt(path.basename(p).split(".")[0], 10);
    const name = so?.name ?? `State_${id}`;
    const regions = Array.isArray(so?.regions) ? so.regions : [];
    return { id, name, outline: so, regions };
  });

  // Map burgs to province ids if facts carry that info
  const burgFiles = listJson("facts/derived/burg").length ? listJson("facts/derived/burg") : listJson("facts/burg");
  const burgByProv = new Map<string, string[]>(); // provId -> [burgIdStr]
  for (const bf of burgFiles) {
    const j = readJson<J>(bf);
    const burgId = String(j?.id ?? parseInt(path.basename(bf, ".json"), 10));
    const stateId = String(j?.state ?? j?.stateId ?? j?.s ?? "");
    const provIdRaw = j?.province ?? j?.provinceId ?? j?.prov ?? "";
    if (provIdRaw) {
      const key = String(provIdRaw);
      const arr = burgByProv.get(key) || [];
      arr.push(burgId);
      burgByProv.set(key, arr);
    }
    // else: will remain unmapped (synthetic provinces from state regions)
  }

  return { world, interstate, states, haveFactProvs, provFactDir, burgByProv };
}

function buildPrompt(ctx: ReturnType<typeof gather>, s: {id:number; name:string; outline:J}, pMeta: {province_id:string; name:string; settlements_hint:string[]}) {
  const w = ctx.world;
  const worldName = w?.world_id || w?.worldName || "world";
  const langFamilies = (w?.language_families || []).slice(0,6);
  const relFamilies = (w?.religion_families || []).slice(0,6);
  const techBaseline = w?.tech_magic?.baseline || "unspecified";
  const techConstraints = w?.tech_magic?.constraints || [];

  const stateCulture = s.outline?.culture || {};
  const stateReligion = s.outline?.religion || {};

  const sys = [
    "You are creating a concise PROVINCE OUTLINE.",
    "Output MUST satisfy the JSON Schema exactly.",
    "Use LISTS, no prose paragraphs. Keep it short."
  ].join(" ");

  const text = [
    `World: ${worldName}; State: ${s.id} - ${s.name}`,
    "",
    "World hints:",
    `Language families: ${langFamilies.join(", ") || "(n/a)"}`,
    `Religion families: ${relFamilies.join(", ") || "(n/a)"}`,
    `Tech baseline: ${techBaseline}; constraints: ${techConstraints.join("; ") || "(n/a)"}`,
    "",
    "State hints:",
    `Economy pillars: ${(s.outline?.economy_pillars || []).join(", ") || "(n/a)"}`,
    `Culture traits: ${(stateCulture?.traits || []).join(", ") || "(n/a)"} (lang: ${stateCulture?.language_family || "n/a"})`,
    `Religion families present: ${(stateReligion?.families_present || []).join(", ") || "(n/a)"}; dominant: ${stateReligion?.dominant || "n/a"}`,
    "",
    `Province target: ${pMeta.province_id} - ${pMeta.name}`,
    `Settlements hint: ${pMeta.settlements_hint.join(", ") || "(none)"}`,
    "",
    "Produce fields per schema:",
    "- role_in_state (one short phrase)",
    "- economy_niches (3–6)",
    "- culture_adjustments (3–6 bullets; how this province differs from state culture)",
    "- religion_profile (families_present subset of world/state; optional dominant)",
    "- settlements_hint (keep as IDs/names; do not invent new ones)",
    "- risks (2–6 short labels; e.g., floodplain, banditry, border-tension)",
    "- constraints, notes (1–4 each)",
    "Keep it tight; no paragraphs."
  ].join("\n");

  return { sys, user: { role: "user" as const, content: text } };
}

async function main() {
  const g = gather();
  const outDir = "canon/province";
  ensureDir(outDir);

  // Build candidate provinces:
  type Prov = { state_id:number; province_id:string; name:string; settlements_hint:string[]; source:"facts"|"synthetic" };
  const candidates: Prov[] = [];

  if (g.haveFactProvs && g.provFactDir) {
    const factFiles = listJson(g.provFactDir);
    if (factFiles.length > 0) {
      const { provinceNameById } = buildNameMaps();
      for (const pf of factFiles) {
        const j = readJson<J>(pf);
        const stateId = Number(j?.state ?? j?.stateId ?? j?.s ?? NaN);
        if (!Number.isFinite(stateId)) continue;
        const provId = String(j?.id ?? path.basename(pf, ".json"));
        const name = provinceNameById.get(String(provId)) || j?.name || j?.Name || `Province_${provId}`;
        const burghint = g.burgByProv.get(provId) || [];
        candidates.push({ state_id: stateId, province_id: provId, name, settlements_hint: burghint, source: "facts" });
      }
    }
  }
  
  if (candidates.length === 0) {
    // synthesize from state outlines' regions
    for (const st of g.states) {
      for (const r of (st.regions || [])) {
        const name = r?.label || r?.id || "Region";
        const provId = `prov_${st.id}_${slug(String(name))}`;
        candidates.push({ state_id: st.id, province_id: provId, name, settlements_hint: [], source: "synthetic" });
      }
    }
  }
  const limit = pLimit(Number(process.env.OUTLINE_CONCURRENCY ?? 4));
  let i = 0, n = candidates.length;

  await Promise.all(candidates.map(c => limit(async () => {
    const st = g.states.find(s => s.id === c.state_id);
    if (!st) return;
    const outPath = path.join(outDir, `${c.province_id}.outline.json`);

    const fingerprint = checksumString(JSON.stringify({
      w: g.world?.checksum, i: g.interstate?.checksum, s: st.outline?.checksum, c
    }));

    const existing = readJson<J>(outPath);
    const force = process.argv.includes("--force") || process.env.FORCE_REGEN === "1";
    if (existing?.checksum === fingerprint && !force) {
      console.log(`No changes; skip province ${c.province_id}.`);
      return;
    }

    const schema = readJson<J>("schemas/province_outline.schema.json");
    if (!schema) throw new Error("Missing schemas/province_outline.schema.json");

    const { sys, user } = buildPrompt(g, st, c);
    const model = process.env.LORE_OUTLINE_MODEL || "gpt-5-mini";

    const res = await withRateLimitRetry(() =>
      openai.chat.completions.create({
        model,
        messages: [{ role: "system" as const, content: sys }, user],
        response_format: { type: "json_schema", json_schema: { name: "province_outline", schema } }
      })
    );

    // Parse the JSON content from the chat completion response
    const content = res.choices[0]?.message?.content;
    if (!content) throw new Error("No JSON content from model");
    const parsed = JSON.parse(content);
    const doc = {
      ...parsed,
      world_id: g.world?.world_id || g.world?.worldName || "world",
      state_id: c.state_id,
      province_id: c.province_id,
      name: parsed.name || c.name,
      checksum: fingerprint,
      generated_at: nowIso()
    };

    fs.writeFileSync(outPath, JSON.stringify(doc, null, 2), "utf8");
    console.log(`province ${++i}/${n} → ${outPath}`);
  })));

  console.log("Province outlines complete.");
}

main().catch(e => { console.error(e); process.exit(1); });
