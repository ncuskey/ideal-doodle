/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import { db } from '../src/db/client';
import { states, provinces, burgs, markers } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const read = <T=any>(p:string) => JSON.parse(fs.readFileSync(p,'utf8'));

async function importStates() {
  const dir = 'lore/state';
  if (!fs.existsSync(dir)) return;
  console.log('Importing states...');
  
  for (const f of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))) {
    const j = read<any>(path.join(dir,f));
    await db
      .insert(states)
      .values({
        stateId: j.entity.id,
        name: j.entity.type === 'state' ? `State_${j.entity.id}` : j.name || `State_${j.entity.id}`,
        slug: String(j.entity.id),
        summary: j.summary ?? null,
        heraldrySvgUrl: null, // Will be populated from heraldry data if available
      })
      .onConflictDoUpdate({
        target: states.stateId,
        set: { 
          name: j.entity.type === 'state' ? `State_${j.entity.id}` : j.name || `State_${j.entity.id}`, 
          slug: String(j.entity.id), 
          summary: j.summary ?? null, 
          heraldrySvgUrl: null 
        }
      });
  }
  console.log('States imported.');
}

async function importProvinces() {
  const dir = 'canon/province';
  if (!fs.existsSync(dir)) return;
  console.log('Importing provinces...');
  
  for (const f of fs.readdirSync(dir).filter(x=>x.endsWith('.outline.json'))) {
    const j = read<any>(path.join(dir,f));
    await db
      .insert(provinces)
      .values({
        stateId: j.state_id,
        provinceId: parseInt(j.province_id.replace('prov_', '').split('_')[0]) || 0, // Extract numeric ID
        name: j.name,
        slug: j.province_id,
        summary: j.role_in_state ?? null,
      })
      .onConflictDoUpdate({
        target: [provinces.stateId, provinces.provinceId],
        set: { 
          name: j.name, 
          slug: j.province_id, 
          summary: j.role_in_state ?? null 
        }
      });
  }
  console.log('Provinces imported.');
}

async function importBurgs() {
  const dir = 'rendered/burg';
  if (!fs.existsSync(dir)) return;
  console.log('Importing burgs...');
  
  for (const f of fs.readdirSync(dir).filter(x=>x.endsWith('.json'))) {
    const j = read<any>(path.join(dir,f));
    await db
      .insert(burgs)
      .values({
        burgId: j.burg_id,
        stateId: j.state_id,
        provinceId: j.province_id === 'unknown' ? 0 : parseInt(j.province_id) || 0,
        name: j.name,
        kind: j.population > 1500 ? 'city' : 'village',
        population: j.population ?? null,
        lat: null, lon: null, // Not available in current data
        citySvgUrl: j.maps?.city_svg_path ?? null,
        villageSvgUrl: j.maps?.village_svg_path ?? null,
        watabouUrl: j.maps?.watabou_url ?? null,
      })
      .onConflictDoUpdate({
        target: burgs.burgId,
        set: {
          name: j.name, 
          kind: j.population > 1500 ? 'city' : 'village', 
          population: j.population ?? null,
          lat: null, lon: null,
          citySvgUrl: j.maps?.city_svg_path ?? null,
          villageSvgUrl: j.maps?.village_svg_path ?? null,
          watabouUrl: j.maps?.watabou_url ?? null,
        }
      });
  }
  console.log('Burgs imported.');
}

async function importMarkers() {
  const idxPath = 'index/markers.json';
  if (!fs.existsSync(idxPath)) return;
  console.log('Importing markers...');
  
  const idx = read<any>(idxPath);
  const items = idx.items || idx; // Handle different JSON structures
  
  for (const m of items) {
    if (m.id && m.name && m.type) {
      await db.insert(markers)
        .values({
          id: parseInt(m.id.replace(/\D/g, '')) || 0, // Extract numeric ID
          name: m.name, 
          type: m.type,
          description: m.description ?? m.legend_text ?? null, 
          runeHtml: m.rune_html ?? null,
          stateId: m.state_id ?? null, 
          provinceId: m.province_id ?? null, 
          burgId: m.burg_id ?? null
        })
        .onConflictDoUpdate({
          target: markers.id,
          set: {
            name: m.name, 
            type: m.type, 
            description: m.description ?? m.legend_text ?? null, 
            runeHtml: m.rune_html ?? null,
            stateId: m.state_id ?? null, 
            provinceId: m.province_id ?? null, 
            burgId: m.burg_id ?? null
          }
        });
    }
  }
  console.log('Markers imported.');
}

(async()=>{
  try {
    await importStates();
    await importProvinces();
    await importBurgs();
    await importMarkers();
    console.log('Import complete.');
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
})();
