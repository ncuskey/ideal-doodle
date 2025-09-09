/* eslint-disable @next/next/no-img-element */
import fs from "node:fs/promises";
import path from "node:path";

/** ---------- Types (match your rendered + markers schemas) ---------- */
type BurgOverlay = {
  burg_id: number;
  state_id: number;
  population_multiplier?: number;      // e.g. 1.042
  state_trade_multiplier?: number;     // e.g. 0.88
  assets_destroyed?: string[];
  law_enforcement?: { status: "none" | "curfew" | "martial_law_local"; until?: string | null };
  hooks_active?: Array<{
    hook_instance_id: string;
    chain_id: string;
    hook_template_id: string;
    rationale?: string;
  }>;
  notes?: string[];
  generated_at: string;
};

type RenderedBurg = {
  burg_id: number;
  name: string;
  state_id: number;
  province_id?: string | null;
  heraldry_path?: string;
  tags?: string[];
  economy_roles?: string[];
  problems?: string[];
  religion_presence?: string[];
  culture_notes?: string[];
  overlay?: BurgOverlay | null;
  generated_at: string;
};

type MarkerIndex = {
  world_id: string;
  checksum: string;
  generated_at: string;
  markers: Array<{
    id: string;
    name: string;
    type: string;
    legend_text?: string;
    legend_html?: string;
    runes_text?: string;
    x?: number;
    y?: number;
    state_id_hint?: number;
    province_id_hint?: string;
    near_burg_ids_hint?: number[];
    tags: string[];
  }>;
};

/** ---------- Helpers ---------- */
export const dynamic = "force-dynamic"; // read local JSON at request time in dev

const ROOT = process.cwd();
const RENDERED_DIR = path.join(ROOT, "rendered");
const INDEX_DIR = path.join(ROOT, "index");

/** Safe read that gives a clear 404 if file missing */
async function readJsonSafe<T>(p: string): Promise<T> {
  try {
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw) as T;
  } catch (err: any) {
    if (err?.code === "ENOENT") {
      throw new Error(`File not found: ${p}`);
    }
    throw err;
  }
}

function pct(delta: number) {
  const sign = delta >= 0 ? "+" : "";
  // Show one decimal normally; two if tiny but non-zero
  const abs = Math.abs(delta * 100);
  const places = abs > 0 && abs < 0.5 ? 2 : 1;
  return `${sign}${abs.toFixed(places)}%`;
}

function badgeColor(delta: number) {
  return delta >= 0 ? "bg-emerald-100 text-emerald-800 ring-emerald-200" : "bg-rose-100 text-rose-800 ring-rose-200";
}

/** Map a file-system-ish path to a public URL under /public.
 * If your pipeline already writes into /public/assets, this just prepends a slash.
 */
function publicPath(p?: string) {
  if (!p) return null;
  if (p.startsWith("/")) return p;
  if (p.startsWith("assets/")) return `/${p}`;
  // allow project-root relative paths like "public/assets/...":
  const i = p.indexOf("/assets/");
  if (i >= 0) return p.slice(i);
  return null;
}

