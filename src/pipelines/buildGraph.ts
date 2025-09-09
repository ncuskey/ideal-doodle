import fs from "fs/promises";
import { Graph } from "../graph/dag.js";

async function main() {
  const worldNode = "world:world";
  const stateFiles = await fs.readdir("facts/state").catch(()=>[]);
  const burgFiles = await fs.readdir("facts/burg").catch(()=>[]);

  const nodes = [worldNode,
    ...stateFiles.map(f => `state:${f.replace(".json","")}`),
    ...burgFiles.map(f => `burg:${f.replace(".json","")}`)
  ];

  const edges: Graph["edges"] = [];
  for (const s of stateFiles) edges.push({ from: `state:${s.replace(".json","")}`, to: worldNode, fields: ["ruler","warState","religionSpread"] });
  for (const b of burgFiles) {
    const j = JSON.parse(await fs.readFile(`facts/burg/${b}`,"utf8"));
    if (j.stateId != null) edges.push({ from: `burg:${j.id}`, to: `state:${j.stateId}`, fields: ["ruler","warState"] });
  }

  await fs.mkdir("index", { recursive: true });
  await fs.writeFile("index/graph.json", JSON.stringify({nodes, edges} satisfies Graph, null, 2));
  console.log(`Graph built: ${nodes.length} nodes, ${edges.length} edges`);
}
main();
