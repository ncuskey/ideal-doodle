// src/heraldry/armoria.ts
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

type Json = any;
const readJson = <T=any>(p: string): T | null => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const ensureDir = (d: string) => fs.mkdirSync(d, { recursive: true });

const ARMORIA_BASE = process.env.ARMORIA_BASE || "https://armoria.herokuapp.com"; // basic API endpoint
const FORMAT = (process.env.HERALDRY_FORMAT || "svg").toLowerCase(); // svg|png; svg preferred
const SIZE = process.env.HERALDRY_SIZE || "500"; // e.g. "500" or "500px"
const OUT_DIR = "assets/heraldry";

function safeSeed(s: string) {
  // Armoria lowercases and replaces some symbols; we do similar so file names are stable.
  return s.toLowerCase().replace(/[^\w\-]+/g, "_").slice(0, 120);
}

export type HeraldryItem = {
  kind: "state" | "province" | "burg";
  id: number | string;
  state_id?: number;
  name: string;
  seed: string;
  path: string;
  format: string;
  shield?: string;
  coa?: string; // optional direct COA JSON (URL-encoded by caller)
};

async function httpGet(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Armoria HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return buf;
}

export async function generateOneHeraldry(item: HeraldryItem, force=false): Promise<HeraldryItem> {
  ensureDir(OUT_DIR);
  const dir = path.join(OUT_DIR, item.kind);
  ensureDir(dir);

  const ext = FORMAT === "png" ? "png" : "svg";
  const outPath = path.join(dir, `${String(item.id)}.${ext}`);
  if (fs.existsSync(outPath) && !force) {
    return { ...item, path: outPath, format: ext };
  }

  // Prefer explicit COA when provided; else seed. API supports both via query.
  const params = new URLSearchParams();
  params.set("format", ext);
  params.set("size", SIZE);
  if (item.coa) params.set("coa", item.coa);
  else params.set("seed", safeSeed(item.seed));
  if (item.shield) params.set("shield", item.shield);

  const url = `${ARMORIA_BASE}/?${params.toString()}`;
  const data = await httpGet(url);

  fs.writeFileSync(outPath, data);
  return { ...item, path: outPath, format: ext };
}

export function loadWorldId(): string {
  const w = readJson<Json>("canon/world/outline.json");
  return w?.world_id || w?.worldName || "world";
}
