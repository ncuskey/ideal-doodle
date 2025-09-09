# Southia Lore - Code Map

## Project Structure

```
LoreGen/
├── data/                    # Azgaar export data
│   └── southia.json        # Main world data export
├── facts/                  # Extracted facts (JSON)
│   ├── world/              # World-level facts
│   ├── state/              # State facts (17 files)
│   ├── province/           # Province facts (empty)
│   └── burg/               # Burg facts (478 files)
├── lore/                   # Generated lore (JSON)
│   ├── state/              # State lore files
│   ├── province/           # Province lore files
│   └── burg/               # Burg lore files
├── events/                 # Event definitions & log
│   ├── demo.json           # Sample ruler change event
│   ├── demo2.json          # Sample event #2
│   └── log.ndjson          # Event application log
├── index/                  # Graph & indexing
│   └── graph.json          # DAG: burg → state → world
├── schemas/                # JSON schemas
│   ├── lore.burg.schema.json    # Burg lore schema
│   └── lore.state.schema.json   # State lore schema
├── lore-viewer.html        # HTML viewer for generated lore
├── .env                    # Environment variables (API keys)
└── src/                    # Source code
    ├── types/              # TypeScript types
    │   └── core.ts         # Core interfaces (WorldFacts, StateFacts, BurgFacts)
    ├── ingest/             # Data ingestion
    │   └── azgaar.ts       # Azgaar loader & fact extractors
    ├── util/               # Utilities
    │   ├── canonical.ts    # Deterministic JSON stringify
    │   ├── hash.ts         # SHA-256 hashing
    │   ├── cacheKey.ts     # Cache key generation
    │   └── regenGuard.ts   # Regeneration guard
    ├── graph/              # Graph operations
    │   ├── dag.ts          # Graph data structures
    │   └── dirty.ts        # Dirty propagation (affected nodes)
    ├── gen/                # Generation
    │   ├── openaiClient.ts # OpenAI client setup (with model constants)
    │   ├── structured.ts   # Structured outputs helper
    │   └── systemPrompts.ts # System prompts
    ├── validate/           # Validation
    │   └── lore.ts         # Lore validation rules
    └── pipelines/          # Main pipelines
        ├── buildFacts.ts   # Extract facts from Azgaar
        ├── buildGraph.ts   # Build dependency DAG
        ├── genBurgLore.ts  # Generate burg lore (full quality)
        ├── genStateLore.ts # Generate state lore (full quality)
        ├── genBurgSummaries.ts # Batch burg summaries (efficient)
        ├── refreshBurgHooks.ts # Refresh burg hooks only (cheap)
        ├── refreshStateHooks.ts # Refresh state hooks only (cheap)
        └── applyEvents.ts  # Apply events to facts
```

## Key Components

### Data Flow
1. **Azgaar Export** → `data/southia.json`
2. **Fact Extraction** → `facts/{world,state,burg}/`
3. **Graph Building** → `index/graph.json`
4. **Lore Generation** → `lore/{state,burg}/`
5. **Event Application** → Updates facts + logs

### Core Types
- `WorldFacts`: Map name, year, era
- `StateFacts`: ID, name, color, capital, neighbors
- `BurgFacts`: ID, name, state, population, port, coordinates

### Caching System
- **Hash Generation**: `cacheKeyForEntity()` computes deterministic hashes
- **Regeneration Guard**: `shouldRegen()` skips when hash matches
- **Dirty Propagation**: `affectedBy()` finds nodes needing regeneration

### Validation
- **Schema Compliance**: JSON schemas enforce structure
- **Fact Validation**: Guards against port claims when `burg.port=false`
- **Hook Limits**: Max 3 adventure hooks per lore file

### Event System
- **Event Types**: rulerChange, battle, disaster
- **Effect Application**: Updates facts based on event effects
- **Audit Trail**: NDJSON log of all applied events

## Pipeline Commands

### Core Generation
```bash
npm run facts:build          # Extract facts from Azgaar
npm run graph:build          # Build dependency graph
npm run lore:burg -- --id=1  # Generate burg lore (full quality)
npm run lore:state -- --id=1 # Generate state lore (full quality)
npm run events:apply -- --file=events/demo.json
```

### Cost-Optimized Operations
```bash
npm run lore:burg:hooks -- --id=1  # Refresh burg hooks only (cheap)
npm run lore:state:hooks -- --id=1 # Refresh state hooks only (cheap)
npx tsx src/pipelines/genBurgSummaries.ts  # Batch summaries (efficient)
```

### Viewing Results
```bash
python3 -m http.server 8000  # Start local server
# Open http://localhost:8000/lore-viewer.html
```

## Model Strategy

Intelligent model selection for cost optimization:

- **`gpt-5`** → Full lore generation (quality-first)
- **`gpt-5-nano`** → Batch summaries (efficiency)
- **`gpt-5-mini`** → Hooks-only refresh (cost-effective)

## Dependencies

- **OpenAI**: GPT-5 models with structured outputs
- **dotenv**: Environment variable management
- **TypeScript**: ES2022 modules
- **Node.js**: File system operations
- **Crypto**: SHA-256 hashing
