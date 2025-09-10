'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/states', label: 'States' },
  { href: '/provinces', label: 'Provinces' },
  { href: '/burgs', label: 'Burgs' },
  { href: '/markers', label: 'Markers' },
  { href: '/hooks', label: 'Hooks' },
  { href: '/events', label: 'Events' },
  { href: '/qa', label: 'QA' }
];

export default function NavBar(){
  const path = usePathname();
  return (
    <nav aria-label="Primary" className="flex flex-wrap gap-2 text-sm">
      {NAV.map(item=>{
        const active = path === item.href || (item.href !== '/' && path?.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href}
            className={`rounded-md px-2.5 py-2 min-h-11 inline-flex items-center ${active? 'bg-[var(--brand-100)] text-[var(--brand-700)]' : 'text-zinc-700 hover:bg-zinc-100'}`}
            aria-current={active? 'page':undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
