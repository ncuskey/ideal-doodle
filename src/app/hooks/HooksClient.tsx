'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Confirm from '@/components/ui/Confirm';
import { useToast } from '@/components/ui/Toast';

export default function HooksClient({ suggestions, instances }:{ suggestions:any[]; instances:any[] }){
  const { show } = useToast();
  const [busy,setBusy] = useState<string|null>(null);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold">Suggestions</h3>
        {!suggestions.length? <p className="text-sm text-zinc-500">No suggestions.</p> : (
          <form className="mt-3 space-y-3" onSubmit={async(e)=>{
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const picked = suggestions.map((s:any)=> (form.elements.namedItem(s.sugg_id) as HTMLInputElement)?.checked ? s.sugg_id : null).filter(Boolean);
            if (!picked.length) return;
            setBusy('accept');
            const res = await fetch('/api/hooks/accept',{method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({suggIds:picked})});
            setBusy(null);
            show({ kind: res.ok? 'success':'error', title: res.ok? 'Accepted suggestions' : 'Failed to accept suggestions' });
          }}>
            <ul className="space-y-2">
              {suggestions.map(s=> (
                <li key={s.sugg_id} className="flex items-start gap-3 rounded-lg border p-3">
                  <input type="checkbox" name={s.sugg_id} className="mt-1 h-5 w-5" aria-label={`Accept ${s.hook_template_id} for burg ${s.burg_id}`}/>
                  <div>
                    <div className="text-sm"><strong>{s.hook_template_id}</strong> → burg {s.burg_id} (state {s.state_id})</div>
                    <div className="text-xs text-zinc-500">{s.rationale}</div>
                  </div>
                </li>
              ))}
            </ul>
            <Button type="submit" disabled={busy==='accept'}>
              {busy==='accept'? (<span className="inline-flex items-center gap-2"><Spinner/> Accepting…</span>) : 'Accept selected'}
            </Button>
          </form>
        )}
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h3 className="text-base font-semibold">Instances</h3>
        {!instances.length? <p className="text-sm text-zinc-500">No instances.</p> : (
          <ul className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            {instances.map((h:any)=> (
              <li key={h.hook_instance_id} className="rounded-lg border p-3">
                <div className="text-sm"><strong>{h.chain_id}</strong> · {h.hook_template_id}</div>
                <div className="text-xs text-zinc-500">burg {h.burg_id} · state {h.state_id} · status {h.status}</div>
                <Confirm message="Activate this chain and withdraw sibling entries?" onConfirm={async()=>{
                  setBusy(h.hook_instance_id);
                  await fetch('/api/quests/activate',{method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ chain: h.chain_id, hook: h.hook_instance_id })});
                  await fetch('/api/ops/overlays/build',{method:'POST'});
                  await fetch('/api/ops/render/dirty',{method:'POST'});
                  setBusy(null);
                  show({ kind:'success', title:'Chain activated. Overlays rebuilt.' });
                }}>
                  <Button disabled={busy===h.hook_instance_id}>
                    {busy===h.hook_instance_id? (<span className="inline-flex items-center gap-2"><Spinner/> Activating…</span>) : 'Activate'}
                  </Button>
                </Confirm>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
