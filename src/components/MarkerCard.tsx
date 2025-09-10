export default function MarkerCard({ m }: { m: { id: string; name: string; type: string; legend_text?: string; runes_text?: string; tags?: string[] } }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">{m.name}</h3>
          <p className="text-xs text-zinc-500">type: {m.type}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          {m.tags?.slice(0, 6).map((t, i) => (
            <span key={`${m.id}-tag-${i}`} className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700">{t}</span>
          ))}
        </div>
      </div>
      {m.legend_text ? (
        <p className="mt-2 text-sm text-zinc-700">{m.legend_text.length > 220 ? `${m.legend_text.slice(0, 220)}…` : m.legend_text}</p>
      ) : null}
      {m.runes_text ? (
        <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-zinc-900 p-3 text-[12px] leading-5 text-zinc-100">{m.runes_text}</pre>
      ) : null}
    </div>
  );
}
