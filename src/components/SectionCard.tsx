/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

export default function SectionCard({ title, href, desc, img }:{ title:string; href:string; desc:string; img?:string }){
  return (
    <Link href={href} className="group block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-blue-500">
      <div className="flex items-center gap-3">
        {img && <img src={img} alt="" className="h-10 w-10 rounded-md object-cover" />}
        <div>
          <h3 className="text-sm font-semibold group-hover:text-blue-700">{title}</h3>
          <p className="mt-0.5 text-xs text-zinc-500">{desc}</p>
        </div>
      </div>
    </Link>
  );
}
