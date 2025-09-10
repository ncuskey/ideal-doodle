'use client';
import { useState } from 'react';
import Button from './Button';

export default function Confirm({ title='Are you sure?', message, onConfirm, busy=false, children }:{
  title?: string; message?: string; onConfirm: ()=>Promise<void>|void; busy?: boolean; children: React.ReactNode;
}){
  const [open,setOpen] = useState(false);
  return (
    <>
      <span onClick={()=>setOpen(true)}>{children}</span>
      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-lg">
            <h3 className="text-base font-semibold">{title}</h3>
            {message && <p className="mt-1 text-sm text-zinc-600">{message}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={()=>setOpen(false)}>Cancel</Button>
              <Button variant="danger" onClick={async()=>{ await onConfirm(); setOpen(false); }}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