/** ---------- Tiny UI primitives (tailwind only) ---------- */
function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${className}`} >
      {children}
    </span>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <div className="rounded-xl border border-zinc-200/70 bg-white p-4 shadow-sm">{children}</div>
    </section>
  );
}
function KeyList({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return <p className="text-sm text-zinc-500">None</p>;
  return (
    <ul className="list-disc pl-5 text-sm">
      {items.map((t, i) => (
        <li key={`${t}-${i}`} className="leading-6">{t}</li>
      ))}
    </ul>
  );
}

/** ---------- Page ---------- */
export default async function BurgPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return <div className="p-8 text-rose-700 font-medium">Invalid burg id: {params.id}</div>;
  }

  // 1) Load rendered burg JSON
  const burgPath = path.join(RENDERED_DIR, "burg", `${id}.json`);
  let burg: RenderedBurg;
  try {
    burg = await readJsonSafe<RenderedBurg>(burgPath);
  } catch (e: any) {
    return <div className="p-8 text-rose-700 font-medium">Failed to load burg: {String(e.message || e)}</div>;
  }

  // 2) Load markers and filter to nearby
  let nearby: MarkerIndex["markers"] = [];
  try {
    const markers = await readJsonSafe<MarkerIndex>(path.join(INDEX_DIR, "markers.json"));
    nearby = (markers.markers || []).filter(m => (m.near_burg_ids_hint || []).includes(id));
  } catch {
    // markers index is optional; ignore if missing
  }

  // Derived overlay chips
  const ov = burg.overlay || undefined;
  const popMul = ov?.population_multiplier ?? 1;
  const tradeMul = ov?.state_trade_multiplier ?? 1;
  const popDelta = popMul - 1;
  const tradeDelta = tradeMul - 1;
  const law = ov?.law_enforcement?.status && ov.law_enforcement.status !== "none" ? ov.law_enforcement.status : null;
  const damaged = ov?.assets_destroyed?.length ? ov.assets_destroyed.length : 0;
  const heraldryUrl = publicPath(burg.heraldry_path || undefined);

  return (
    <main className="mx-auto max-w-6xl p-6 md:p-10 space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          {heraldryUrl ? (
            <img
              src={heraldryUrl}
              alt="Coat of Arms"
              className="h-20 w-16 sm:h-24 sm:w-20 rounded-md border border-zinc-200 bg-white p-1 object-contain"
            />
          ) : (
            <div className="h-20 w-16 sm:h-24 sm:w-20 rounded-md border border-dashed border-zinc-300 grid place-items-center text-xs text-zinc-500">
              No heraldry
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{burg.name}</h1>
            <p className="text-sm text-zinc-600">
              Burg {burg.burg_id}
              <span className="mx-2">•</span>
              State {burg.state_id}
              {burg.province_id ? (
                <>
                  <span className="mx-2">•</span>Province {burg.province_id}
                </>
              ) : null}
            </p>
            {burg.tags?.length ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {burg.tags.map((t, i) => (
                  <span key={`${t}-${i}`} className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Overlay chips */}
        <div className="flex flex-wrap items-center gap-2">
          <Pill className={badgeColor(popDelta)}>Population {pct(popDelta)}</Pill>
          <Pill className={badgeColor(tradeDelta)}>Trade {pct(tradeDelta)}</Pill>
          {law ? <Pill className="bg-amber-100 text-amber-900 ring-amber-200">Law: {law.replace(/_/g, " ")}</Pill> : null}
          {damaged ? <Pill className="bg-red-100 text-red-800 ring-red-200">Damaged: {damaged}</Pill> : null}
        </div>
      </header>

      {/* 2 columns */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Left: core info */}
        <div className="lg:col-span-3 space-y-6">
          <Section title="Economy Roles">
            <KeyList items={burg.economy_roles} />
          </Section>

          <Section title="Problems">
            <KeyList items={burg.problems} />
          </Section>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Section title="Culture Notes">
              <KeyList items={burg.culture_notes} />
            </Section>
            <Section title="Religious Presence">
              <KeyList items={burg.religion_presence} />
            </Section>
          </div>

          <Section title="Active Hooks">
            {!ov?.hooks_active || ov.hooks_active.length === 0 ? (
              <p className="text-sm text-zinc-500">None active here.</p>
            ) : (
              <ul className="space-y-2">
                {ov.hooks_active.map((h) => (
                  <li key={h.hook_instance_id} className="rounded-lg border border-zinc-200 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-800">
                        {h.chain_id}
                      </span>
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                        {h.hook_template_id}
                      </span>
                      <span className="text-[11px] text-zinc-500">({h.hook_instance_id})</span>
                    </div>
                    {h.rationale ? <p className="mt-1 text-sm text-zinc-700">{h.rationale}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        {/* Right: markers */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="Nearby Mysterious Markers">
            {!nearby.length ? (
              <p className="text-sm text-zinc-500">No indexed markers near this burg.</p>
            ) : (
              <ul className="space-y-4">
                {nearby.map((m) => (
                  <li key={m.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold">{m.name}</h3>
                        <p className="text-xs text-zinc-500">type: {m.type}</p>
                      </div>
                      <div className="flex flex-wrap justify-end gap-1">
                        {m.tags?.slice(0, 6).map((t, i) => (
                          <span key={`${m.id}-tag-${i}`} className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    {m.legend_text ? (
                      <p className="mt-2 text-sm text-zinc-700">
                        {m.legend_text.length > 220 ? `${m.legend_text.slice(0, 220)}…` : m.legend_text}
                      </p>
                    ) : null}
                    {m.runes_text ? (
                      <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-zinc-900 p-3 text-[12px] leading-5 text-zinc-100">
{m.runes_text}
                      </pre>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600">
            <p><strong>Generated:</strong> {new Date(burg.generated_at).toLocaleString()}</p>
            {ov?.generated_at ? <p><strong>Overlay:</strong> {new Date(ov.generated_at).toLocaleString()}</p> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
