function pct(n: number) { const sign = n >= 0 ? "+" : ""; const abs = Math.abs(n * 100); const places = abs > 0 && abs < 0.5 ? 2 : 1; return `${sign}${abs.toFixed(places)}%`; }
function pill({ text, className = "" }: { text: string; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${className}`}>{text}</span>;
}
export default function OverlayPills({ kind, popMul, tradeMul, law, damaged }: { kind: "state" | "burg"; popMul?: number; tradeMul?: number; law?: string | null; damaged?: number; }) {
  const pop = typeof popMul === "number" ? popMul - 1 : undefined;
  const trade = typeof tradeMul === "number" ? tradeMul - 1 : undefined;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {pop !== undefined && kind === "burg" && pill({ text: `Population ${pct(pop)}`, className: pop >= 0 ? "bg-emerald-100 text-emerald-800 ring-emerald-200" : "bg-rose-100 text-rose-800 ring-rose-200" })}
      {trade !== undefined && pill({ text: `Trade ${pct(trade)}`, className: trade >= 0 ? "bg-emerald-100 text-emerald-800 ring-emerald-200" : "bg-rose-100 text-rose-800 ring-rose-200" })}
      {law && law !== "none" && pill({ text: `Law: ${law.replace(/_/g, " ")}`, className: "bg-amber-100 text-amber-900 ring-amber-200" })}
      {typeof damaged === "number" && damaged > 0 && pill({ text: `Damaged: ${damaged}`, className: "bg-red-100 text-red-800 ring-red-200" })}
    </div>
  );
}
