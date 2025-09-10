import { readJson } from "@/lib/fsjson";
import { dirs } from "@/lib/paths";
import DataTable from "@/components/DataTable";

export default async function StatesPage() {
  // Try to get states data from JSON files (fallback for build time)
  const catalog = await readJson<{ states: any[] }>(dirs.index("catalog.json")).catch(() => ({ states: [] }));
  const rows = catalog.states || [];

  // Generate HTML for each row
  const rowsWithHtml = rows.map(row => ({
    ...row,
    heraldry_html: row.heraldry_svg_url 
      ? `<img src="/${row.heraldry_svg_url}" alt="Heraldry for ${row.name}" class="h-8 w-6 rounded border border-zinc-200 bg-white p-0.5 object-contain" />`
      : `<div class="h-8 w-6 rounded border border-dashed border-zinc-300 grid place-items-center text-[10px] text-zinc-500">No heraldry</div>`,
    name_html: `<a class="hover:underline" href="/states/${row.state_id}">${row.name}</a>`,
    economy_html: "—", // Will be populated from other data sources
    overlay_html: "" // Will be populated from other data sources
  }));

  return (
    <main className="space-y-6">
      <h2 className="text-lg font-semibold">States</h2>
      <DataTable
        rows={rowsWithHtml}
        searchKeys={["name"]}
        caption="States list"
        columns={[
          { header: "", key: "heraldry_html", render: "heraldry_html" },
          { header: "Name", key: "name_html", render: "name_html" },
          { header: "Summary", key: "summary", render: "summary" },
          { header: "Overlay", key: "overlay_html", render: "overlay_html" }
        ]}
      />
    </main>
  );
}

function generateOverlayHtml(kind: "state" | "burg", tradeMul?: number, law?: string | null): string {
  const pills: string[] = [];
  
  if (typeof tradeMul === "number") {
    const trade = tradeMul - 1;
    const sign = trade >= 0 ? "+" : "";
    const abs = Math.abs(trade * 100);
    const places = abs > 0 && abs < 0.5 ? 2 : 1;
    const pct = `${sign}${abs.toFixed(places)}%`;
    const className = trade >= 0 ? "bg-emerald-100 text-emerald-800 ring-emerald-200" : "bg-rose-100 text-rose-800 ring-rose-200";
    pills.push(`<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${className}">Trade ${pct}</span>`);
  }
  
  if (law && law !== "none") {
    pills.push(`<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset bg-amber-100 text-amber-900 ring-amber-200">Law: ${law.replace(/_/g, " ")}</span>`);
  }
  
  return `<div class="flex flex-wrap items-center gap-1.5">${pills.join("")}</div>`;
}
