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
├── canon/                  # Canon outlines (two-pass foundation)
│   ├── world/              # World-level context
│   │   └── outline.json    # Eras, civilizations, tech/magic baseline
│   ├── interstate/         # Inter-state relationships
│   │   └── outline.json    # Alliances, wars, treaties, trade blocs
│   ├── state/              # Per-state outlines
│   │   ├── 0.outline.json  # State 0 outline (factions, culture, regions)
│   │   ├── 1.outline.json  # State 1 outline
│   │   └── ...             # All state outlines
│   ├── province/           # Province outlines (synthetic from state regions)
│   │   ├── prov_0_port_of_skiffs.outline.json
│   │   ├── prov_0_lower_marshes.outline.json
│   │   └── ...             # All province outlines
│   ├── burg/               # Burg outlines (from fact data)
│   │   ├── 1.outline.json
│   │   ├── 2.outline.json
│   │   └── ...             # All burg outlines
│   └── quests/             # Quest hook templates
│       └── hooks/          # Hook template definitions
│           └── hook_untranslated_monolith.outline.json # Untranslated monolith hook
├── index/                  # Graph & indexing
│   ├── graph.json          # DAG: burg → state → world
│   ├── catalog.json        # UI catalog (kingdoms + burgs)
│   ├── markers.json        # Marker index (Chalkvish Obelisk, Gneab Pillar, etc.)
│   ├── link_suggestions.json # Cross-link suggestions (affinities + hook placements)
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
│   ├── world_canon_outline.schema.json    # World canon outline schema
│   ├── interstate_outline.schema.json     # Inter-state outline schema
│   ├── state_outline.schema.json          # State outline schema
│   ├── province_outline.schema.json       # Province outline schema
│   ├── burg_outline.schema.json           # Burg outline schema
│   ├── markers_index.schema.json          # Marker index schema
│   ├── hook_template_outline.schema.json  # Hook template schema
│   ├── link_suggestions.schema.json       # Cross-link suggestions schema
│   ├── lore.burg.schema.json              # Burg lore schema
│   ├── lore.state.schema.json             # State lore schema
│   ├── lore.burg.full.schema.json         # Rich burg lore schema
│   └── lore.state.full.schema.json        # Rich state lore schema
├── loregen-dashboard.html  # Unified HTML dashboard (test suite + pipeline runner + hierarchical lore explorer)
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
    │   ├── openaiClient.ts # OpenAI client setup (with rate-limit wrapper)
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
        ├── buildCatalog.ts     # Build UI catalog (kingdoms + burgs)
        ├── buildLinkSuggestions.ts # Build cross-link suggestions (facts-based)
        ├── crossLinkSuggest.ts  # Generate cross-link suggestions (canon-based)
        ├── buildMarkerIndex.ts  # Build marker index from Azgaar JSON
        ├── canonWorldOutline.ts      # Generate world canon outline
        ├── canonInterstateOutline.ts # Generate inter-state outline
        ├── canonStateOutline.ts      # Generate state outlines
        ├── canonProvinceOutline.ts   # Generate province outlines (synthetic from state regions)
        ├── canonBurgOutline.ts       # Generate burg outlines (from fact data)
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
6. **Catalog Building** → `index/catalog.json`
7. **Canon Outline Generation** → `canon/{world,interstate,state,province,burg}/`
8. **Rich Lore Generation** → `lore/{state,burg}/`
9. **Event Application** → Updates facts + generates seeds
10. **Dirty Regeneration** → Targeted updates based on seeds

### Core Types
- `WorldFacts`: Map name, year, era
- `StateFacts`: ID, name, color, capital, neighbors, population, area, military
- `BurgFacts`: ID, name, state, population, port, coordinates, cell

### Canon Outline System (Two-Pass Foundation)
- **World Canon Outline**: Global context (eras, civilizations, tech/magic baseline)
- **Inter-State Outline**: Relationships between states (alliances, wars, trade blocs)
- **State Outlines**: Per-state foundations (factions, culture, regions, constraints)
- **Province Outlines**: Synthetic provinces from state regions (economy niches, culture adjustments, risks)
- **Burg Outlines**: Burg-level foundations (size hints, economy roles, factions, quest hooks)
- **Hierarchical Consistency**: Each layer references and builds upon the previous
- **Rate-Limit Integration**: Uses `withRateLimitRetry()` for robust API calls
- **Cheap Regeneration**: Outline passes are fast and can be run frequently

### Marker Index System (Azgaar Integration)
- **Marker Extraction**: Extracts markers from Azgaar JSON exports (obelisks, steles, pillars, etc.)
- **Rune Text Detection**: Automatically identifies untranslated text in marker legends
- **Tag Generation**: Creates semantic tags from marker names, types, and content
- **Proximity Hints**: Calculates nearby burg IDs for marker-based hook placement
- **Hook Template Integration**: Links markers to quest hook templates via placement rules
- **Placement Rules**: Configurable caps (per-state, world-wide) and filtering criteria

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
npm run catalog:build        # Build UI catalog
npm run canon:markers:index  # Build marker index from Azgaar JSON
npm run links:suggest        # Generate cross-link suggestions (canon-based)
npm run canon:province:outline # Generate province outlines
npm run canon:burg:outline   # Generate burg outlines
npm run lore:burg:full -- --id=1  # Generate rich burg lore
npm run lore:state:full -- --id=1 # Generate rich state lore
npm run events:apply -- --file=events/demo.json
```

### Bulk Operations
```bash
npm run lore:state:full:all  # Generate all state lore (parallel)
npm run lore:burg:full:all   # Generate all burg lore (parallel)
npm run pipeline:full:one    # Quick smoke test (1 state + 1 burg)
npm run pipeline:full:all    # Full world generation
npm run pipeline:full:all+validate  # Full world + validation
npm run pipeline:real:all    # Real full world pipeline with concurrency control
LORE_CONCURRENCY=4 npm run lore:state:full:all  # Custom concurrency
```

### Event-Driven Updates
```bash
npm run lore:dirty -- --node=state:1                    # Regenerate affected nodes
npm run lore:dirty -- --event-file=index/dirty.seeds.json # Use seed file
npm run events:apply+regen -- --file=events/demo.json   # Chain event + regen
```

### Pipeline Control
```bash
npm run pipeline:abort       # Request abort (stops long-running operations)
npm run pipeline:abort:clear # Clear abort flag
npm run validate:lore        # Validate all lore files
npm run validate:lore:subset -- --states=1,2 --burgs=10,11  # Validate subset
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
- **Pipeline Runner**: Three modes - simulated, real execution, and full world pipeline with concurrency control
- **Scope Selection**: Choose between All/One/Dirty execution modes
- **Lore Explorer**: Hierarchical navigation with kingdom cards, search, and lettermark shields
- **Debug Panel**: Real-time logging with timestamps and detailed API request/response data
- **Abort Control**: Stop long-running operations gracefully
- **Validation**: Automatic validation of generated content
- **Concurrency Control**: States (3-way) and Burgs (4-way) parallel processing

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
- **cross-env**: Cross-platform environment variable support
- **p-limit**: Concurrency control for parallel operations
