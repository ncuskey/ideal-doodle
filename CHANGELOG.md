# Changelog

## [2025-01-10] - Database Migration to Postgres with Netlify (Neon)

### 🗄️ Major Database Integration
- **Postgres Database**: Added full Postgres support via Netlify (Neon) integration
- **Drizzle ORM**: Implemented type-safe database operations with Drizzle ORM
- **Database Schema**: Created comprehensive schema for states, provinces, burgs, and markers
- **Migration Script**: Built import script to migrate existing JSON data to Postgres
- **Next.js Integration**: Updated all pages to use database queries instead of JSON files

### 🏗️ Technical Implementation
- **Database Client**: Created `src/db/client.ts` with Neon HTTP driver integration
- **Schema Definition**: Built `src/db/schema.ts` with proper relationships and constraints
- **Import Pipeline**: Developed `scripts/importToDb.ts` for seamless data migration
- **Type Safety**: Full TypeScript support with Drizzle ORM type inference
- **Environment Integration**: Automatic `NETLIFY_DATABASE_URL` usage

### 📊 Database Schema
- **States Table**: `stateId`, `name`, `slug`, `summary`, `heraldrySvgUrl`
- **Provinces Table**: `stateId`, `provinceId`, `name`, `slug`, `summary` (composite primary key)
- **Burgs Table**: `burgId`, `stateId`, `provinceId`, `name`, `kind`, `population`, coordinates, map URLs
- **Markers Table**: `id`, `name`, `type`, `description`, `runeHtml`, location references

### 🚀 Deployment Features
- **Auto-provisioning**: Database automatically created during Netlify deployment
- **NPM Scripts**: Added `db:init` and `db:import` commands for database management
- **Asset Preservation**: All existing heraldry and map assets continue to work
- **Backward Compatibility**: JSON files still supported for simple deployments

### 📚 Documentation Updates
- **README.md**: Added database migration section with schema details and benefits
- **DEPLOYMENT.md**: Updated with Netlify database setup instructions
- **Migration Guide**: Comprehensive documentation for database setup and import process

### ✅ Production Ready
- **Build Success**: All database code compiles without errors
- **Type Safety**: Full TypeScript support with proper type inference
- **Migration Ready**: Import script handles all existing data formats
- **Netlify Compatible**: Works seamlessly with Netlify's Neon integration

### 🎯 Benefits
- **Performance**: Database queries are faster than file system operations
- **Scalability**: Handles larger datasets more efficiently
- **Querying**: SQL queries for complex relationships and filtering
- **Real-time Ready**: Foundation for future real-time features
- **Type Safety**: Compile-time type checking for all database operations

## [2025-01-09] - UI Polish Pack (v2) - Complete Design System Overhaul

### 🎨 Major UI Improvements
- **Design System**: Implemented comprehensive design tokens with consistent brand colors (indigo palette)
- **Accessibility**: Full WCAG compliance with keyboard navigation, screen reader support, and proper ARIA labels
- **Component Library**: Built reusable UI primitives (Button, Spinner, Skeleton, Toast, Confirm)
- **Loading States**: Added skeleton loaders and spinners for better perceived performance
- **Toast System**: Context-based notifications with success/error/info states
- **Confirmation Dialogs**: Safe destructive operations with clear messaging

### 🧭 Navigation & UX
- **Predictable Navigation**: Clean, responsive navigation with active state indicators
- **Breadcrumbs**: Flexible breadcrumb navigation for deep linking
- **Skip Links**: Proper skip-to-content functionality for keyboard users
- **Focus Management**: Visible focus rings and proper keyboard navigation

### 📱 Enhanced Pages
- **Hooks Page**: Client-side form handling with loading states and confirmation dialogs
- **Events Page**: Unified form with real-time validation and confirmation dialogs
- **Loading Skeletons**: Created for states and burgs pages
- **Instant Feedback**: All interactions provide immediate visual feedback

### ♿ Accessibility Features
- **ARIA Labels**: Proper labeling for navigation, tables, and form controls
- **Screen Reader Support**: Table captions, skip links, and semantic landmarks
- **Keyboard Navigation**: Full keyboard navigation with visible focus indicators
- **Image Alt Text**: Descriptive alt text for heraldry images
- **Color Contrast**: All text meets WCAG contrast requirements
- **Interactive Targets**: All buttons and controls are ≥44×44px

### 🎯 Technical Implementation
- **CSS Custom Properties**: Consistent design tokens for colors, spacing, and typography
- **Motion Conservative**: Respects user motion preferences with `prefers-reduced-motion`
- **TypeScript**: Fully typed components with proper prop interfaces
- **Build Success**: All components compile without errors
- **Responsive Design**: Works perfectly on all screen sizes

### 📚 Documentation Updates
- Updated `README.md` with new UI polish features
- Added comprehensive changelog documentation
- Documented accessibility improvements and design system

### ✅ Production Ready
- **Build Success**: `npm run next:build` completes successfully
- **TypeScript**: All type checking passes
- **Linting**: All linting rules pass
- **Accessibility**: WCAG compliant and keyboard accessible
- **Performance**: Optimized with proper loading states

## [2025-01-09] - SVG Asset Loading & Provinces Navigation

