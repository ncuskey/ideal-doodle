# Southia Lore - Code Map

## Project Structure

```text
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
│   ├── quests/             # Quest hook templates
│   │   └── hooks/          # Hook template definitions
│   │       └── hook_untranslated_monolith.outline.json # Untranslated monolith hook
│   ├── hooks/              # Materialized hook instances
│   │   └── materialized/   # Per-burg hook instances
│   │       └── {burg_id}/  # Hook instances for specific burgs
│   └── events/             # Event records
│       ├── player/         # Player action events
│       ├── applied/        # Applied event records with inverse operations
│       └── quests/         # Quest activation events
├── index/                  # Graph & indexing
│   ├── graph.json          # DAG: burg → state → world
│   ├── catalog.json        # UI catalog (kingdoms + burgs)
│   ├── markers.json        # Marker index (Chalkvish Obelisk, Gneab Pillar, etc.)
│   ├── link_suggestions.json # Cross-link suggestions (affinities + hook placements)
│   ├── heraldry_map.json   # Heraldry index (states, provinces, burgs → SVG paths)
│   ├── effects/            # Effects proposals and applied records
│   │   └── proposed/       # LLM-generated effect proposals
│   ├── promptFacts/        # LLM-optimized fact packs
│   │   ├── state/          # State prompt packs
│   │   └── burg/           # Burg prompt packs
│   ├── dirty.seeds.json    # Event-driven change seeds
│   └── dirty.json          # Current dirty entities for regeneration
├── lore/                   # Generated lore (JSON)
│   ├── state/              # Rich state lore files
│   ├── province/           # Province lore files
│   ├── burg/               # Rich burg lore files
│   └── overlays/           # World state overlays
│       ├── burg/           # Burg overlays (population, trade, hooks, assets)
│       └── state/          # State overlays (trade, law, reputations)
├── rendered/               # UI-ready rendered data
│   ├── burg/               # Rendered burg data (outline + overlay + heraldry)
│   └── state/              # Rendered state data (outline + overlay + heraldry)
├── rendered_md/            # Markdown viewers
│   ├── burg/               # Burg markdown files
│   └── state/              # State markdown files
├── state/                  # Persistent world state
│   ├── world_state.json    # Aggregated world state (population, trade, reputations, law)
│   ├── hooks_available.json # Available hook instances
│   └── quests_active.json  # Active quest chains
├── assets/                 # Generated assets
│   └── heraldry/           # Armoria-generated coat of arms
│       ├── state/          # State heraldry (SVG files)
│       ├── province/       # Province heraldry (SVG files)
│       └── burg/           # Burg heraldry (SVG files)
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
│   ├── hook_instance.schema.json          # Hook instance schema
│   ├── quest_ops.schema.json              # Quest operations schema
│   ├── effect_item.schema.json            # Effect item schema
│   ├── effects_bundle.schema.json         # Effects bundle schema
│   ├── player_action.schema.json          # Player action schema
│   ├── burg_overlay.schema.json           # Burg overlay schema
│   ├── state_overlay.schema.json          # State overlay schema
│   ├── render_burg.schema.json            # Rendered burg schema
│   ├── render_state.schema.json           # Rendered state schema
│   ├── link_suggestions.schema.json       # Cross-link suggestions schema
│   ├── lore.burg.schema.json              # Burg lore schema
│   ├── lore.state.schema.json             # State lore schema
│   ├── lore.burg.full.schema.json         # Rich burg lore schema
│   └── lore.state.full.schema.json        # Rich state lore schema
├── app/                    # Next.js App Router application
│   ├── layout.tsx         # Root layout with global styles
│   ├── page.tsx           # Home page with navigation links
│   ├── globals.css        # Tailwind CSS global styles
│   └── burgs/             # Burg viewer pages
│       └── [id]/          # Dynamic burg detail pages
│           └── page.tsx   # Burg detail page with heraldry, overlays, hooks, markers
├── public/                # Static assets (Next.js)
│   └── assets/            # Symlinked to ../assets for heraldry access
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── loregen-dashboard.html  # Unified HTML dashboard (test suite + pipeline runner + hierarchical lore explorer)
├── lore-viewer.html        # Legacy HTML viewer for generated lore
├── test-suite.html         # Legacy HTML test suite for functionality verification
├── pipeline-runner.html    # Legacy HTML pipeline runner
├── .env                    # Environment variables (API keys)
└── src/                    # Source code
    ├── types/              # TypeScript types
    │   └── core.ts         # Core interfaces (WorldFacts, StateFacts, BurgFacts)
    ├── ingest/             # Data ingestion
    │   ├── azgaar.ts       # Azgaar loader & fact extractors with rich accessors
    │   └── canonicalNames.ts # Canonical name mapping from master JSON
    ├── derive/             # Data derivation
    │   ├── aggregate.ts    # Full derivation pipeline
    │   ├── partial.ts      # Partial derivation for single entities
    │   └── promptPacks.ts  # LLM-optimized fact pack creation
    ├── heraldry/           # Armoria heraldry integration
    │   └── armoria.ts      # Armoria API client & heraldry generation
    ├── util/               # Utilities
    │   ├── canonical.ts    # Deterministic JSON stringify
    │   ├── hash.ts         # SHA-256 hashing
    │   ├── cacheKey.ts     # Cache key generation
    │   ├── regenGuard.ts   # Regeneration guard
    │   └── abort.ts        # Abort control utilities
    ├── graph/              # Graph operations
    │   ├── dag.ts          # Graph data structures
    │   └── dirty.ts        # Dirty propagation (affected nodes)
    ├── gen/                # Generation
    │   ├── openaiClient.ts # OpenAI client setup (with rate-limit wrapper)
    │   ├── structured.ts   # Structured outputs helper
    │   └── systemPrompts.ts # Enhanced system prompts
    ├── qa/                 # QA / Debug utilities
    │   ├── patchDryRun.js  # Universal dry-run patch (no file writes)
    │   ├── timeRun.ts      # Timer utility for any command
    │   ├── diffJson.ts     # JSON diff utility (files/directories)
    │   ├── lsDirty.ts      # Quick dirty list checker
    │   └── validate.ts     # Schema validation utility
    ├── validate/           # Validation
    │   ├── lore.ts         # Lore validation rules
    │   └── rich.ts         # Rich lore validation
    ├── render/             # Rendering utilities
    │   └── heraldryIndex.ts # Heraldry path lookup
    ├── view/               # View generation
    │   └── md/             # Markdown viewers
    │       ├── burgMd.ts   # Burg markdown generation
    │       └── stateMd.ts  # State markdown generation
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
        ├── genHeraldry.ts            # Generate heraldry (Armoria integration)
        ├── genBurgLore.ts      # Generate burg lore (full quality)
        ├── genStateLore.ts     # Generate state lore (full quality)
        ├── genBurgLoreFull.ts  # Generate rich burg lore
        ├── genStateLoreFull.ts # Generate rich state lore
        ├── genBurgSummaries.ts # Batch burg summaries (efficient)
        ├── refreshBurgHooks.ts # Refresh burg hooks only (cheap)
        ├── refreshStateHooks.ts # Refresh state hooks only (cheap)
        ├── applyEvents.ts      # Apply events to facts
        ├── regenDirty.ts       # Dirty regeneration pipeline
        ├── hooksAccept.ts      # Accept hook suggestions and materialize instances
        ├── questsActivate.ts   # Activate quest chains with sibling suppression
        ├── eventsPlan.ts       # Plan effects for player actions via LLM
        ├── eventsApply.ts      # Apply effects to world state
        ├── eventsRollback.ts   # Rollback applied effects
        ├── overlaysFromState.ts # Build overlays from world state
        ├── renderDirty.ts      # Render UI-ready JSON from overlays
        └── renderMarkdown.ts   # Generate markdown viewers
```

