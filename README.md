# Southia Lore (Facts → Lore)

A comprehensive world-building system that generates rich lore for fantasy worlds using AI models with intelligent cost optimization and dependency tracking.

## 🚀 Quick Start

1. **Setup Environment**
   ```bash
   npm install
   cp .env.example .env  # Add your OPENAI_API_KEY
   ```

2. **Initialize Database (Optional)**
   ```bash
   npm run db:init        # Initialize Netlify database with Drizzle boilerplate
   npm run db:import      # Import existing JSON data to database
   ```

3. **Build Complete World**
   ```bash
   npm run facts:build        # Extract facts from Azgaar data
   npm run facts:derive       # Compute derived statistics
   npm run facts:promptpacks  # Create LLM-optimized fact packs
   npm run graph:build        # Build dependency graph
   ```

4. **Generate Canon Outlines** (Two-Pass Foundation)
   ```bash
   npm run canon:world:outline        # World-level context (eras, civilizations, tech/magic)
   npm run canon:interstate:outline   # Inter-state relationships (alliances, wars, trade)
   npm run canon:state:outline        # Per-state outlines (factions, culture, regions)
   npm run canon:province:outline     # Province outlines (synthetic from state regions)
   npm run canon:burg:outline         # Burg outlines (from fact data)
   ```

5. **Build Marker Index** (Azgaar Markers)
   ```bash
   npm run canon:markers:index        # Extract markers from Azgaar JSON (Chalkvish Obelisk, etc.)
   ```

6. **Generate Cross-Link Suggestions** (Deterministic Affinities + Hook Placements)
   ```bash
   npm run links:suggest              # Cross-state affinities + marker-driven hook placements
   ```

7. **Generate Heraldry** (Armoria Integration)
   ```bash
   npm run heraldry:gen              # Generate all heraldry (states, provinces, burgs)
   npm run heraldry:gen:states       # Generate state heraldry only
   npm run heraldry:gen:provinces    # Generate province heraldry only
   npm run heraldry:gen:burgs        # Generate burg heraldry only
   ```

8. **Generate Watabou Maps** (City & Village Maps)
   ```bash
   npm run canon:watabou:links       # Generate Watabou URLs for all burgs
   npm run canon:watabou:assets      # Generate SVG maps for all burgs
   npm run prepare:assets            # Copy assets to public directory
   ```

9. **Generate Rich Lore**
   ```bash
   npm run lore:state:full -- --id=1  # Rich state lore with GPT-5
   npm run lore:burg:full -- --id=1   # Rich burg lore with GPT-5
   ```

10. **Build Catalog**
    ```bash
    npm run catalog:build  # Create compact UI index
    ```

11. **View Results**
   ```bash
   # Option 1: Next.js Lore UI (Modern React Dashboard with Scrollytelling Landing)
   npm run next:dev
   # Open http://localhost:3000
   # Features: Parallax landing page, Dashboard, States, Provinces, Burgs, Markers, Hooks, Events, QA
   
   # Option 2: Express Dashboard (Full Pipeline Control)
   npm run server
   # Open http://localhost:3002
   
   # Option 3: Static HTML (Legacy)
   python3 -m http.server 8000
   # Open http://localhost:8000/loregen-dashboard.html
   ```

## UI Guidelines

All UI work in this repo follows the UI Guidelines at `.clinerules/ui-guidelines.md`. Treat them as non‑negotiable defaults for Next.js pages/components, Tailwind styles, and shadcn/ui primitives.

Key points:
- Semantic HTML, keyboard support, and visible focus.
- Use design tokens (CSS variables) via Tailwind; avoid hard-coded colors.
- Compose shadcn/ui primitives; use `cva` for variants; use `cn()` to merge classes.
- Mobile-first responsive; dark/light compatible; no console errors.
- Forms: react-hook-form + zod; global state with Zustand only when needed.
- Add/maintain Playwright smoke tests for new routes.

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

### Heraldry Generation (Armoria Integration)
- **Generate all heraldry**: `npm run heraldry:gen`
- **Generate state heraldry**: `npm run heraldry:gen:states`
- **Generate province heraldry**: `npm run heraldry:gen:provinces`
- **Generate burg heraldry**: `npm run heraldry:gen:burgs`

### Watabou Map Generation (City & Village Maps)
- **Generate Watabou links**: `npm run canon:watabou:links`
- **Generate SVG assets**: `npm run canon:watabou:assets`

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

