# Deployment Guide

> Update (2025-09-11): The new Lore UI surface (hero • features • how‑it‑works • workbench) is live and token-aligned (parchment background, purple primary, serif headings via next/font). A Playwright smoke test for `/` is included.
>
> Quick dev + smoke test:
> ```bash
> npm run next:dev
> # open the port printed in the terminal (e.g., http://localhost:3000 or 3005)
> 
> # adjust BASE_URL to your dev port
> PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
> ```

## UI Guidelines

All UI work in this repo follows the UI Guidelines at `.clinerules/ui-guidelines.md`. Treat them as non‑negotiable defaults for Next.js pages/components, Tailwind styles, and shadcn/ui primitives.

Key points for deploy-ready UI:
- Semantic HTML with keyboard support and visible focus states.
- Use design tokens (CSS variables) via Tailwind; avoid hard-coded colors/sizes.
- Compose shadcn/ui primitives; use `cva` for variants; use `cn()` to merge classes.
- Mobile-first responsive; dark/light compatible; no console errors.
- Forms: react-hook-form + zod; lift to Zustand only when truly global.
- Add/maintain a minimal Playwright smoke test for any new route.

## Netlify Deployment

### Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **GitHub Repository**: Your LoreGen project should be in a GitHub repository
3. **OpenAI API Key**: Added to Netlify secrets as `OPENAI_API_KEY`
4. **Next.js 15 Compatibility**: All TypeScript errors resolved for Next.js 15 deployment
5. **Database Setup**: Optional Postgres database via Netlify (Neon) for enhanced performance

### Deployment Steps

#### 1. Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Choose "GitHub" and authorize Netlify
4. Select your LoreGen repository
5. Configure build settings:
   - **Build command**: `npm run next:build`
   - **Publish directory**: `.next`
   - **Node version**: 18

#### 2. Environment Variables

In Netlify dashboard, go to Site settings > Environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key (already added as secret)
- `NODE_ENV`: `production`
- `DATA_ROOT`: Leave empty (defaults to current directory)
- `NETLIFY_DATABASE_URL`: Automatically set when using Netlify database (optional)

#### 3. Build Configuration

The `netlify.toml` file is already configured with:

```toml
[build]
  command = "npm install && npm run next:build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--production=false"

# Serve static assets
[[redirects]]
  from = "/assets/*"
  to = "/assets/:splat"
  status = 200

# Next.js App Router - all routes go to index.html for client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Important**: The build command includes `npm install` to ensure all dependencies are properly installed before building. This prevents the "next: not found" error during deployment.

#### 4. Database Setup (Optional)

For enhanced performance and scalability, you can set up a Postgres database using Netlify DB (powered by Neon):

1. **Initialize Database Locally**:
   ```bash
   npm run db:init
   ```

2. **Import Existing Data**:
   ```bash
   npm run db:import
   ```

3. **Auto-provision on Deploy**:
   - Install `@netlify/neon` package (already included)
   - Database will be automatically created during build
   - Connection string will be available as `NETLIFY_DATABASE_URL`
   - Database is permanently provisioned with generous free tier

#### 4. Deploy

1. Click "Deploy site" in Netlify
2. Wait for build to complete
3. Your site will be available at `https://your-site-name.netlify.app`

### Troubleshooting

#### Build Failures

**Database Connection Errors During Build**
If you encounter errors like "Failed to instantiate Neon client: connection string is not provided", this is expected during the build process. The application automatically falls back to JSON files when the database connection isn't available.

**Common Build Issues:**
- **Missing NETLIFY_DATABASE_URL**: This is normal during build - pages use JSON fallback
- **TypeScript Errors**: Ensure all pages use proper typing for JSON data structures
- **Missing Dependencies**: Run `npm install` locally to verify all packages are available

**Build Success Indicators:**
- ✅ "Compiled successfully" message
- ✅ "Linting and checking validity of types" passes
- ✅ "Collecting page data" completes without errors
- ✅ "Generating static pages" shows all routes

### Important Notes

#### Data Requirements

The Next.js UI expects the following data structure to be present:

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

#### Pipeline Integration

The UI includes API routes that execute CLI commands:

- `/api/hooks/accept` - Accept hook suggestions
- `/api/quests/activate` - Activate quest chains
- `/api/events/plan` - Plan event effects
- `/api/events/apply` - Apply event effects
- `/api/ops/overlays/build` - Build overlays
- `/api/ops/render/dirty` - Render dirty entities

These routes require the LoreGen CLI to be available in the deployment environment.

#### Database vs JSON Files

**JSON Files (Default)**:
- All data stored in static JSON files
- Good for simple deployments and small datasets
- No database setup required
- All pages pre-rendered at build time
- **Automatic Fallback**: Pages automatically use JSON files when database unavailable

**Database Integration**:
- Enhanced performance with Postgres queries
- Real-time data updates
- **Graceful Fallback**: Automatically falls back to JSON files during build
- **Build Compatibility**: No database connection required for successful builds

**Postgres Database (Optional)**:
- Enhanced performance for larger datasets
- Better querying capabilities with SQL
- Foundation for real-time features
- Automatic provisioning on Netlify
- Type-safe queries with Drizzle ORM

#### Static vs Dynamic

**Current Setup**: Static deployment with client-side routing
- All pages are pre-rendered at build time
- API routes are not functional in static deployment
- Good for viewing generated content

**For Full Functionality**: Consider Vercel or Netlify Functions
- API routes would work with serverless functions
- Real-time CLI integration possible
- More complex deployment setup

### Troubleshooting

#### Build Failures

1. **Missing Dependencies**: Ensure all dependencies are in `package.json`
2. **TypeScript Errors**: Fix any TypeScript compilation errors (Next.js 15 compatibility resolved)
3. **Missing Data**: Ensure required data files exist
4. **Next.js 15 Issues**: All async params and type issues have been resolved
5. **"next: not found" Error**: Fixed by adding `npm install` to build command in `netlify.toml`

#### Runtime Issues

1. **404 Errors**: Check redirect rules in `netlify.toml`
2. **Asset Loading**: Verify asset paths and redirects
3. **API Errors**: API routes won't work in static deployment

#### Performance

1. **Large Data Files**: Consider pagination for large datasets
2. **Image Optimization**: Use Next.js Image component for heraldry
3. **Caching**: Leverage Netlify's CDN for static assets

### Alternative Deployments

#### Vercel (Recommended for Full Functionality)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Environment variables in Vercel dashboard
OPENAI_API_KEY=your_key_here
```

#### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run next:build
EXPOSE 3000
CMD ["npm", "run", "next:start"]
```

### Security Considerations

1. **API Keys**: Never commit API keys to repository
2. **CLI Commands**: Whitelist only necessary npm scripts
3. **File Access**: Limit file system access to required directories
4. **Rate Limiting**: Implement rate limiting for API routes

### Monitoring

1. **Build Logs**: Monitor Netlify build logs for errors
2. **Function Logs**: Check serverless function logs if using functions
3. **Performance**: Use Netlify Analytics for performance monitoring
4. **Errors**: Set up error tracking (Sentry, etc.)

### Updates

To update the deployed site:

1. Push changes to your GitHub repository
2. Netlify will automatically trigger a new build
3. Monitor build logs for any issues
4. Test the updated site thoroughly