## Key Components

### Data Flow
1. **Azgaar Export** → `data/southia.json`
2. **Fact Extraction** → `facts/{world,state,burg}/`
3. **Canonical Name Mapping** → Overlay exact names from master JSON
4. **Derived Statistics** → `facts/derived/{state,burg}/`
5. **Prompt Pack Creation** → `index/promptFacts/{state,burg}/`
6. **Graph Building** → `index/graph.json`
7. **Catalog Building** → `index/catalog.json`
8. **Canon Outline Generation** → `canon/{world,interstate,state,province,burg}/`
9. **Heraldry Generation** → `assets/heraldry/{state,province,burg}/` + `index/heraldry_map.json`
10. **Rich Lore Generation** → `lore/{state,burg}/`
11. **Event Application** → Updates facts + generates seeds
12. **Dirty Regeneration** → Targeted updates based on seeds

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
- **Canonical Name Overlay**: Uses exact names from master JSON (e.g., "Slor'th" not "State_1")
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

### Armoria Heraldry System
- **Deterministic Seeds**: Uses world_id + kind + id + name for stable generation
- **API Integration**: Fetches SVG/PNG coat of arms from Armoria API
- **Concurrent Processing**: Configurable rate limiting for API efficiency
- **File Organization**: Structured storage under `assets/heraldry/{state,province,burg}/`
- **Index Mapping**: Complete heraldry index at `index/heraldry_map.json`
- **Environment Configuration**: ARMORIA_BASE, HERALDRY_FORMAT, HERALDRY_SIZE, HERALDRY_CONCURRENCY
- **Error Handling**: Graceful failure with detailed logging
- **Stable File Names**: Safe seed generation for consistent paths

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
npm run heraldry:gen         # Generate all heraldry (Armoria integration)
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