### 🎨 New Features
- **Provinces Navigation**: Added complete click-through layering (States → Provinces → Burgs → Burg Detail)
- **Provinces List Page**: Browse all provinces with state and burg count information
- **Province Detail Pages**: Detailed province information with economy niches and burg listings
- **Enhanced State Pages**: Added provinces section to state detail pages
- **Breadcrumb Navigation**: Clear navigation context throughout the site

### 🔧 Build & Deployment Fixes
- **SVG Asset Loading**: Fixed SVG loading issue for Netlify deployments
- **Asset Management**: Created `scripts/prepareAssets.cjs` for automatic asset copying during build
- **Build Process**: Updated `next:build` to include asset preparation step
- **Symlink Resolution**: Properly handles symlinks in asset copying process

### 🏗️ Technical Improvements
- **Dynamic Routes**: Added `export const dynamic = "force-dynamic"` for proper SSR
- **Next.js 15 Compatibility**: Fixed async params pattern for province detail pages
- **Navigation Updates**: Added "Provinces" link to main navigation
- **URL Structure**: Uses `stateId~provinceSlug` format for province URLs

### 📚 Documentation Updates
- Updated `README.md` with provinces navigation features
- Updated `NEXTJS_UI.md` with new provinces section
- Added comprehensive changelog documentation

### ✅ Production Ready
- **Netlify Deployment**: SVG assets now load correctly in production
- **Complete Navigation**: Full click-through experience from states to burgs
- **Asset Management**: Automatic asset copying during build process
- **Responsive Design**: Works perfectly on all screen sizes

## [2025-01-09] - Netlify Build Fix

### 🔧 Build Fixes
- **Netlify Deployment**: Fixed "next: not found" error during Netlify builds
- **Build Command**: Updated `netlify.toml` to include `npm install` before build
- **NPM Flags**: Changed `NPM_FLAGS` from `--version` to `--production=false` for proper dependency installation

### 📚 Documentation Updates
- Updated `DEPLOYMENT.md` with corrected build configuration
- Added troubleshooting section for "next: not found" error
- Documented the importance of explicit dependency installation

### ✅ Build Status
- **Netlify Build**: Now completes successfully without dependency errors
- **Dependency Installation**: All packages properly installed before build
- **Production Ready**: Ready for successful Netlify deployment

## [2025-01-09] - Next.js 15 Compatibility Update

### 🚀 Major Updates
- **Next.js 15 Compatibility**: Full compatibility with Next.js 15's breaking changes
- **TypeScript Fixes**: Resolved all TypeScript compilation errors for production builds
- **OpenAI SDK Updates**: Updated to work with latest OpenAI SDK patterns

### 🔧 Technical Changes

#### Next.js 15 Async Params
- Updated `app/burgs/[id]/page.tsx` to handle `params` as Promise
- Updated `app/states/[id]/page.tsx` to handle `params` as Promise
- Changed from `{ params: { id: string } }` to `{ params: Promise<{ id: string }> }`
- Added proper awaiting: `const { id: idParam } = await params;`

#### OpenAI Client Updates
- Fixed import issues across 6 pipeline files:
  - `src/pipelines/canonBurgOutline.ts`
  - `src/pipelines/canonStateOutline.ts`
  - `src/pipelines/canonProvinceOutline.ts`
  - `src/pipelines/canonInterstateOutline.ts`
  - `src/pipelines/canonWorldOutline.ts`
  - `src/pipelines/eventsPlan.ts`
- Changed `import { client, ... }` to `import { openai, ... }`
- Updated all `client.chat.completions.create()` calls to `openai.chat.completions.create()`

#### Message Format Fixes
- Fixed OpenAI API message format across all pipeline files
- Changed from `content: [{ type: "text", text }]` to `content: text`
- Added proper type annotations: `role: "user" as const` and `role: "system" as const`

#### Model Constants
- Replaced missing model constants with environment variables:
  - `MODEL_FULL` → `process.env.LORE_FULL_MODEL || "gpt-4o"`
  - `MODEL_SUMMARY` → `process.env.LORE_SUMMARY_MODEL || "gpt-4o-mini"`
  - `MODEL_CHEAP` → `process.env.LORE_CHEAP_MODEL || "gpt-4o-mini"`

#### Dependencies
- Added `@types/express` package for TypeScript compatibility
- Fixed function return type annotation in `src/qa/diffJson.ts`

### 📚 Documentation Updates
- Updated `README.md` with Next.js 15 compatibility information
- Updated `NEXTJS_UI.md` with detailed compatibility notes
- Updated `DEPLOYMENT.md` with build troubleshooting information
- Added comprehensive changelog documentation

### ✅ Build Status
- **Build Success**: `npm run next:build` now completes successfully
- **TypeScript**: All type checking passes
- **Linting**: All linting rules pass
- **Production Ready**: Ready for Netlify deployment

### 🎯 Impact
- **Netlify Deployment**: Resolves all build failures for production deployment
- **Developer Experience**: Improved TypeScript error messages and type safety
- **Future Compatibility**: Ensures compatibility with Next.js 15+ features
- **Maintainability**: Cleaner code with proper type annotations

### 🔄 Migration Notes
- No breaking changes for existing functionality
- All existing CLI commands continue to work
- Environment variables for model selection are now properly supported
- Build process is more robust and reliable
