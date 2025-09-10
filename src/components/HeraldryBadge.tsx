/* eslint-disable @next/next/no-img-element */
import { dirs } from "@/lib/paths";

export default function HeraldryBadge({ path, className = "h-10 w-8" }: { path?: string | null; className?: string }) {
  const url = path ? dirs.publicAsset(path) : null;
  return url ? (
    <img src={url} alt="Coat of Arms" className={`${className} rounded border border-zinc-200 bg-white p-0.5 object-contain`} />
  ) : (
    <div className={`${className} rounded border border-dashed border-zinc-300 grid place-items-center text-[10px] text-zinc-500`}>No heraldry</div>
  );
}
