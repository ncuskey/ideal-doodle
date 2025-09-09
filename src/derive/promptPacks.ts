import fs from "fs/promises";

async function read(p:string){ return JSON.parse(await fs.readFile(p,"utf8")); }

export async function buildStatePromptPack(id:number) {
  const base = await read(`facts/state/${id}.json`);
  const drv = await read(`facts/derived/state/${id}.json`).catch(()=>({}));
  const world = await read(`facts/world/world.json`);
  const pack = {
    entity: { type:"state", id },
    world: { era: world.era, year: world.year, mapName: world.mapName },
    state: {
      name: base.name, capitalBurgId: base.capitalBurgId,
      population: base.population, area: base.area, military: base.military,
      neighbors: base.neighbors
    },
    geography: {
      hasCoast: drv.hasCoast, riverCount: drv.riverCount,
      dominantBiomes: drv.dominantBiomes, meanTemp: drv.meanTemp, meanPrec: drv.meanPrec
    },
    society: {
      dominantReligions: drv.dominantReligions,
      dominantCultures: drv.dominantCultures
    },
    economy: {
      ports: drv.portCount, routeHubs: drv.routeHubs, topBurgs: drv.topBurgs
    }
  };
  await fs.mkdir("index/promptFacts/state", { recursive: true });
  await fs.writeFile(`index/promptFacts/state/${id}.json`, JSON.stringify(pack,null,2));
}

export async function buildBurgPromptPack(id:number) {
  const base = await read(`facts/burg/${id}.json`);
  const drv = await read(`facts/derived/burg/${id}.json`).catch(()=>({}));
  const state = base.stateId!=null ? await read(`facts/state/${base.stateId}.json`) : null;
  const sdrv = state ? await read(`facts/derived/state/${state.id}.json`).catch(()=>({})) : null;
  const pack = {
    entity: { type:"burg", id },
    burg: { name: base.name, pop: base.pop, port: base.port, isCapital: drv.isCapital },
    state: state ? { id: state.id, name: state.name } : null,
    trade: { degree: drv.degree, connectedBurgIds: drv.connectedBurgIds },
    context: sdrv ? {
      stateDominantBiomes: sdrv.dominantBiomes,
      stateDominantReligions: sdrv.dominantReligions,
      stateDominantCultures: sdrv.dominantCultures
    } : null
  };
  await fs.mkdir("index/promptFacts/burg", { recursive: true });
  await fs.writeFile(`index/promptFacts/burg/${id}.json`, JSON.stringify(pack,null,2));
}
