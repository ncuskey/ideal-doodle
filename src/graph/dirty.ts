import fs from "fs/promises";
interface Graph { nodes:string[]; edges:{from:string;to:string;fields?:string[]}[]; }
export async function affectedBy(changeNode:string): Promise<string[]> {
  const g:Graph = JSON.parse(await fs.readFile("index/graph.json","utf8"));
  const affected = new Set<string>();
  const rev = new Map<string,string[]>();
  for (const e of g.edges) {
    if (!rev.has(e.to)) rev.set(e.to, []);
    rev.get(e.to)!.push(e.from);
  }
  const stack = [changeNode];
  while (stack.length) {
    const n = stack.pop()!;
    const children = rev.get(n) ?? [];
    for (const c of children) if (!affected.has(c)) { affected.add(c); stack.push(c); }
  }
  return [...affected];
}