### Quest & Hook System
- **Accept hook suggestions**: `npm run hooks:accept -- --sugg=id1,id2,id3`
- **Bulk hook acceptance**: `npm run hooks:accept -- --all --minScore=0.7 --limit=50`
- **Activate quest chains**: `npm run quests:activate -- --chain=chain_id --hook=hook_instance_id`

### Events Pipeline (Player Actions → Effects → Apply → Rollback)
- **Plan effects**: `npm run events:plan -- --id=action_id`
- **Apply effects**: `npm run events:apply -- --id=action_id`
- **Rollback effects**: `npm run events:rollback -- --id=action_id`

### Fast Rendering & Overlays
- **Build overlays**: `npm run overlays:build`
- **Render dirty entities**: `npm run render:dirty`
- **Render all entities**: `npm run render:all`

### Markdown Viewers
- **Generate all markdown**: `npm run render:md:all`
- **Generate burg markdown**: `npm run render:md:burg -- --id=burg_id`
- **Generate state markdown**: `npm run render:md:state -- --id=state_id`

### Cost-Optimized Hooks
- **Refresh burg hooks**: `npm run lore:burg:hooks -- --id=ID`
- **Refresh state hooks**: `npm run lore:state:hooks -- --id=ID`
- **Batch summaries**: `npx tsx src/pipelines/genBurgSummaries.ts`

### Pipeline Control
- **Request abort**: `npm run pipeline:abort`
- **Clear abort flag**: `npm run pipeline:abort:clear`
- **Validate all lore**: `npm run validate:lore`
- **Validate subset**: `npm run validate:lore:subset -- --states=1,2 --burgs=10,11`

### QA / Debug Utilities
- **Time any command**: `npm run qa:time -- <command>`
- **Compare JSON files/directories**: `npm run qa:diff -- --left=<path> --right=<path>`
- **Show dirty list**: `npm run qa:dirty`
- **Validate against schemas**: `npm run qa:validate -- --schema=<schema> --dir=<dir>`
- **Run with rate limiting + timing**: `npm run qa:run:safe -- <command>`
- **Show dry-run usage**: `npm run qa:dryhint`

### Database Operations
- **Initialize database**: `npm run db:init`
- **Import JSON data**: `npm run db:import`

### Next.js Burg Viewer
- **Start development server**: `npm run next:dev`
- **Build for production**: `npm run next:build`
- **Start production server**: `npm run next:start`

## 🎯 Model Strategy

Intelligent model selection for optimal cost/quality balance:

- **`gpt-5`** → Full lore generation (states/burgs, correctness-sensitive)
- **`gpt-5-nano`** → Bulk summaries and batch operations
- **`gpt-5-mini`** → Partial regen (adventure hooks only)

## 📁 Output Structure

Generated content is organized across multiple directories:

```text
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
├── quests/         # Quest hook templates
│   └── hooks/      # Hook template definitions
│       └── hook_untranslated_monolith.outline.json # Untranslated monolith hook
├── hooks/          # Materialized hook instances
│   └── materialized/ # Per-burg hook instances
│       └── {burg_id}/ # Hook instances for specific burgs
└── events/         # Event records
    ├── player/     # Player action events
    ├── applied/    # Applied event records with inverse operations
    └── quests/     # Quest activation events

assets/             # Generated assets
├── heraldry/       # Armoria-generated coat of arms
│   ├── state/      # State heraldry (SVG files)
│   ├── province/   # Province heraldry (SVG files)
│   └── burg/       # Burg heraldry (SVG files)
└── watabou/        # Watabou-generated city & village maps
    ├── city/       # City maps (SVG files)
    └── village/    # Village maps (SVG files)

index/              # LLM-optimized data
├── promptFacts/    # Compact fact packs
│   ├── state/      # State prompt packs
│   └── burg/       # Burg prompt packs
├── effects/        # Effects proposals and applied records
│   └── proposed/   # LLM-generated effect proposals
├── graph.json      # Dependency graph
├── catalog.json    # UI catalog (kingdoms + burgs)
├── markers.json    # Marker index (Chalkvish Obelisk, Gneab Pillar, etc.)
├── link_suggestions.json # Cross-link suggestions (affinities + hook placements)
├── heraldry_map.json # Heraldry index (states, provinces, burgs → SVG paths)
├── watabou_links.json # Watabou URLs for all burgs (city/village generator links)
├── watabou_map.json # Watabou SVG assets index (burgs → SVG paths)
├── dirty.seeds.json # Event-driven change seeds
├── dirty.json      # Current dirty entities for regeneration
├── validate-summary.json # Validation results
├── runs/           # Usage logs (daily files)
└── abort.flag      # Abort control flag

lore/               # Generated lore
├── burg/           # Rich burg lore
├── state/          # Rich state lore
├── province/       # Province lore (future)
└── overlays/       # World state overlays
    ├── burg/       # Burg overlays (population, trade, hooks, assets)
    └── state/      # State overlays (trade, law, reputations)

rendered/           # UI-ready rendered data
├── burg/           # Rendered burg data (outline + overlay + heraldry)
└── state/          # Rendered state data (outline + overlay + heraldry)

rendered_md/        # Markdown viewers
├── burg/           # Burg markdown files
└── state/          # State markdown files

state/              # Persistent world state
├── world_state.json # Aggregated world state (population, trade, reputations, law)
├── hooks_available.json # Available hook instances
└── quests_active.json # Active quest chains

schemas/            # JSON schemas
├── world_canon_outline.schema.json
├── interstate_outline.schema.json
├── state_outline.schema.json
├── province_outline.schema.json
├── burg_outline.schema.json
├── markers_index.schema.json
├── hook_template_outline.schema.json
├── hook_instance.schema.json
├── quest_ops.schema.json
├── effect_item.schema.json
├── effects_bundle.schema.json
├── player_action.schema.json
├── burg_overlay.schema.json
├── state_overlay.schema.json
├── render_burg.schema.json
├── render_state.schema.json
├── link_suggestions.schema.json
├── lore.state.full.schema.json
└── lore.burg.full.schema.json
```

