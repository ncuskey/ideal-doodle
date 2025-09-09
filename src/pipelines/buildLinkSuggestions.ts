import fs from "fs/promises";
import path from "path";
import { hashOf } from "../util/hash.js";

interface LinkSuggestion {
  sugg_id: string;
  type: "religion_link" | "culture_link" | "trade_link" | "migration_link" | "myth_link" | "scholar_link";
  a: {
    kind: "province" | "burg";
    id: string | number;
    state_id: number;
    label: string;
  };
  b: {
    kind: "province" | "burg";
    id: string | number;
    state_id: number;
    label: string;
  };
  score: number;
  rationale: string;
  evidence?: object;
  impact_scope: "local" | "regional" | "state" | "interstate";
}

interface HookPlacement {
  sugg_id: string;
  hook_template_id: string;
  burg_id: number;
  state_id: number;
  score: number;
  rationale: string;
}

interface LinkSuggestions {
  world_id: string;
  checksum: string;
  generated_at: string;
  affinities: LinkSuggestion[];
  hook_placements: HookPlacement[];
}

interface StateFacts {
  id: number;
  name: string;
  neighbors?: number[];
  area?: number;
}

interface BurgFacts {
  id: number;
  name: string;
  stateId?: number | null;
  pop?: number;
  port?: boolean;
  x?: number;
  y?: number;
}

interface StateDerived {
  id: number;
  dominantReligions: Array<{ religion: string; count: number }>;
  dominantCultures: Array<{ culture: string; count: number }>;
  topBurgs: number[];
  portCount: number;
  hasCoast: boolean;
  riverCount: number;
  routeHubs: number[];
}

interface BurgDerived {
  id: number;
  degree: number;
  connectedBurgIds: number[];
  isCapital: boolean;
}

function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function generateSuggestionId(type: string, aId: string | number, bId: string | number): string {
  return `${type}_${aId}_${bId}`;
}

async function loadFacts(): Promise<{
  states: StateFacts[];
  burgs: BurgFacts[];
  stateDerived: Map<number, StateDerived>;
  burgDerived: Map<number, BurgDerived>;
}> {
  // Load state facts
  const stateFiles = await fs.readdir("facts/state").catch(() => []);
  const states: StateFacts[] = [];
  for (const file of stateFiles) {
    if (file.endsWith(".json")) {
      const content = await fs.readFile(`facts/state/${file}`, "utf8");
      states.push(JSON.parse(content));
    }
  }

  // Load burg facts
  const burgFiles = await fs.readdir("facts/burg").catch(() => []);
  const burgs: BurgFacts[] = [];
  for (const file of burgFiles) {
    if (file.endsWith(".json")) {
      const content = await fs.readFile(`facts/burg/${file}`, "utf8");
      burgs.push(JSON.parse(content));
    }
  }

  // Load state derived facts
  const stateDerived = new Map<number, StateDerived>();
  const stateDerivedFiles = await fs.readdir("facts/derived/state").catch(() => []);
  for (const file of stateDerivedFiles) {
    if (file.endsWith(".json")) {
      const content = await fs.readFile(`facts/derived/state/${file}`, "utf8");
      const derived = JSON.parse(content);
      stateDerived.set(derived.id, derived);
    }
  }

  // Load burg derived facts
  const burgDerived = new Map<number, BurgDerived>();
  const burgDerivedFiles = await fs.readdir("facts/derived/burg").catch(() => []);
  for (const file of burgDerivedFiles) {
    if (file.endsWith(".json")) {
      const content = await fs.readFile(`facts/derived/burg/${file}`, "utf8");
      const derived = JSON.parse(content);
      burgDerived.set(derived.id, derived);
    }
  }

  return { states, burgs, stateDerived, burgDerived };
}

