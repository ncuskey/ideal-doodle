export default function HookBadge({ chainId, templateId, status }: { chainId: string; templateId: string; status: string }) {
  const color = status === "active" ? "bg-indigo-100 text-indigo-800" : status === "withdrawn" ? "bg-zinc-100 text-zinc-700" : "bg-emerald-100 text-emerald-800";
  return (
    <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${color}`}>{chainId} · {templateId}</span>
  );
}
