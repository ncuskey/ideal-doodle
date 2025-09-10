'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Confirm from '@/components/ui/Confirm';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';

export default function EventsPage(){
  const { show } = useToast();
  const [id,setId] = useState('');
  const [busy,setBusy] = useState<'plan'|'apply'|null>(null);
  return (
    <main className="space-y-6">
      <h2 className="text-lg font-semibold">Events</h2>
      <div className="rounded-xl border bg-white p-4">
        <label className="block text-xs text-zinc-500">Action ID</label>
        <input value={id} onChange={e=>setId(e.target.value)} placeholder="act_2025_09_08_portgrey_arson" className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-sm" />
        <div className="mt-3 flex gap-2">
          <Button onClick={async()=>{ setBusy('plan'); await fetch('/api/events/plan',{method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ id })}); setBusy(null); show({kind:'info', title:'Planned effects generated.'}); }} disabled={!id || busy==='plan'}>
            {busy==='plan'? (<span className="inline-flex items-center gap-2"><Spinner/> Planning…</span>) : 'Plan Effects'}
          </Button>
          <Confirm message="Apply effects, rebuild overlays, render dirty? This can be rolled back via your rollback script." onConfirm={async()=>{
            setBusy('apply');
            await fetch('/api/events/apply',{method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ id })});
            await fetch('/api/ops/overlays/build',{method:'POST'});
            await fetch('/api/ops/render/dirty',{method:'POST'});
            setBusy(null);
            show({kind:'success', title:'Applied. Overlays rebuilt.'});
          }}>
            <Button variant="danger" disabled={!id || busy==='apply'}>
              {busy==='apply'? (<span className="inline-flex items-center gap-2"><Spinner/> Applying…</span>) : 'Apply → Overlays → Render'}
            </Button>
          </Confirm>
        </div>
        <p className="mt-2 text-xs text-zinc-600">Tip: expose a `/api/events/rollback` that wraps your rollback script, then show a toast with an "Undo" button for 10s.</p>
      </div>
    </main>
  );
}