function generateReligionLinks(
  states: StateFacts[],
  stateDerived: Map<number, StateDerived>
): LinkSuggestion[] {
  const suggestions: LinkSuggestion[] = [];
  
  for (let i = 0; i < states.length; i++) {
    for (let j = i + 1; j < states.length; j++) {
      const stateA = states[i];
      const stateB = states[j];
      const derivedA = stateDerived.get(stateA.id);
      const derivedB = stateDerived.get(stateB.id);
      
      if (!derivedA || !derivedB) continue;
      
      // Find common religions
      const religionsA = new Set(derivedA.dominantReligions.map(r => r.religion));
      const religionsB = new Set(derivedB.dominantReligions.map(r => r.religion));
      const commonReligions = [...religionsA].filter(r => religionsB.has(r));
      
      if (commonReligions.length > 0) {
        const score = Math.min(commonReligions.length * 0.3, 1.0);
        const impactScope = stateA.neighbors?.includes(stateB.id) ? "regional" : "interstate";
        
        suggestions.push({
          sugg_id: generateSuggestionId("religion_link", stateA.id, stateB.id),
          type: "religion_link",
          a: {
            kind: "province",
            id: stateA.id,
            state_id: stateA.id,
            label: stateA.name
          },
          b: {
            kind: "province", 
            id: stateB.id,
            state_id: stateB.id,
            label: stateB.name
          },
          score,
          rationale: `Both states share ${commonReligions.length} dominant religion(s): ${commonReligions.join(", ")}`,
          evidence: { commonReligions },
          impact_scope: impactScope
        });
      }
    }
  }
  
  return suggestions;
}

function generateCultureLinks(
  states: StateFacts[],
  stateDerived: Map<number, StateDerived>
): LinkSuggestion[] {
  const suggestions: LinkSuggestion[] = [];
  
  for (let i = 0; i < states.length; i++) {
    for (let j = i + 1; j < states.length; j++) {
      const stateA = states[i];
      const stateB = states[j];
      const derivedA = stateDerived.get(stateA.id);
      const derivedB = stateDerived.get(stateB.id);
      
      if (!derivedA || !derivedB) continue;
      
      // Find common cultures
      const culturesA = new Set(derivedA.dominantCultures.map(c => c.culture));
      const culturesB = new Set(derivedB.dominantCultures.map(c => c.culture));
      const commonCultures = [...culturesA].filter(c => culturesB.has(c));
      
      if (commonCultures.length > 0) {
        const score = Math.min(commonCultures.length * 0.3, 1.0);
        const impactScope = stateA.neighbors?.includes(stateB.id) ? "regional" : "interstate";
        
        suggestions.push({
          sugg_id: generateSuggestionId("culture_link", stateA.id, stateB.id),
          type: "culture_link",
          a: {
            kind: "province",
            id: stateA.id,
            state_id: stateA.id,
            label: stateA.name
          },
          b: {
            kind: "province",
            id: stateB.id,
            state_id: stateB.id,
            label: stateB.name
          },
          score,
          rationale: `Both states share ${commonCultures.length} dominant culture(s): ${commonCultures.join(", ")}`,
          evidence: { commonCultures },
          impact_scope: impactScope
        });
      }
    }
  }
  
  return suggestions;
}

