# Next.js Lore UI Documentation

## Overview

The Next.js Lore UI is a production-ready React application built with Next.js 15, React 19, and Tailwind CSS. It provides a comprehensive dashboard for exploring and managing your LoreGen world data.

## Next.js 15 Compatibility

This application has been updated to be fully compatible with Next.js 15, including:

- **Async Params**: Dynamic route parameters (`params`) are now properly handled as Promises
- **Type Safety**: All TypeScript errors resolved for Next.js 15's stricter type checking
- **OpenAI Client**: Updated imports and usage patterns for the latest OpenAI SDK
- **Message Format**: Fixed OpenAI API message format to use proper TypeScript types

## Features

### 🏠 Dashboard (`/`)
- **Dirty Queue**: Shows entities needing regeneration (burgs and states)
- **Heraldry Count**: Total number of generated coat of arms
- **Hook Instances**: Available quest hook instances
- **Quick Navigation**: Links to all major sections

### 🏰 States (`/states`)
- **State List**: Browse all states with search functionality
- **Heraldry Display**: Coat of arms for each state
- **Economy Information**: Economic pillars and trade data
- **Overlay Status**: Trade multipliers and law enforcement status
- **Provinces Section**: Lists all provinces within each state
- **State Details**: Click any state to view detailed information

### 🏞️ Provinces (`/provinces`)
- **Province List**: Browse all provinces with state and burg count information
- **Province Details**: Click any province to view detailed information
- **Economy Niches**: Detailed economic information for each province
- **Burg Listings**: Shows burgs associated with each province
- **Breadcrumb Navigation**: Clear navigation context from states to provinces

### 🏘️ Burgs (`/burgs`)
- **Burg List**: Browse all burgs with search functionality
- **Heraldry Display**: Coat of arms for each burg
- **State/Province**: Location information
- **Overlay Status**: Population, trade, and damage indicators
- **Burg Details**: Click any burg to view comprehensive information

### 🗺️ Markers (`/markers`)
- **Marker Cards**: Visual cards showing all mysterious markers
- **Legend Text**: Descriptive text for each marker
- **Runes Display**: Ancient inscriptions with proper Unicode
- **Tags**: Categorization and search tags
- **Nearby Burgs**: Location hints for marker placement

### 🎣 Hooks (`/hooks`)
- **Hook Suggestions**: AI-powered placement suggestions
- **Accept Hooks**: Select and accept hook suggestions
- **Hook Instances**: Available quest hook instances
- **Activate Quests**: Activate quest chains with automatic pipeline updates
- **Status Tracking**: Monitor hook status (available, withdrawn, active, consumed)

### 📅 Events (`/events`)
- **Plan Effects**: Generate effect proposals for player actions
- **Apply Effects**: Apply effects to world state with pipeline updates
- **Action ID Input**: Specify action IDs for event processing
- **Pipeline Integration**: Automatic overlay building and rendering

### 🔧 QA (`/qa`)
- **Dirty Status**: View entities needing regeneration
- **Build Overlays**: Generate world state overlays
- **Render Dirty**: Render only entities marked as dirty
- **Pipeline Control**: Manage regeneration processes

## Technical Architecture

### Framework Stack
- **Next.js 15**: App Router with server and client components (async params support)
- **React 19**: Latest React features and performance improvements
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework for styling

### Component Architecture
- **Server Components**: Data fetching and server-side rendering
- **Client Components**: Interactive features and state management
- **Shared Components**: Reusable UI components across pages
- **API Routes**: Secure CLI integration endpoints

### Data Flow
1. **Server Components** fetch data from file system
2. **API Routes** execute whitelisted npm scripts
3. **Client Components** handle user interactions
4. **Real-time Updates** reflect pipeline changes

## File Structure