## 🎨 Viewing Options

### Next.js Lore UI (Modern React Dashboard)
A comprehensive, production-ready React application for exploring and managing your world:

- **Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS
- **Next.js 15 Compatible**: Updated for Next.js 15's async params and searchParams
- **Polished Design System**: Consistent brand colors, accessible components, and professional styling
- **Scrollytelling Landing Page**: Parallax hero section with scroll-triggered animations and dynamic data
- **Landing Page Features**: 
  - Parallax effects with reduced motion support for accessibility
  - Dynamic stats showing States, Burgs, and Markers counts
  - Navigation cards for different sections (States, Provinces, Burgs, Markers)
  - "Discover by Mood" section with themed exploration tags
  - Quest Chains section with action buttons
  - Scroll progress indicator
- **Dashboard**: Key metrics including dirty queue, heraldry count, and hook instances
- **States Management**: Browse all states with economy, culture, and overlay information
- **Provinces Explorer**: Complete province information with economy niches and burg listings
- **Burgs Explorer**: Complete burg information with heraldry, overlays, active hooks, and Watabou maps
- **Markers Index**: View all mysterious markers with legend text and runes
- **Hooks System**: Accept hook suggestions and activate quest chains with confirmation dialogs
- **Events Pipeline**: Plan and apply player actions with real-time effects and undo affordances
- **QA Operations**: Build overlays, render dirty entities, and manage pipeline state
- **Heraldry Display**: Shows coat of arms from generated SVG assets with proper alt text
- **Overlay Pills**: Population, trade, law enforcement, and damage status indicators
- **Click-through Navigation**: States → Provinces → Burgs → Burg Detail
- **Asset Management**: Automatic SVG asset copying for deployment
- **Responsive Design**: Works perfectly on desktop and mobile
- **API Integration**: Secure CLI integration through whitelisted npm scripts
- **Real-time Updates**: Live data from your pipeline outputs
- **Accessibility**: WCAG compliant with keyboard navigation, screen reader support, and proper ARIA labels
- **Loading States**: Skeleton loaders and spinners for better perceived performance
- **Toast Notifications**: Instant feedback for all user actions with success/error states
- **Confirmation Dialogs**: Safe destructive operations with clear messaging
- **Focus Management**: Proper focus rings and keyboard navigation support

**Usage:**
```bash
npm run next:dev
# Open http://localhost:3000
# Navigate to: Dashboard, States, Provinces, Burgs, Markers, Hooks, Events, QA
```

### Lore Explorer (HTML Dashboard)
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

## 🗄️ Database Migration

### Postgres Integration with Netlify DB (Neon)

The project now supports both JSON file storage and Postgres database storage via Netlify DB:

#### Database Schema
- **States**: `stateId`, `name`, `slug`, `summary`, `heraldrySvgUrl`
- **Provinces**: `stateId`, `provinceId`, `name`, `slug`, `summary`
- **Burgs**: `burgId`, `stateId`, `provinceId`, `name`, `kind`, `population`, `lat`, `lon`, `citySvgUrl`, `villageSvgUrl`, `watabouUrl`
- **Markers**: `id`, `name`, `type`, `description`, `runeHtml`, `stateId`, `provinceId`, `burgId`