function generateTradeLinks(
  burgs: BurgFacts[],
  burgDerived: Map<number, BurgDerived>
): LinkSuggestion[] {
  const suggestions: LinkSuggestion[] = [];
  
  // Group burgs by state
  const burgsByState = new Map<number, BurgFacts[]>();
  for (const burg of burgs) {
    if (burg.stateId != null) {
      if (!burgsByState.has(burg.stateId)) {
        burgsByState.set(burg.stateId, []);
      }
      burgsByState.get(burg.stateId)!.push(burg);
    }
  }
  
  // Find trade links between ports and high-degree burgs
  for (const [stateIdA, burgsA] of burgsByState) {
    for (const [stateIdB, burgsB] of burgsByState) {
      if (stateIdA >= stateIdB) continue; // Avoid duplicates
      
      for (const burgA of burgsA) {
        for (const burgB of burgsB) {
          const derivedA = burgDerived.get(burgA.id);
          const derivedB = burgDerived.get(burgB.id);
          
          if (!derivedA || !derivedB) continue;
          
          let score = 0;
          let rationale = "";
          
          // Port-to-port trade
          if (burgA.port && burgB.port) {
            score += 0.8;
            rationale += "Both are port cities, enabling maritime trade. ";
          }
          
          // High-degree burg connections
          if (derivedA.degree > 2 && derivedB.degree > 2) {
            score += 0.4;
            rationale += "Both are well-connected trade hubs. ";
          }
          
          // Distance factor (closer is better for trade)
          if (burgA.x != null && burgA.y != null && burgB.x != null && burgB.y != null) {
            const distance = calculateDistance(burgA.x, burgA.y, burgB.x, burgB.y);
            const distanceScore = Math.max(0, 1 - distance / 1000); // Normalize distance
            score += distanceScore * 0.3;
            rationale += `Geographic proximity favors trade routes. `;
          }
          
          if (score > 0.3) {
            const impactScope = stateIdA === stateIdB ? "local" : 
                               (Math.abs(stateIdA - stateIdB) <= 2 ? "regional" : "interstate");
            
            suggestions.push({
              sugg_id: generateSuggestionId("trade_link", burgA.id, burgB.id),
              type: "trade_link",
              a: {
                kind: "burg",
                id: burgA.id,
                state_id: stateIdA,
                label: burgA.name
              },
              b: {
                kind: "burg",
                id: burgB.id,
                state_id: stateIdB,
                label: burgB.name
              },
              score: Math.min(score, 1.0),
              rationale: rationale.trim(),
              evidence: {
                burgA_port: burgA.port,
                burgB_port: burgB.port,
                burgA_degree: derivedA.degree,
                burgB_degree: derivedB.degree
              },
              impact_scope: impactScope
            });
          }
        }
      }
    }
  }
  
  return suggestions;
}

function generateMigrationLinks(
  burgs: BurgFacts[],
  burgDerived: Map<number, BurgDerived>
): LinkSuggestion[] {
  const suggestions: LinkSuggestion[] = [];
  
  // Group burgs by state
  const burgsByState = new Map<number, BurgFacts[]>();
  for (const burg of burgs) {
    if (burg.stateId != null) {
      if (!burgsByState.has(burg.stateId)) {
        burgsByState.set(burg.stateId, []);
      }
      burgsByState.get(burg.stateId)!.push(burg);
    }
  }
  
  // Find migration patterns between capitals and high-population burgs
  for (const [stateIdA, burgsA] of burgsByState) {
    for (const [stateIdB, burgsB] of burgsByState) {
      if (stateIdA >= stateIdB) continue; // Avoid duplicates
      
      for (const burgA of burgsA) {
        for (const burgB of burgsB) {
          const derivedA = burgDerived.get(burgA.id);
          const derivedB = burgDerived.get(burgB.id);
          
          if (!derivedA || !derivedB) continue;
          
          let score = 0;
          let rationale = "";
          
          // Capital-to-capital migration
          if (derivedA.isCapital && derivedB.isCapital) {
            score += 0.7;
            rationale += "Both are capitals, centers of political migration. ";
          }
          
          // High population centers
          if (burgA.pop && burgB.pop && burgA.pop > 50 && burgB.pop > 50) {
            score += 0.4;
            rationale += "Both are major population centers. ";
          }
          
          // Distance factor (moderate distance favors migration)
          if (burgA.x != null && burgA.y != null && burgB.x != null && burgB.y != null) {
            const distance = calculateDistance(burgA.x, burgA.y, burgB.x, burgB.y);
            const distanceScore = distance > 200 && distance < 800 ? 0.5 : 0.2;
            score += distanceScore;
            rationale += `Moderate distance enables migration flows. `;
          }
          
          if (score > 0.4) {
            const impactScope = stateIdA === stateIdB ? "local" : 
                               (Math.abs(stateIdA - stateIdB) <= 2 ? "regional" : "interstate");
            
            suggestions.push({
              sugg_id: generateSuggestionId("migration_link", burgA.id, burgB.id),
              type: "migration_link",
              a: {
                kind: "burg",
                id: burgA.id,
                state_id: stateIdA,
                label: burgA.name
              },
              b: {
                kind: "burg",
                id: burgB.id,
                state_id: stateIdB,
                label: burgB.name
              },
              score: Math.min(score, 1.0),
              rationale: rationale.trim(),
              evidence: {
                burgA_capital: derivedA.isCapital,
                burgB_capital: derivedB.isCapital,
                burgA_pop: burgA.pop,
                burgB_pop: burgB.pop
              },
              impact_scope: impactScope
            });
          }
        }
      }
    }
  }
  
  return suggestions;
}