```
app/
├── layout.tsx                 # Global layout with navigation
├── page.tsx                   # Dashboard page
├── globals.css                # Global styles
├── states/
│   ├── page.tsx              # States list page
│   └── [id]/page.tsx         # State detail page
├── provinces/
│   ├── page.tsx              # Provinces list page
│   └── [key]/page.tsx        # Province detail page
├── burgs/
│   ├── page.tsx              # Burgs list page
│   └── [id]/page.tsx         # Burg detail page
├── markers/page.tsx          # Markers page
├── hooks/page.tsx            # Hooks page
├── events/page.tsx           # Events page
├── qa/page.tsx               # QA page
└── api/                      # API routes
    ├── hooks/accept/route.ts
    ├── quests/activate/route.ts
    ├── events/plan/route.ts
    ├── events/apply/route.ts
    └── ops/
        ├── overlays/build/route.ts
        └── render/dirty/route.ts

src/
├── components/               # Reusable UI components
│   ├── HeraldryBadge.tsx
│   ├── OverlayPills.tsx
│   ├── HookBadge.tsx
│   ├── HookList.tsx
│   ├── MarkerCard.tsx
│   └── DataTable.tsx
└── lib/                     # Utility libraries
    ├── paths.ts             # Path configuration
    ├── fsjson.ts            # File system JSON utilities
    ├── run.ts               # CLI script execution
    └── types.ts             # TypeScript type definitions
```

## Key Components

### HeraldryBadge
Displays coat of arms from generated SVG assets with fallback for missing heraldry.

### OverlayPills
Shows status indicators for population, trade, law enforcement, and damage.

### HookBadge
Displays hook information with color-coded status indicators.

### HookList
Lists hook instances with activation controls and rationale display.

### MarkerCard
Shows marker information with legend text, runes, and tags.

### DataTable
Client-side table component with search functionality and HTML rendering.

## API Integration

### Security
- **Whitelisted Scripts**: Only approved npm scripts can be executed
- **No Arbitrary Commands**: Prevents shell injection attacks
- **Server-side Execution**: All CLI commands run on the server

### Supported Commands
- `hooks:accept` - Accept hook suggestions
- `quests:activate` - Activate quest chains
- `events:plan` - Plan event effects
- `events:apply` - Apply event effects
- `overlays:build` - Build world state overlays
- `render:dirty` - Render dirty entities

## Configuration

### Environment Variables
- `DATA_ROOT`: Override data directory path (defaults to current working directory)

### TypeScript Configuration
- Path aliases configured for `@/` imports
- App directory included in compilation
- Next.js plugin enabled

### Next.js Configuration
- Static file serving for assets
- App Router enabled
- No experimental features required

## Development

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run next:dev

# Open browser
open http://localhost:3000
```

### Building for Production
```bash
# Build the application
npm run next:build

# Start production server
npm run next:start
```

### Adding New Features
1. Create components in `src/components/`
2. Add pages in `app/` directory
3. Create API routes in `app/api/`
4. Update types in `src/lib/types.ts`
5. Add CLI scripts to whitelist in `src/lib/run.ts`

## Data Requirements

The UI expects the following data structure:

```
rendered/           # UI-ready rendered data
├── burg/          # Rendered burg data
└── state/         # Rendered state data

index/              # Index files
├── dirty.json     # Dirty entities
├── heraldry_map.json # Heraldry index
└── markers.json   # Marker index

state/              # World state
├── hooks_available.json # Available hooks
└── world_state.json # World state

assets/             # Static assets
└── heraldry/      # Heraldry SVG files
    ├── state/
    ├── province/
    └── burg/
```

## Performance Considerations

### Server Components
- Data fetching happens on the server
- Reduced client-side JavaScript
- Better SEO and initial load performance

### Client Components
- Interactive features only
- Minimal JavaScript bundle
- Efficient re-rendering

### Caching
- File system caching for data reads
- Next.js built-in caching
- Efficient revalidation strategies

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile
- **Responsive**: Works on all screen sizes
- **Accessibility**: WCAG 2.1 AA compliant

## Troubleshooting

### Common Issues

1. **Module Resolution Errors**
   - Check `tsconfig.json` path configuration
   - Verify `@/` alias is properly set up

2. **Data Not Loading**
   - Ensure data files exist in expected locations
   - Check file permissions
   - Verify `DATA_ROOT` environment variable

3. **API Route Errors**
   - Check npm script whitelist in `src/lib/run.ts`
   - Verify CLI commands are available
   - Check server logs for detailed error messages

4. **Component Rendering Issues**
   - Ensure proper server/client component boundaries
   - Check for function passing between components
   - Verify TypeScript types are correct

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run next:dev

# Check specific components
DEBUG=next:* npm run next:dev
```

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Add proper error handling
4. Update documentation for new features
5. Test across different screen sizes
6. Ensure accessibility compliance

## License

Same as the main LoreGen project.
