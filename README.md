# Southia Lore (Facts → Lore)

A comprehensive world-building system that generates rich lore for fantasy worlds using AI models with intelligent cost optimization.

## 🚀 Quick Start

1. **Setup Environment**
   ```bash
   npm install
   cp .env.example .env  # Add your OPENAI_API_KEY
   ```

2. **Generate Lore**
   ```bash
   npm run lore:burg -- --id=1      # Full burg lore (quality)
   npm run lore:burg:hooks -- --id=1 # Just adventure hooks (cheap)
   npm run lore:state -- --id=1     # Full state lore (quality)
   ```

3. **View Results**
   ```bash
   python3 -m http.server 8000
   # Open http://localhost:8000/lore-viewer.html
   ```

## 📋 Pipelines

### Core Generation
- **Build facts from Azgaar**: `npm run facts:build`
- **Build dependency graph**: `npm run graph:build`
- **Generate burg lore**: `npm run lore:burg -- --id=ID`
- **Generate state lore**: `npm run lore:state -- --id=ID`
- **Apply events**: `npm run events:apply -- --file=events/demo.json`

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

Generated lore is stored in organized JSON files:

```
lore/
├── burg/           # City/town lore
│   ├── 1.json      # Burg ID 1
│   └── 2.json      # Burg ID 2
├── state/          # State/region lore
│   └── 1.json      # State ID 1
└── province/       # Province lore (future)
```

## 🎨 Lore Viewer

A beautiful HTML viewer to explore generated content:

- **Modern responsive design** with tabbed navigation
- **Organized display** of summaries, factions, notables, and adventure hooks
- **Metadata tracking** with generation timestamps and hashes
- **Auto-loading** of all available lore files

## ⚡ Features

### Smart Caching
- Lore files store `hashOfInputs` for intelligent regeneration
- Skip regeneration when inputs haven't changed
- Section-specific caching for hooks-only updates

### Structured Outputs
- Uses OpenAI **Chat Completions API** with **json_schema** response_format
- Enforced JSON structure with validation
- Rich, detailed world-building content

### Cost Optimization
- **Quality-first** approach for important content
- **Efficient models** for bulk operations
- **Hooks-only refresh** to update just adventure content

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
├── util/           # Helper functions
└── types/          # TypeScript definitions
```

## 📊 Usage Examples

**Full Quality Generation:**
```bash
npm run lore:burg -- --id=1    # Complete burg lore with GPT-5
npm run lore:state -- --id=1   # Complete state lore with GPT-5
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
