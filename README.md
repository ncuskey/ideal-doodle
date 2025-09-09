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

3. **Generate Lore**
   ```bash
   npm run lore:state:full -- --id=1  # Rich state lore with GPT-5
   npm run lore:burg:full -- --id=1   # Rich burg lore with GPT-5
   ```

4. **View Results**
   ```bash
   python3 -m http.server 8000
   # Open http://localhost:8000/lore-viewer.html
   ```

## 📋 Pipelines

### Core Generation
- **Build facts from Azgaar**: `npm run facts:build`
- **Compute derived statistics**: `npm run facts:derive`
- **Create prompt packs**: `npm run facts:promptpacks`
- **Build dependency graph**: `npm run graph:build`
- **Generate rich state lore**: `npm run lore:state:full -- --id=ID`
- **Generate rich burg lore**: `npm run lore:burg:full -- --id=ID`

### Event-Driven Updates
- **Apply events**: `npm run events:apply -- --file=events/demo.json`
- **Dirty regeneration**: `npm run lore:dirty -- --node=state:ID`
- **Chained event+regen**: `npm run events:apply+regen -- --file=events/demo.json`

### Cost-Optimized Hooks
- **Refresh burg hooks**: `npm run lore:burg:hooks -- --id=ID`
- **Refresh state hooks**: `npm run lore:state:hooks -- --id=ID`
- **Batch summaries**: `npx tsx src/pipelines/genBurgSummaries.ts`

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

index/              # LLM-optimized data
├── promptFacts/    # Compact fact packs
│   ├── state/      # State prompt packs
│   └── burg/       # Burg prompt packs
├── graph.json      # Dependency graph
└── dirty.seeds.json # Event-driven change seeds

lore/               # Generated lore
├── burg/           # Rich burg lore
├── state/          # Rich state lore
└── province/       # Province lore (future)

schemas/            # JSON schemas
├── lore.state.full.schema.json
└── lore.burg.full.schema.json
```

## 🎨 Lore Viewer

A beautiful HTML viewer to explore generated content:

- **Modern responsive design** with tabbed navigation
- **Organized display** of summaries, factions, notables, and adventure hooks
- **Metadata tracking** with generation timestamps and hashes
- **Auto-loading** of all available lore files

## 🧙‍♂️ LoreGen Dashboard

A unified HTML interface combining testing, pipeline execution, and lore viewing:

- **`loregen-dashboard.html`** - Complete dashboard with three main tabs:
  - **🧪 Test Suite** - Comprehensive functionality verification (19 tests across 5 categories)
  - **🏗️ Pipeline Runner** - Step-by-step world generation with detailed API logging and progress tracking
  - **🏰 Lore Viewer** - Browse and explore generated lore files
- **Real-time debugging** with shared debug panel across all tabs
- **Visual progress tracking** with animated progress bars and status indicators
- **Detailed API logging** showing request/response data, token usage, and timing
- **Two execution modes**: Simulated (fast) and Real (detailed API simulation)
- **No generation required** for testing - validates logic without API calls

**Usage:**
```bash
# Open in browser
open loregen-dashboard.html
# Or serve locally
python3 -m http.server 8000
# Navigate to http://localhost:8000/loregen-dashboard.html
```

**Pipeline Runner Features:**
- **🚀 Run Full Pipeline** - Simulated execution with realistic timing
- **⚡ Run Real Pipeline** - Enhanced simulation with detailed API logging
- **📊 Progress Tracking** - Real-time progress bars and step indicators
- **🐛 Debug Logging** - Detailed API request/response data, token usage, timing
- **⚙️ Configuration** - Set State ID and Burg ID for generation steps

### Legacy Files
- **`test-suite.html`** - Standalone test suite (superseded by dashboard)
- **`pipeline-runner.html`** - Standalone pipeline runner (superseded by dashboard)
- **`lore-viewer.html`** - Standalone lore viewer (superseded by dashboard)

## ⚡ Features

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

**Rich Lore Generation:**
```bash
npm run lore:state:full -- --id=1  # Complete state lore with GPT-5
npm run lore:burg:full -- --id=1   # Complete burg lore with GPT-5
```

**Event-Driven Updates:**
```bash
npm run events:apply -- --file=events/demo.json  # Apply event
npm run lore:dirty -- --node=state:1             # Regenerate affected
# Or chain both: npm run events:apply+regen -- --file=events/demo.json
```

**Cost-Efficient Updates:**
```bash
npm run lore:burg:hooks -- --id=1  # Just refresh adventure hooks
npx tsx src/pipelines/genBurgSummaries.ts  # Batch summaries
```

**View Results:**
```bash
python3 -m http.server 8000
# Navigate to http://localhost:8000/lore-viewer.html
```