#### Migration Process
1. **Initialize**: `npm run db:init` - Sets up Netlify database with Drizzle ORM
2. **Import**: `npm run db:import` - Migrates existing JSON data to Postgres
3. **Deploy**: Database automatically provisions on Netlify deployment with generous free tier

#### Benefits
- **Better Performance**: Database queries are faster than file system operations
- **Easier Querying**: SQL queries for complex relationships and filtering
- **Scalability**: Handles larger datasets more efficiently
- **Real-time Updates**: Foundation for future real-time features

#### Next.js Integration
- **Server Components**: All pages now use database queries instead of JSON files
- **Type Safety**: Drizzle ORM provides full TypeScript support
- **Automatic Environment**: Uses `NETLIFY_DATABASE_URL` automatically

## ⚡ Features

### Two-Pass Canon System
- **World Canon Outline**: Global context (eras, civilizations, tech/magic baseline)
- **Inter-State Outline**: Relationships between states (alliances, wars, trade blocs)
- **State Outlines**: Per-state foundations (factions, culture, regions, constraints)
- **Hierarchical Consistency**: Each layer references and builds upon the previous
- **Cheap Regeneration**: Outline passes are fast and can be run frequently

### Robust Rate Limiting & QA Tools
- **Auto-retry with exponential backoff**: Handles OpenAI 429 rate limit errors gracefully
- **Server-provided retry hints**: Honors OpenAI's retry-after headers
- **Configurable limits**: Environment variables for max retries and base delays
- **Jittered delays**: Prevents thundering herd problems
- **Compact logging**: Clear retry status for monitoring
- **Dry-run mode**: Test pipelines without writing files using `DRY_RUN=1`
- **Timing utilities**: Measure execution time of any command
- **JSON diffing**: Compare outputs and see exactly what changed
- **Schema validation**: Validate generated content against JSON schemas
- **Dirty tracking**: Quick status checks for entities needing regeneration

### Smart Caching & Dependency Tracking
- Lore files store `hashOfInputs` for intelligent regeneration
- Skip regeneration when inputs haven't changed
- Dependency graph tracks relationships between entities
- Event-driven dirty regeneration for targeted updates

### Rich Data Processing
- **Azgaar integration**: Extracts facts from fantasy map generators
- **Canonical name mapping**: Uses exact names from master JSON (e.g., "Slor'th" not "State_1")
- **Derived statistics**: Computes aggregations (top burgs, dominant cultures, etc.)
- **Prompt optimization**: Creates compact, LLM-ready fact packs
- **Validation**: Sanity checks prevent contradictions

### Armoria Heraldry Integration
- **Deterministic generation**: Same entity always generates same coat of arms
- **Stable file names**: Safe seed generation for consistent paths
- **Concurrent processing**: Configurable API rate limiting for efficiency
- **Comprehensive indexing**: Complete mapping for UI integration
- **Multiple formats**: SVG (preferred) and PNG support
- **Environment configuration**: ARMORIA_BASE, HERALDRY_FORMAT, HERALDRY_SIZE, HERALDRY_CONCURRENCY

### Watabou Map Integration
- **Deterministic URLs**: Stable Watabou generator links with proper parameters
- **SVG Asset Generation**: High-quality vector maps for cities and villages
- **Smart Classification**: Cities vs villages based on population and features
- **Feature-Aware**: Includes citadel, walls, temple, plaza, and other burg features
- **UI Integration**: Seamless display in burg pages with fallback to Watabou links
- **Asset Management**: Automatic copying to public directory for deployment

### Structured Outputs
- Uses OpenAI **Chat Completions API** with **json_schema** response_format
- Enforced JSON structure with validation
- Rich, detailed world-building content with adventure hooks

### Quest & Hook System
- **Hook Templates**: Reusable quest hook definitions with chain associations
- **Hook Suggestions**: AI-powered placement suggestions based on markers and context
- **Hook Materialization**: Convert suggestions to concrete hook instances per burg
- **Chain Activation**: Activate quest chains with automatic sibling suppression
- **Deterministic IDs**: Consistent hook instance generation using FNV1a hashing

### Events Pipeline (Player Actions → Effects → Apply → Rollback)
- **Player Actions**: Structured action logging with location, magnitude, and quest context
- **LLM Effects Planning**: AI-generated effect proposals based on action context
- **World State Application**: Apply effects to persistent world state with dirty tracking
- **Rollback System**: Complete rollback capability with inverse operations
- **Audit Trail**: Full event history with applied records and rollback archives

