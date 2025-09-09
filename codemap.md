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
├── facts/derived/          # Computed statistics
│   ├── state/              # State-level aggregations
│   └── burg/               # Burg-level connectivity
├── index/                  # Graph & indexing
│   ├── graph.json          # DAG: burg → state → world
│   ├── promptFacts/        # LLM-optimized fact packs
│   │   ├── state/          # State prompt packs
│   │   └── burg/           # Burg prompt packs
│   └── dirty.seeds.json    # Event-driven change seeds
├── lore/                   # Generated lore (JSON)
│   ├── state/              # Rich state lore files
│   ├── province/           # Province lore files
│   └── burg/               # Rich burg lore files
├── events/                 # Event definitions & log
│   ├── demo.json           # Sample ruler change event
│   ├── demo2.json          # Sample event #2
│   └── log.ndjson          # Event application log
├── schemas/                # JSON schemas
│   ├── lore.burg.schema.json         # Burg lore schema
│   ├── lore.state.schema.json        # State lore schema
│   ├── lore.burg.full.schema.json    # Rich burg lore schema
│   └── lore.state.full.schema.json   # Rich state lore schema
├── loregen-dashboard.html  # Unified HTML dashboard (test suite + pipeline runner + lore viewer)
├── lore-viewer.html        # Legacy HTML viewer for generated lore
├── test-suite.html         # Legacy HTML test suite for functionality verification
├── pipeline-runner.html    # Legacy HTML pipeline runner
├── .env                    # Environment variables (API keys)
└── src/                    # Source code
    ├── types/              # TypeScript types
    │   └── core.ts         # Core interfaces (WorldFacts, StateFacts, BurgFacts)
    ├── ingest/             # Data ingestion
    │   └── azgaar.ts       # Azgaar loader & fact extractors with rich accessors
    ├── derive/             # Data derivation
    │   ├── aggregate.ts    # Full derivation pipeline
    │   ├── partial.ts      # Partial derivation for single entities
    │   └── promptPacks.ts  # LLM-optimized fact pack creation
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
    │   └── systemPrompts.ts # Enhanced system prompts
    ├── validate/           # Validation
    │   ├── lore.ts         # Lore validation rules
    │   └── rich.ts         # Rich lore validation
    └── pipelines/          # Main pipelines
        ├── buildFacts.ts       # Extract facts from Azgaar
        ├── buildDerived.ts     # Compute derived statistics
        ├── buildPromptPacks.ts # Create LLM-optimized fact packs
        ├── buildGraph.ts       # Build dependency DAG
        ├── genBurgLore.ts      # Generate burg lore (full quality)
        ├── genStateLore.ts     # Generate state lore (full quality)
        ├── genBurgLoreFull.ts  # Generate rich burg lore
        ├── genStateLoreFull.ts # Generate rich state lore
        ├── genBurgSummaries.ts # Batch burg summaries (efficient)
        ├── refreshBurgHooks.ts # Refresh burg hooks only (cheap)
        ├── refreshStateHooks.ts # Refresh state hooks only (cheap)
        ├── applyEvents.ts      # Apply events to facts
        └── regenDirty.ts       # Dirty regeneration pipeline
```

## Key Components

### Data Flow
1. **Azgaar Export** → `data/southia.json`
2. **Fact Extraction** → `facts/{world,state,burg}/`
3. **Derived Statistics** → `facts/derived/{state,burg}/`
4. **Prompt Pack Creation** → `index/promptFacts/{state,burg}/`
5. **Graph Building** → `index/graph.json`
6. **Rich Lore Generation** → `lore/{state,burg}/`
7. **Event Application** → Updates facts + generates seeds
8. **Dirty Regeneration** → Targeted updates based on seeds

### Core Types
- `WorldFacts`: Map name, year, era
- `StateFacts`: ID, name, color, capital, neighbors, population, area, military
- `BurgFacts`: ID, name, state, population, port, coordinates, cell

### Caching System
- **Hash Generation**: `cacheKeyForEntity()` computes deterministic hashes
- **Regeneration Guard**: `shouldRegen()` skips when hash matches
- **Dirty Propagation**: `affectedBy()` finds nodes needing regeneration

### Validation
- **Schema Compliance**: JSON schemas enforce structure
- **Rich Lore Validation**: Guards against contradictions (navy without coast, etc.)
- **Hook Limits**: Max 4 adventure hooks per rich lore file
- **Fact Validation**: Guards against port claims when `burg.port=false`

### Event System
- **Event Types**: rulerChange, battle, disaster
- **Effect Application**: Updates facts based on event effects
- **Seed Generation**: Creates dirty seeds for targeted regeneration
- **Audit Trail**: NDJSON log of all applied events

## Pipeline Commands

### Core Generation
```bash
npm run facts:build          # Extract facts from Azgaar
npm run facts:derive         # Compute derived statistics
npm run facts:promptpacks    # Create LLM-optimized fact packs
npm run graph:build          # Build dependency graph
npm run lore:burg:full -- --id=1  # Generate rich burg lore
npm run lore:state:full -- --id=1 # Generate rich state lore
npm run events:apply -- --file=events/demo.json
```

### Event-Driven Updates
```bash
npm run lore:dirty -- --node=state:1                    # Regenerate affected nodes
npm run lore:dirty -- --event-file=index/dirty.seeds.json # Use seed file
npm run events:apply+regen -- --file=events/demo.json   # Chain event + regen
```

### Cost-Optimized Operations
```bash
npm run lore:burg:hooks -- --id=1  # Refresh burg hooks only (cheap)
npm run lore:state:hooks -- --id=1 # Refresh state hooks only (cheap)
npx tsx src/pipelines/genBurgSummaries.ts  # Batch summaries (efficient)
```

### Unified Dashboard
```bash
# Open unified dashboard in browser
open loregen-dashboard.html
# Or serve locally and navigate to loregen-dashboard.html
python3 -m http.server 8000
```

**Dashboard Features:**
- **Test Suite**: 19 tests across 5 categories (utilities, validation, pipelines, events, integration)
- **Pipeline Runner**: Two modes - simulated and real execution with detailed API logging
- **Lore Viewer**: Browse generated lore files with rich display
- **Debug Panel**: Real-time logging with timestamps and detailed API request/response data

### Legacy Interfaces
```bash
# Individual interfaces (superseded by dashboard)
open lore-viewer.html        # Lore viewer only
open test-suite.html         # Test suite only  
open pipeline-runner.html    # Pipeline runner only
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
