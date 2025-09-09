// src/pipelines/canonBurgOutline.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import pLimit from "p-limit";
import { client, withRateLimitRetry } from "../gen/openaiClient";

type J = any;
const readJson = <T=any>(p: string): T | null => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const listJson = (dir: string) => fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith(".json")).map(f => path.join(dir, f)) : [];
const ensureDir = (d: string) => fs.mkdirSync(d, { recursive: true });

function checksumString(s: string): string { let h = 2166136261>>>0; for (let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0;} return `fnv1a_${h.toString(16)}`; }
const nowIso = () => new Date().toISOString();

function gather() {
  const world = readJson<J>("canon/world/outline.json");
  const interstate = readJson<J>("canon/interstate/outline.json");

  const stateOutlines = new Map<number, J>();
  for (const f of listJson("canon/state")) {
    const so = readJson<J>(f);
    const sid = so?.state_id ?? parseInt(path.basename(f).split(".")[0], 10);
    if (Number.isFinite(sid)) stateOutlines.set(sid, so);
  }

  // province outlines are optional (may be synthetic/provisional)
  const provOutlines = new Map<string, J>();
  if (fs.existsSync("canon/province")) {
    for (const f of listJson("canon/province")) {
      const po = readJson<J>(f);
      const pid = po?.province_id ?? path.basename(f, ".json");
      provOutlines.set(String(pid), po);
    }
  }

  const burgFiles = listJson("facts/derived/burg").length ? listJson("facts/derived/burg") : listJson("facts/burg");
  const burgs = burgFiles.map(p => {
    const j = readJson<J>(p);
    const id = j?.id ?? parseInt(path.basename(p, ".json"), 10);
    const name = j?.name || j?.Name || `Burg_${id}`;
    const state_id = Number(j?.state ?? j?.stateId ?? j?.s ?? NaN);
    const province_id = String(j?.province ?? j?.provinceId ?? j?.prov ?? "") || undefined;
    const pop = j?.population ?? j?.pop ?? j?.size ?? undefined;
    const coastal = !!(j?.coastal ?? j?.hasCoast ?? false);
    const river = !!(j?.river ?? j?.hasRiver ?? false);
    const port = !!(j?.port ?? false);
    return { id, name, state_id, province_id, pop, coastal, river, port, path: p };
  });

  return { world, interstate, stateOutlines, provOutlines, burgs };
}

function buildPrompt(g: ReturnType<typeof gather>, b: ReturnType<typeof gather>["burgs"][number]) {
  const w = g.world;
  const worldName = w?.world_id || w?.worldName || "world";
  const state = Number.isFinite(b.state_id) ? g.stateOutlines.get(b.state_id) : null;

  const langFamilies = (w?.language_families || []).slice(0,6);
  const relFamilies = (w?.religion_families || []).slice(0,6);
  const techBaseline = w?.tech_magic?.baseline || "unspecified";
  const techConstraints = w?.tech_magic?.constraints || [];

  const stateEconomy = (state?.economy_pillars || []).join(", ") || "(n/a)";
  const stateCulture = (state?.culture?.traits || []).join(", ") || "(n/a)";
  const stateReligion = (state?.religion?.families_present || []).join(", ") || "(n/a)";

  const tagsBase: string[] = [];
  if (b.coastal) tagsBase.push("coastal");
  if (b.river) tagsBase.push("river");
  if (b.port) tagsBase.push("port");
  if (typeof b.pop === "number") tagsBase.push(b.pop > 8000 ? "large" : b.pop > 2000 ? "medium" : "small");

  const sys = [
    "You are creating a concise BURG OUTLINE.",
    "Output MUST satisfy the JSON Schema exactly.",
    "Use LISTS; no prose. Keep it short."
  ].join(" ");

  const text = [
    `World: ${worldName}; State: ${b.state_id || "unknown"}`,
    `Burg target: ${b.id} - ${b.name}`,
    `Burg hints: tags = ${tagsBase.join(", ") || "(none)"}; pop≈${b.pop ?? "n/a"}`,
    "",
    "World hints:",
    `Language families: ${langFamilies.join(", ") || "(n/a)"}`,
    `Religion families: ${relFamilies.join(", ") || "(n/a)"}`,
    `Tech baseline: ${techBaseline}; constraints: ${techConstraints.join("; ") || "(n/a)"}`,
    "",
    "State hints:",
    `Economy pillars: ${stateEconomy}`,
    `Culture traits: ${stateCulture}`,
    `Religions: ${stateReligion}`,
    "",
    "Produce fields per schema:",
    "- tags: include provided hints + 0–3 more if warranted (e.g., crossroads, mining, academic)",
    "- size_hint: small/medium/large/outpost",
    "- economy_roles: 2–5 short labels",
    "- factions_local: 2–5 short labels",
    "- problems: 2–5 short labels (banditry, corruption, scarcity, unrest, etc.)",
    "- religion_presence: subset labels (families, sects) consistent with world/state hints",
    "- culture_notes: 2–5 bullets (dialect, customs, cuisine hints)",
    "- quest_hook_slots: 0–3 short themes only (e.g., smuggling, plague, disappearances)",
    "- constraints, notes: 1–3 each"
  ].join("\n");

  return { sys, user: { role: "user", content: [{ type: "text", text }] as const } };
}

async function main() {
  const g = gather();
  const outDir = "canon/burg";
  ensureDir(outDir);

  const limit = pLimit(Number(process.env.OUTLINE_CONCURRENCY ?? 6));
  let i = 0, n = g.burgs.length;

  await Promise.all(g.burgs.map(b => limit(async () => {
    const outPath = path.join(outDir, `${b.id}.outline.json`);

    const stCk = Number.isFinite(b.state_id) ? g.stateOutlines.get(b.state_id)?.checksum : "";
    const fingerprint = checksumString(JSON.stringify({
      w: g.world?.checksum, i: g.interstate?.checksum, s: stCk, b: { id: b.id, name: b.name, tags: [b.coastal, b.river, b.port], pop: b.pop }
    }));

    const existing = readJson<J>(outPath);
    const force = process.argv.includes("--force") || process.env.FORCE_REGEN === "1";
    if (existing?.checksum === fingerprint && !force) {
      // console.log(`No changes; skip burg ${b.id}.`);
      return;
    }

    const schema = readJson<J>("schemas/burg_outline.schema.json");
    if (!schema) throw new Error("Missing schemas/burg_outline.schema.json");

    const { sys, user } = buildPrompt(g, b);
    const model = process.env.LORE_OUTLINE_MODEL || "gpt-5-mini";

    const res = await withRateLimitRetry(() =>
      client.chat.completions.create({
        model,
        messages: [{ role: "system", content: sys }, user],
        response_format: { type: "json_schema", json_schema: { name: "burg_outline", schema } }
      })
    );

    // Parse the JSON content from the chat completion response
    const content = res.choices[0]?.message?.content;
    if (!content) throw new Error("No JSON content from model");
    const parsed = JSON.parse(content);
    const doc = {
      ...parsed,
      world_id: g.world?.world_id || g.world?.worldName || "world",
      burg_id: b.id,
      name: parsed.name || b.name,
      state_id: Number.isFinite(b.state_id) ? b.state_id : parsed.state_id || 0,
      province_id: b.province_id || parsed.province_id,
      checksum: fingerprint,
      generated_at: nowIso()
    };

    fs.writeFileSync(outPath, JSON.stringify(doc, null, 2), "utf8");
    if ((++i % 25) === 0 || i === n) console.log(`burg ${i}/${n}`);
  })));

  console.log("Burg outlines complete.");
}

main().catch(e => { console.error(e); process.exit(1); });