### Fast Rendering & Overlays
- **Overlay Generation**: Compute world state overlays from persistent state
- **Fast Rendering**: Combine outlines + overlays + heraldry without LLM calls
- **Dirty Tracking**: Incremental updates for only affected entities
- **UI-Ready Output**: Structured JSON perfect for frontend consumption
- **Performance**: Sub-second rendering for hundreds of entities

### Markdown Viewers
- **Zero Dependencies**: Clean markdown files viewable in any editor
- **Rich Content**: Heraldry, overlays, active hooks, and runic markers
- **Structured Data**: Economy, culture, religion, and faction reputations
- **Runic Integration**: Ancient inscriptions with proper Unicode display
- **Easy Sharing**: Perfect for documentation and collaboration

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
```text
src/
├── gen/            # AI generation utilities
├── pipelines/      # Lore generation scripts
├── derive/         # Data derivation and aggregation
├── ingest/         # Azgaar data processing & canonical names
├── heraldry/       # Armoria heraldry integration
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

**Heraldry Generation:**
```bash
npm run heraldry:gen               # Generate all heraldry (states, provinces, burgs)
npm run heraldry:gen:states        # Generate state heraldry only
npm run heraldry:gen:provinces     # Generate province heraldry only
npm run heraldry:gen:burgs         # Generate burg heraldry only
```

**Watabou Map Generation:**
```bash
npm run canon:watabou:links        # Generate Watabou URLs for all burgs
npm run canon:watabou:assets       # Generate SVG maps for all burgs
npm run prepare:assets             # Copy assets to public directory
npm run render:dirty               # Update rendered burgs with map paths
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

**Quest & Hook System:**
```bash
# Accept specific hook suggestions
npm run hooks:accept -- --sugg=hook_place_marker_fnv1a_f30069c5,hook_place_marker_fnv1a_63492914

# Bulk accept with score filtering
npm run hooks:accept -- --all --minScore=0.75 --limit=20

# Activate a quest chain (withdraws siblings automatically)
npm run quests:activate -- --chain=chain_runic_mystery --hook=hookinst_fnv1a_7cca2de7
```

**Events Pipeline (Player Actions → Effects → Apply → Rollback):**
```bash
# 1. Create player action file (events/player/act_2025_09_09_portgrey_arson.json)
# 2. Plan effects via LLM
npm run events:plan -- --id=act_2025_09_09_portgrey_arson

# 3. Apply effects to world state
npm run events:apply -- --id=act_2025_09_09_portgrey_arson

# 4. Rollback if needed
npm run events:rollback -- --id=act_2025_09_09_portgrey_arson
```

**Fast Rendering & Overlays:**
```bash
# After events/quests mark entities as dirty
npm run overlays:build    # Build overlays from world state
npm run render:dirty      # Render only dirty entities
npm run render:all        # Render all entities
```

**Markdown Viewers:**
```bash
# Generate markdown for all rendered entities
npm run render:md:all

# Generate specific burg/state markdown
npm run render:md:burg -- --id=1
npm run render:md:state -- --id=0

# View in any markdown viewer
open rendered_md/burg/1.md
open rendered_md/state/0.md
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

**QA / Debug Utilities:**
```bash
# Time any command execution
npm run qa:time -- npm run canon:province:outline

# Dry-run any pipeline (no file writes)
DRY_RUN=1 NODE_OPTIONS=--require=./src/qa/patchDryRun.js npm run canon:burg:outline

# Compare outputs against snapshots
tsx src/qa/diffJson.ts --left=rendered/burg --right=_snap/rendered/burg

# Check current dirty status
npm run qa:dirty

# Validate JSON against schemas
npm run qa:validate -- --schema=schemas/render_burg.schema.json --dir=rendered/burg

# Run with rate limiting + timing
npm run qa:run:safe -- npm run links:suggest

# Rate-limit safe execution with custom limits
LORE_TPM_LIMIT=30000 LORE_AVG_REQ_TOKENS=650 DEBUG=rl npm run canon:burg:outline
```

**Build Catalog & View Results:**
```bash
npm run catalog:build  # Create compact UI index

# Option 1: Next.js Lore UI (Modern React Dashboard)
npm run next:dev
# Open http://localhost:3000
# Features: Dashboard, States, Provinces, Burgs, Markers, Hooks, Events, QA

# Option 2: Express Dashboard (Full Pipeline Control)
npm run server
# Open http://localhost:3002

# Option 3: Static HTML (Legacy)
python3 -m http.server 8000
# Navigate to http://localhost:8000/loregen-dashboard.html
```