function generateMythLinks(
  states: StateFacts[],
  stateDerived: Map<number, StateDerived>
): LinkSuggestion[] {
  const suggestions: LinkSuggestion[] = [];
  
  // Generate myth links based on shared geographic features
  for (let i = 0; i < states.length; i++) {
    for (let j = i + 1; j < states.length; j++) {
      const stateA = states[i];
      const stateB = states[j];
      const derivedA = stateDerived.get(stateA.id);
      const derivedB = stateDerived.get(stateB.id);
      
      if (!derivedA || !derivedB) continue;
      
      let score = 0;
      let rationale = "";
      
      // Shared coastlines
      if (derivedA.hasCoast && derivedB.hasCoast) {
        score += 0.6;
        rationale += "Both states have coastlines, sharing maritime myths. ";
      }
      
      // Shared river systems
      if (derivedA.riverCount > 5 && derivedB.riverCount > 5) {
        score += 0.4;
        rationale += "Both states have extensive river systems, sharing water-based myths. ";
      }
      
      // Neighboring states share border myths
      if (stateA.neighbors?.includes(stateB.id)) {
        score += 0.5;
        rationale += "Neighboring states share border legends and myths. ";
      }
      
      if (score > 0.3) {
        const impactScope = stateA.neighbors?.includes(stateB.id) ? "regional" : "interstate";
        
        suggestions.push({
          sugg_id: generateSuggestionId("myth_link", stateA.id, stateB.id),
          type: "myth_link",
          a: {
            kind: "province",
            id: stateA.id,
            state_id: stateA.id,
            label: stateA.name
          },
          b: {
            kind: "province",
            id: stateB.id,
            state_id: stateB.id,
            label: stateB.name
          },
          score: Math.min(score, 1.0),
          rationale: rationale.trim(),
          evidence: {
            stateA_coast: derivedA.hasCoast,
            stateB_coast: derivedB.hasCoast,
            stateA_rivers: derivedA.riverCount,
            stateB_rivers: derivedB.riverCount,
            areNeighbors: stateA.neighbors?.includes(stateB.id) || false
          },
          impact_scope: impactScope
        });
      }
    }
  }
  
  return suggestions;
}

