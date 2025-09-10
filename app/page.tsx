import fs from 'node:fs/promises';
import path from 'node:path';
import ParallaxHero from '@/components/ParallaxHero';
import ScrollReveal from '@/components/ScrollReveal';
import { Stat } from '@/components/Stat';
import SectionCard from '@/components/SectionCard';

async function readJson<T>(p:string, fallback:T): Promise<T> {
  try { return JSON.parse(await fs.readFile(p, 'utf8')) as T; } catch { return fallback; }
}

export default async function Landing() {
  // Fallbacks if indexes are missing
  const statesDir = path.join(process.cwd(), 'rendered', 'state');
  const burgDir = path.join(process.cwd(), 'rendered', 'burg');
  const markersPath = path.join(process.cwd(), 'index', 'markers.json');

  const [stateFiles, burgFiles, markers] = await Promise.all([
    fs.readdir(statesDir).catch(()=>[]),
    fs.readdir(burgDir).catch(()=>[]),
    readJson<{ markers:any[] }>(markersPath, { markers: [] })
  ]);

  const stateCount = stateFiles.filter(f=>f.endsWith('.json')).length;
  const burgCount = burgFiles.filter(f=>f.endsWith('.json')).length;
  const markerCount = markers.markers?.length || 0;

  return (
    <div className="space-y-10">
      <ParallaxHero />

      <ScrollReveal>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat label="States" value={stateCount} />
          <Stat label="Burgs" value={burgCount} />
          <Stat label="Mysterious Markers" value={markerCount} />
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SectionCard title="Browse States" href="/states" desc="See heraldry, culture, and economy pillars." />
          <SectionCard title="Browse Provinces" href="/provinces" desc="Drill into regions and their linked burgs." />
          <SectionCard title="Browse Burgs" href="/burgs" desc="Open a burg to view maps, hooks, and overlays." />
          <SectionCard title="Markers & Obelisks" href="/markers" desc="Legends, runes, and nearby burg relations." />
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Discover by Mood</h2>
          <p className="mt-1 text-sm text-zinc-500">Jump in by theme, not just geography—like Airbnb's experience filters.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Coastal towns','Trade hubs','Borderlands','Ruined cities','Scholarly enclaves','Holy sites'].map(tag => (
              <a key={tag} href={`/burgs?tag=${encodeURIComponent(tag)}`} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-50">{tag}</a>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-blue-50 p-6">
          <h2 className="text-lg font-semibold">Quest Chains</h2>
          <p className="mt-1 text-sm text-zinc-500">Some hooks branch into chains with multiple entry points. Activate from a burg; siblings auto-withdraw to avoid duplicates.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="/hooks" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">View Hooks</a>
            <a href="/events" className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50">Simulate Events</a>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
