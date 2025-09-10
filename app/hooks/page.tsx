import { readJson } from '@/lib/fsjson';
import { dirs } from '@/lib/paths';
import HooksClient from '@/app/hooks/HooksClient';

export default async function HooksPage(){
  const linkSug = await readJson<{ hook_placements:any[] }>(dirs.index('link_suggestions.json')).catch(()=>({hook_placements:[]}));
  const hooksAvail = await readJson<{ items:any[] }>(dirs.state('hooks_available.json')).catch(()=>({items:[]}));
  return <HooksClient suggestions={linkSug.hook_placements} instances={hooksAvail.items}/>;
}
