/* Lightweight table with optional search filter (client component) */
"use client";
import { useMemo, useState } from "react";

export default function DataTable<T>({ rows, columns, searchKeys = [], placeholder = "Search...", caption }: {
  rows: T[];
  columns: Array<{ key: keyof T | string; header: string; render?: string }>;
  searchKeys?: Array<keyof T | string>;
  placeholder?: string;
  caption?: string;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase(); if (!s) return rows;
    return rows.filter((r: any) => searchKeys.some(k => String((r as any)[k as any] ?? "").toLowerCase().includes(s)));
  }, [rows, q, searchKeys]);

  return (
    <div className="space-y-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder}
        className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" 
        aria-label="Search table" />
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="bg-zinc-50">
            <tr>
              {columns.map((c, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold text-zinc-600">{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} className="border-t border-zinc-100 hover:bg-zinc-50/80">
                {columns.map((c, j) => (
                  <td key={j} className="px-3 py-2 align-top" dangerouslySetInnerHTML={{ __html: c.render ? (r as any)[c.render] : String((r as any)[c.key as any]) }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
