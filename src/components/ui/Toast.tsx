'use client';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Toast = { id: number; title: string; kind?: 'success'|'error'|'info' };
const Ctx = createContext<{ show:(t:Omit<Toast,'id'>)=>void }>({ show: ()=>{} });

export function ToastProvider({ children }:{ children: React.ReactNode }){
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((t: Omit<Toast,'id'>)=> setToasts(prev=>[...prev, { id: Date.now()+Math.random(), ...t }]), []);
  const remove = useCallback((id:number)=> setToasts(prev=> prev.filter(t=>t.id!==id)),[]);
  const value = useMemo(()=>({ show }),[show]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t=> (
          <div key={t.id} role="status" className={`fade-in rounded-md border px-3 py-2 text-sm shadow ${t.kind==='error'?'border-red-300 bg-red-50 text-red-800': t.kind==='success'?'border-emerald-300 bg-emerald-50 text-emerald-800':'border-[var(--border)] bg-white text-zinc-800'}`}>
            <div className="flex items-center gap-3">
              <span>{t.title}</span>
              <button onClick={()=>remove(t.id)} className="ml-auto text-xs text-zinc-500 hover:underline">Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export function useToast(){ return useContext(Ctx); }
