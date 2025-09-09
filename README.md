# Southia Lore (Facts → Lore)

A comprehensive world-building system that generates rich lore for fantasy worlds using AI models with intelligent cost optimization and dependency tracking.

## 🚀 Quick Start

1. **Setup Environment**
   ```bash
   npm install
   cp .env.example .env  # Add your OPENAI_API_KEY
   ```

2. **Build Complete World**
   ```bash
   npm run facts:build        # Extract facts from Azgaar data
   npm run facts:derive       # Compute derived statistics
   npm run facts:promptpacks  # Create LLM-optimized fact packs
   npm run graph:build        # Build dependency graph
   ```

3. **Generate Canon Outlines** (Two-Pass Foundation)
   ```bash
   npm run canon:world:outline        # World-level context (eras, civilizations, tech/magic)
   npm run canon:interstate:outline   # Inter-state relationships (alliances, wars, trade)
   npm run canon:state:outline        # Per-state outlines (factions, culture, regions)
   npm run canon:province:outline     # Province outlines (synthetic from state regions)
   npm run canon:burg:outline         # Burg outlines (from fact data)
   ```

4. **Build Marker Index** (Azgaar Markers)
   ```bash
   npm run canon:markers:index        # Extract markers from Azgaar JSON (Chalkvish Obelisk, etc.)
   ```

5. **Generate Cross-Link Suggestions** (Deterministic Affinities + Hook Placements)
   ```bash
   npm run links:suggest              # Cross-state affinities + marker-driven hook placements
   ```

6. **Generate Rich Lore**
   ```bash
   npm run lore:state:full -- --id=1  # Rich state lore with GPT-5
   npm run lore:burg:full -- --id=1   # Rich burg lore with GPT-5
   ```

7. **Build Catalog**
   ```bash
   npm run catalog:build  # Create compact UI index
   ```

8. **View Results**
   ```bash
   python3 -m http.server 8000
   # Open http://localhost:8000/loregen-dashboard.html
   ```

## 📋 Pipelines

### Core Generation
- **Build facts from Azgaar**: `npm run facts:build`
- **Compute derived statistics**: `npm run facts:derive`
- **Create prompt packs**: `npm run facts:promptpacks`
- **Build dependency graph**: `npm run graph:build`
- **Build UI catalog**: `npm run catalog:build`

### Canon Outlines (Two-Pass Foundation)
- **World canon outline**: `npm run canon:world:outline`
- **Inter-state outline**: `npm run canon:interstate:outline`
- **State outlines (all)**: `npm run canon:state:outline`
- **State outline (one)**: `npm run canon:state:outline:one -- ID`
- **Province outlines**: `npm run canon:province:outline`
- **Burg outlines**: `npm run canon:burg:outline`

### Marker Index (Azgaar Markers)
- **Build marker index**: `npm run canon:markers:index`

### Cross-Link Suggestions (Deterministic Affinities + Hook Placements)
- **Generate cross-link suggestions**: `npm run links:suggest`

### Rich Lore Generation
- **Generate rich state lore**: `npm run lore:state:full -- --id=ID`
- **Generate rich burg lore**: `npm run lore:burg:full -- --id=ID`

### Bulk Operations
- **Generate all state lore**: `npm run lore:state:full:all`
- **Generate all burg lore**: `npm run lore:burg:full:all`
- **Quick smoke test**: `npm run pipeline:full:one`
- **Full world generation**: `npm run pipeline:full:all`
- **Full world + validation**: `npm run pipeline:full:all+validate`
- **Real full world pipeline**: `npm run pipeline:real:all` (with concurrency control)

### Event-Driven Updates
- **Apply events**: `npm run events:apply -- --file=events/demo.json`
- **Dirty regeneration**: `npm run lore:dirty -- --node=state:ID`
- **Chained event+regen**: `npm run events:apply+regen -- --file=events/demo.json`

### Cost-Optimized Hooks
- **Refresh burg hooks**: `npm run lore:burg:hooks -- --id=ID`
- **Refresh state hooks**: `npm run lore:state:hooks -- --id=ID`
- **Batch summaries**: `npx tsx src/pipelines/genBurgSummaries.ts`

### Pipeline Control
- **Request abort**: `npm run pipeline:abort`
- **Clear abort flag**: `npm run pipeline:abort:clear`
- **Validate all lore**: `npm run validate:lore`
- **Validate subset**: `npm run validate:lore:subset -- --states=1,2 --burgs=10,11`

## 🎯 Model Strategy

Intelligent model selection for optimal cost/quality balance:

- **`gpt-5`** → Full lore generation (states/burgs, correctness-sensitive)
- **`gpt-5-nano`** → Bulk summaries and batch operations
- **`gpt-5-mini`** → Partial regen (adventure hooks only)

## 📁 Output Structure

Generated content is organized across multiple directories:

