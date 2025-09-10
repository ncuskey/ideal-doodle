export function Stat({ label, value }:{ label:string; value:string|number }){
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
    </div>
  );
}
