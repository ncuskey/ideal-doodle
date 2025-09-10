import HookBadge from "./HookBadge";
import { HookInstance } from "@/lib/types";

export default function HookList({ items }: { items: HookInstance[] }) {
  if (!items?.length) return <p className="text-sm text-zinc-500">None.</p>;
  return (
    <ul className="space-y-2">
      {items.map(h => (
        <li key={h.hook_instance_id} className="rounded-lg border border-zinc-200 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <HookBadge chainId={h.chain_id} templateId={h.hook_template_id} status={h.status} />
            <span className="text-[11px] text-zinc-500">({h.hook_instance_id})</span>
          </div>
          {h.rationale ? <p className="mt-1 text-sm text-zinc-700">{h.rationale}</p> : null}
        </li>
      ))}
    </ul>
  );
}