```
facts/              # Base facts from Azgaar
├── state/          # State facts
├── burg/           # Burg facts
└── world/          # World facts

facts/derived/      # Computed statistics
├── state/          # State-level aggregations
└── burg/           # Burg-level connectivity

canon/              # Canon outlines (two-pass foundation)
├── world/          # World-level context
│   └── outline.json # Eras, civilizations, tech/magic baseline
├── interstate/     # Inter-state relationships
│   └── outline.json # Alliances, wars, treaties, trade blocs
├── state/          # Per-state outlines
│   ├── 0.outline.json # State 0 outline (factions, culture, regions)
│   ├── 1.outline.json # State 1 outline
│   └── ...           # All state outlines
├── province/       # Province outlines (synthetic from state regions)
│   ├── prov_0_port_of_skiffs.outline.json
│   ├── prov_0_lower_marshes.outline.json
│   └── ...           # All province outlines
├── burg/           # Burg outlines (from fact data)
│   ├── 1.outline.json
│   ├── 2.outline.json
│   └── ...           # All burg outlines
└── quests/         # Quest hook templates
    └── hooks/      # Hook template definitions
        └── hook_untranslated_monolith.outline.json # Untranslated monolith hook

index/              # LLM-optimized data
├── promptFacts/    # Compact fact packs
│   ├── state/      # State prompt packs
│   └── burg/       # Burg prompt packs
├── graph.json      # Dependency graph
├── catalog.json    # UI catalog (kingdoms + burgs)
├── markers.json    # Marker index (Chalkvish Obelisk, Gneab Pillar, etc.)
├── link_suggestions.json # Cross-link suggestions (affinities + hook placements)
├── dirty.seeds.json # Event-driven change seeds
├── validate-summary.json # Validation results
├── runs/           # Usage logs (daily files)
└── abort.flag      # Abort control flag

lore/               # Generated lore
├── burg/           # Rich burg lore
├── state/          # Rich state lore
└── province/       # Province lore (future)

schemas/            # JSON schemas
├── world_canon_outline.schema.json
├── interstate_outline.schema.json
├── state_outline.schema.json
├── province_outline.schema.json
├── burg_outline.schema.json
├── markers_index.schema.json
├── hook_template_outline.schema.json
├── link_suggestions.schema.json
├── lore.state.full.schema.json
└── lore.burg.full.schema.json
```

## 🎨 Lore Explorer

A hierarchical HTML explorer for navigating generated content:

- **Two-pane layout**: Left sidebar for navigation, right panel for details
- **Kingdom cards**: Display emblem + name + quick stats (burg count, port count)
- **Search functionality**: Filter kingdoms and burgs by name
- **Hierarchical navigation**: Click kingdom → see state lore + burg grid → click burg → see burg lore
- **Lettermark shields**: Automatic fallback emblems when no custom assets exist
- **Dark theme**: Modern dark UI with cyan accents
- **Responsive design**: Adapts to mobile with single-column layout

## 🧙‍♂️ LoreGen Dashboard

A unified HTML interface combining testing, pipeline execution, and lore viewing with **real command execution**:

- **`loregen-dashboard.html`** - Complete dashboard with three main tabs:
  - **🧪 Test Suite** - Comprehensive functionality verification (19 tests across 5 categories)
  - **🏗️ Pipeline Runner** - Step-by-step world generation with **real npm command execution**
  - **🏰 Lore Explorer** - Hierarchical navigation of kingdoms, states, and burgs with search
- **Real-time debugging** with shared debug panel across all tabs
- **Visual progress tracking** with animated progress bars and status indicators
- **Real command execution** - No more simulation! Commands actually run and generate real lore
- **Streaming output** - See real-time command output as it happens
- **Backend API server** - Express.js server handles command execution securely

**Usage:**
```bash
# Start the backend server
npm run server
# Server runs on http://localhost:3002
# Dashboard automatically opens at http://localhost:3002

# Or manually open the dashboard
open http://localhost:3002
```

**Backend API:**
- **`/api/exec`** - Execute npm commands with real-time streaming output
- **`/api/health`** - Health check endpoint
- **CORS enabled** - Works with any frontend
- **Command mapping** - Maps npm run commands to actual tsx executions

**Pipeline Runner Features:**
- **🚀 Run Full Pipeline** - Real command execution with streaming output
- **⚡ Run Pipeline** - Real command execution with scope selection (All/One/Dirty)
- **🌍 Run Full World Pipeline** - Complete world generation with real concurrency control
- **📊 Progress Tracking** - Real-time progress bars and step indicators
- **🐛 Debug Logging** - Real command output streaming with detailed logging
- **⚙️ Configuration** - Set State ID and Burg ID for generation steps
- **🎯 Scope Selection** - Choose between All/One/Dirty execution modes
- **⏹️ Abort Control** - Stop long-running operations gracefully
- **✅ Validation** - Automatic validation of generated content
- **🔄 Concurrency Control** - States (3-way) and Burgs (4-way) parallel processing
- **🌐 Real API Calls** - Actual OpenAI API calls generate real lore content

