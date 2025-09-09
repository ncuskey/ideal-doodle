# Southia Lore (Facts → Lore)

**Pipelines**
- Build facts from Azgaar: `npm run facts:build`
- Build dependency graph: `npm run graph:build`
- Generate burg lore: `npm run lore:burg -- --id=ID`
- Generate state lore: `npm run lore:state -- --id=ID`
- Apply event: `npm run events:apply -- --file=events/demo.json`

**Caching**
- Lore files store `hashOfInputs`. If inputs unchanged, regen is skipped.

**Structured Outputs**
- Uses OpenAI **Responses API** with **json_schema** response_format to enforce JSON.
