import Link from 'next/link';

export default function Breadcrumbs({ items }:{ items: Array<{ href?: string; label: string }> }){
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-zinc-600">
      {items.map((it,i)=> (
        <span key={i}>
          {it.href? <Link className="hover:underline" href={it.href}>{it.label}</Link> : <span className="text-zinc-800">{it.label}</span>}
          {i < items.length-1 && <span className="mx-1">›</span>}
        </span>
      ))}
    </nav>
  );
}