### Legacy Files
- **`test-suite.html`** - Standalone test suite (superseded by dashboard)
- **`pipeline-runner.html`** - Standalone pipeline runner (superseded by dashboard)
- **`lore-viewer.html`** - Standalone lore viewer (superseded by hierarchical explorer)

## ⚡ Features

### Two-Pass Canon System
- **World Canon Outline**: Global context (eras, civilizations, tech/magic baseline)
- **Inter-State Outline**: Relationships between states (alliances, wars, trade blocs)
- **State Outlines**: Per-state foundations (factions, culture, regions, constraints)
- **Hierarchical Consistency**: Each layer references and builds upon the previous
- **Cheap Regeneration**: Outline passes are fast and can be run frequently

### Robust Rate Limiting
- **Auto-retry with exponential backoff**: Handles OpenAI 429 rate limit errors gracefully
- **Server-provided retry hints**: Honors OpenAI's retry-after headers
- **Configurable limits**: Environment variables for max retries and base delays
- **Jittered delays**: Prevents thundering herd problems
- **Compact logging**: Clear retry status for monitoring

### Smart Caching & Dependency Tracking
- Lore files store `hashOfInputs` for intelligent regeneration
- Skip regeneration when inputs haven't changed
- Dependency graph tracks relationships between entities
- Event-driven dirty regeneration for targeted updates

### Rich Data Processing
- **Azgaar integration**: Extracts facts from fantasy map generators
- **Derived statistics**: Computes aggregations (top burgs, dominant cultures, etc.)
- **Prompt optimization**: Creates compact, LLM-ready fact packs
- **Validation**: Sanity checks prevent contradictions

### Structured Outputs
- Uses OpenAI **Chat Completions API** with **json_schema** response_format
- Enforced JSON structure with validation
- Rich, detailed world-building content with adventure hooks

### Cost Optimization
- **Quality-first** approach for important content
- **Efficient models** for bulk operations
- **Hooks-only refresh** to update just adventure content
- **Partial regeneration** for targeted updates

## 🛠️ Development

### Environment Setup
- **dotenv** for secure API key management
- **TypeScript** for type safety
- **tsx** for development execution

### File Structure
```
src/
├── gen/            # AI generation utilities
├── pipelines/      # Lore generation scripts
├── derive/         # Data derivation and aggregation
├── ingest/         # Azgaar data processing
├── graph/          # Dependency tracking
├── validate/       # Output validation
├── util/           # Helper functions
└── types/          # TypeScript definitions
```

## 📊 Usage Examples

**Complete World Build:**
```bash
npm run facts:build        # Extract base facts
npm run facts:derive       # Compute statistics
npm run facts:promptpacks  # Create fact packs
npm run graph:build        # Build dependencies
```

**Canon Outline Generation:**
```bash
npm run canon:world:outline        # World-level context
npm run canon:interstate:outline   # Inter-state relationships
npm run canon:state:outline        # All state outlines
npm run canon:province:outline     # Province outlines (synthetic from state regions)
npm run canon:burg:outline         # Burg outlines (from fact data)
# Or single state: npm run canon:state:outline:one -- 1
```

**Marker Index & Cross-Link Suggestions:**
```bash
npm run canon:markers:index        # Extract markers from Azgaar JSON
npm run links:suggest              # Generate cross-state affinities + marker-driven hook placements
```

**Rich Lore Generation:**
```bash
npm run lore:state:full -- --id=1  # Complete state lore with GPT-5
npm run lore:burg:full -- --id=1   # Complete burg lore with GPT-5
```

**Bulk Operations:**
```bash
npm run pipeline:full:one           # Quick smoke test
npm run pipeline:full:all           # Full world generation
npm run pipeline:full:all+validate  # Full world + validation
npm run pipeline:real:all           # Real full world pipeline with concurrency
LORE_CONCURRENCY=4 npm run lore:state:full:all  # Parallel state generation
```

**Event-Driven Updates:**
```bash
npm run events:apply -- --file=events/demo.json  # Apply event
npm run lore:dirty -- --node=state:1             # Regenerate affected
# Or chain both: npm run events:apply+regen -- --file=events/demo.json
```

**Pipeline Control:**
```bash
npm run pipeline:abort              # Request abort
npm run pipeline:abort:clear        # Clear abort flag
npm run validate:lore               # Validate all lore
npm run validate:lore:subset -- --states=1,2 --burgs=10,11  # Validate subset
```

**Cost-Efficient Updates:**
```bash
npm run lore:burg:hooks -- --id=1  # Just refresh adventure hooks
npx tsx src/pipelines/genBurgSummaries.ts  # Batch summaries
```

**Build Catalog & View Results:**
```bash
npm run catalog:build  # Create compact UI index
python3 -m http.server 8000
# Navigate to http://localhost:8000/loregen-dashboard.html
```