function generateScholarLinks(
  burgs: BurgFacts[],
  burgDerived: Map<number, BurgDerived>
): LinkSuggestion[] {
  const suggestions: LinkSuggestion[] = [];
  
  // Group burgs by state
  const burgsByState = new Map<number, BurgFacts[]>();
  for (const burg of burgs) {
    if (burg.stateId != null) {
      if (!burgsByState.has(burg.stateId)) {
        burgsByState.set(burg.stateId, []);
      }
      burgsByState.get(burg.stateId)!.push(burg);
    }
  }
  
  // Find scholarly connections between capitals and high-degree burgs
  for (const [stateIdA, burgsA] of burgsByState) {
    for (const [stateIdB, burgsB] of burgsByState) {
      if (stateIdA >= stateIdB) continue; // Avoid duplicates
      
      for (const burgA of burgsA) {
        for (const burgB of burgsB) {
          const derivedA = burgDerived.get(burgA.id);
          const derivedB = burgDerived.get(burgB.id);
          
          if (!derivedA || !derivedB) continue;
          
          let score = 0;
          let rationale = "";
          
          // Capital-to-capital scholarly exchange
          if (derivedA.isCapital && derivedB.isCapital) {
            score += 0.8;
            rationale += "Both are capitals, centers of learning and scholarship. ";
          }
          
          // High-degree burgs (trade hubs often have scholars)
          if (derivedA.degree > 3 && derivedB.degree > 3) {
            score += 0.5;
            rationale += "Both are major trade hubs with scholarly communities. ";
          }
          
          // Distance factor (scholars can travel further)
          if (burgA.x != null && burgA.y != null && burgB.x != null && burgB.y != null) {
            const distance = calculateDistance(burgA.x, burgA.y, burgB.x, burgB.y);
            const distanceScore = distance < 1200 ? 0.3 : 0.1;
            score += distanceScore;
            rationale += `Reasonable distance for scholarly exchange. `;
          }
          
          if (score > 0.4) {
            const impactScope = stateIdA === stateIdB ? "local" : 
                               (Math.abs(stateIdA - stateIdB) <= 3 ? "regional" : "interstate");
            
            suggestions.push({
              sugg_id: generateSuggestionId("scholar_link", burgA.id, burgB.id),
              type: "scholar_link",
              a: {
                kind: "burg",
                id: burgA.id,
                state_id: stateIdA,
                label: burgA.name
              },
              b: {
                kind: "burg",
                id: burgB.id,
                state_id: stateIdB,
                label: burgB.name
              },
              score: Math.min(score, 1.0),
              rationale: rationale.trim(),
              evidence: {
                burgA_capital: derivedA.isCapital,
                burgB_capital: derivedB.isCapital,
                burgA_degree: derivedA.degree,
                burgB_degree: derivedB.degree
              },
              impact_scope: impactScope
            });
          }
        }
      }
    }
  }
  
  return suggestions;
}

async function main() {
  console.log("Building cross-link suggestions...");
  
  const { states, burgs, stateDerived, burgDerived } = await loadFacts();
  
  // Generate all types of link suggestions
  const affinities: LinkSuggestion[] = [
    ...generateReligionLinks(states, stateDerived),
    ...generateCultureLinks(states, stateDerived),
    ...generateTradeLinks(burgs, burgDerived),
    ...generateMigrationLinks(burgs, burgDerived),
    ...generateMythLinks(states, stateDerived),
    ...generateScholarLinks(burgs, burgDerived)
  ];
  
  // Sort by score (highest first)
  affinities.sort((a, b) => b.score - a.score);
  
  // Generate checksum from all input data
  const inputData = { states, burgs, stateDerived: Object.fromEntries(stateDerived), burgDerived: Object.fromEntries(burgDerived) };
  const checksum = hashOf(inputData);
  
  const linkSuggestions: LinkSuggestions = {
    world_id: "southia",
    checksum,
    generated_at: new Date().toISOString(),
    affinities,
    hook_placements: [] // No hook templates exist yet
  };
  
  // Ensure index directory exists
  await fs.mkdir("index", { recursive: true });
  
  // Write the link suggestions
  await fs.writeFile("index/link_suggestions.json", JSON.stringify(linkSuggestions, null, 2));
  
  console.log(`Generated ${affinities.length} cross-link suggestions`);
  console.log(`Religion links: ${affinities.filter(a => a.type === "religion_link").length}`);
  console.log(`Culture links: ${affinities.filter(a => a.type === "culture_link").length}`);
  console.log(`Trade links: ${affinities.filter(a => a.type === "trade_link").length}`);
  console.log(`Migration links: ${affinities.filter(a => a.type === "migration_link").length}`);
  console.log(`Myth links: ${affinities.filter(a => a.type === "myth_link").length}`);
  console.log(`Scholar links: ${affinities.filter(a => a.type === "scholar_link").length}`);
}

main().catch(console.error);
