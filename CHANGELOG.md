# Changelog

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