### Quest & Hook System
```bash
npm run hooks:accept -- --sugg=id1,id2,id3              # Accept specific hook suggestions
npm run hooks:accept -- --all --minScore=0.7 --limit=50 # Bulk accept with filtering
npm run quests:activate -- --chain=chain_id --hook=hook_instance_id # Activate quest chain
```

### Events Pipeline (Player Actions → Effects → Apply → Rollback)
```bash
npm run events:plan -- --id=action_id                   # Plan effects via LLM
npm run events:apply -- --id=action_id                  # Apply effects to world state
npm run events:rollback -- --id=action_id               # Rollback applied effects
```

### Fast Rendering & Overlays
```bash
npm run overlays:build                                  # Build overlays from world state
npm run render:dirty                                    # Render only dirty entities
npm run render:all                                      # Render all entities
```

### Markdown Viewers
```bash
npm run render:md:all                                   # Generate all markdown files
npm run render:md:burg -- --id=burg_id                  # Generate burg markdown
npm run render:md:state -- --id=state_id                # Generate state markdown
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

### Heraldry Operations
```bash
npm run heraldry:gen              # Generate all heraldry (states, provinces, burgs)
npm run heraldry:gen:states       # Generate state heraldry only
npm run heraldry:gen:provinces    # Generate province heraldry only
npm run heraldry:gen:burgs        # Generate burg heraldry only
```

### Cost-Optimized Operations
```bash
npm run lore:burg:hooks -- --id=1  # Refresh burg hooks only (cheap)
npm run lore:state:hooks -- --id=1 # Refresh state hooks only (cheap)
npx tsx src/pipelines/genBurgSummaries.ts  # Batch summaries (efficient)
```

### QA / Debug Utilities
```bash
npm run qa:time -- <command>                    # Time any command execution
npm run qa:diff -- --left=<path> --right=<path> # Compare JSON files/directories
npm run qa:dirty                                # Show current dirty list
npm run qa:validate -- --schema=<schema> --dir=<dir> # Validate against schemas
npm run qa:run:safe -- <command>                # Run with rate limiting + timing
npm run qa:dryhint                              # Show dry-run usage instructions

# Dry-run any pipeline (no file writes)
DRY_RUN=1 NODE_OPTIONS=--require=./src/qa/patchDryRun.js npm run canon:burg:outline

# Rate-limit safe execution with custom limits
LORE_TPM_LIMIT=30000 LORE_AVG_REQ_TOKENS=650 DEBUG=rl npm run canon:burg:outline
```

### Next.js Burg Viewer
```bash
npm run next:dev                                # Start development server
npm run next:build                              # Build for production
npm run next:start                              # Start production server

# Access burg viewer at http://localhost:3000/burgs/[id]
# Example: http://localhost:3000/burgs/1
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
- **ajv**: JSON schema validation for QA utilities
- **Next.js**: React framework for burg viewer UI
- **React**: UI library for burg viewer components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **@tailwindcss/postcss**: PostCSS plugin for Tailwind CSS
