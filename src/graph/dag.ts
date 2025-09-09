import fs from "fs/promises";
export interface Edge { from: string; to: string; fields?: string[]; }
export interface Graph { nodes: string[]; edges: Edge[]; }

export async function saveGraph(g: Graph, p="index/graph.json") {
  await fs.writeFile(p, JSON.stringify(g, null, 2));
}
